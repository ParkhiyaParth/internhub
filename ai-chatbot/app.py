import logging
import os
from contextlib import asynccontextmanager
from typing import Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from vanna_setup import connect_to_postgres, get_vanna_init_error, vn

load_dotenv(override=True)

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    role: Optional[str] = None
    department_names: Optional[List[str]] = None


def _scoped_question(payload: ChatRequest) -> str:
    role = (payload.role or "").strip()
    department_names = payload.department_names or []

    if role != "Manager":
        return payload.question

    if not department_names:
        raise HTTPException(403, "Manager has no assigned departments")

    department_list = ", ".join(department_names)
    return "\n".join(
        [
            "You are answering analytics questions for InternHub.",
            f"User role is Manager with allowed departments: {department_list}.",
            "Return SQL with explicit department filtering and read-only semantics.",
            f"User question: {payload.question}",
        ]
    )


def _ensure_vanna_ready() -> None:
    if vn is None:
        error = get_vanna_init_error() or "Vanna is not initialized"
        raise HTTPException(503, f"AI service is not configured: {error}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting InternHub AI service")
    try:
        connect_to_postgres()
    except Exception as exc:
        logger.error("Postgres connection failed: %s", exc)
    yield
    logger.info("Stopping InternHub AI service")


app = FastAPI(title="InternHub AI SQL API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/v0/config")
async def get_config():
    return {
        "api_base": "/api/v0",
        "product": "InternHub AI SQL",
        "llm_model": os.getenv("GROQ_MODEL", "llama3-70b-8192"),
    }


@app.post("/api/v0/generate_sql")
async def generate_sql(payload: ChatRequest):
    _ensure_vanna_ready()
    question = _scoped_question(payload)
    try:
        sql = vn.generate_sql(question=question)
        return {"sql": sql}
    except Exception as exc:
        logger.error("SQL generation failed: %s", exc)
        raise HTTPException(500, f"Error generating SQL: {exc}")


@app.post("/api/v0/run_sql")
async def run_sql(payload: Dict[str, str]):
    _ensure_vanna_ready()
    sql = payload.get("sql")
    if not sql:
        raise HTTPException(400, "SQL missing")

    try:
        df = vn.run_sql(sql)
        if df is None or df.empty:
            return {"results": [], "columns": []}

        return {
            "results": df.to_dict(orient="records"),
            "columns": list(df.columns),
        }
    except Exception as exc:
        logger.error("SQL execution failed: %s", exc)
        raise HTTPException(500, f"Database error: {exc}")


@app.post("/api/v0/ask")
async def ask(payload: ChatRequest):
    _ensure_vanna_ready()
    question = _scoped_question(payload)
    try:
        sql = vn.generate_sql(question=question)
        df = vn.run_sql(sql)

        results = []
        columns = []
        if df is not None and not df.empty:
            results = df.to_dict(orient="records")
            columns = list(df.columns)

        return {
            "question": payload.question,
            "sql": sql,
            "results": results,
            "columns": columns,
        }
    except Exception as exc:
        logger.error("Ask flow failed: %s", exc)
        raise HTTPException(500, f"Error processing query: {exc}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
