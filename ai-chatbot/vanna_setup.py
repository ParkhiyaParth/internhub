import logging
import os
from urllib.parse import urlparse

from dotenv import load_dotenv
from groq import Groq
from vanna.legacy.base import VannaBase
from vanna.legacy.chromadb import ChromaDB_VectorStore

load_dotenv(override=True)

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)


class InternHubVanna(ChromaDB_VectorStore, VannaBase):
    def __init__(self, config=None):
        config = config or {}
        self._groq_api_key = config.get("groq_api_key") or os.getenv("GROQ_API_KEY")
        self._groq_model = config.get("groq_model") or os.getenv("GROQ_MODEL", "llama3-70b-8192")

        if not self._groq_api_key:
            raise EnvironmentError("GROQ_API_KEY is not set")

        self._groq_client = Groq(api_key=self._groq_api_key)

        chroma_path = config.get("chroma_path") or os.getenv("CHROMA_PATH", "./chroma_db")
        config["path"] = chroma_path

        ChromaDB_VectorStore.__init__(self, config=config)
        VannaBase.__init__(self, config=config)

        logger.info("InternHubVanna initialized with model=%s", self._groq_model)

    def system_message(self, message):
        return {"role": "system", "content": message}

    def user_message(self, message):
        return {"role": "user", "content": message}

    def assistant_message(self, message):
        return {"role": "assistant", "content": message}

    def submit_prompt(self, prompt, **kwargs):
        if prompt is None:
            raise ValueError("Prompt is None")

        response = self._groq_client.chat.completions.create(
            model=self._groq_model,
            messages=prompt,
            temperature=0.2,
            max_tokens=1024,
        )
        return response.choices[0].message.content


def _db_config_from_env():
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        parsed = urlparse(database_url)
        return {
            "host": parsed.hostname or "localhost",
            "port": parsed.port or 5432,
            "dbname": (parsed.path or "/postgres").lstrip("/"),
            "user": parsed.username or "postgres",
            "password": parsed.password or "",
        }

    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "5432")),
        "dbname": os.getenv("DB_NAME", "postgres"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", ""),
    }


_vanna_config = {
    "groq_api_key": os.getenv("GROQ_API_KEY"),
    "groq_model": os.getenv("GROQ_MODEL", "llama3-70b-8192"),
    "chroma_path": os.getenv("CHROMA_PATH", "./chroma_db"),
}

vn = None
_init_error = None
try:
    vn = InternHubVanna(config=_vanna_config)
except Exception as exc:
    _init_error = str(exc)
    logger.warning("Vanna initialization skipped: %s", exc)


def get_vanna_init_error():
    return _init_error


def connect_to_postgres():
    if vn is None:
        raise RuntimeError(_init_error or "Vanna is not initialized")

    cfg = _db_config_from_env()
    logger.info("Connecting to Postgres db=%s host=%s port=%s", cfg["dbname"], cfg["host"], cfg["port"])
    vn.connect_to_postgres(
        host=cfg["host"],
        dbname=cfg["dbname"],
        user=cfg["user"],
        password=cfg["password"],
        port=cfg["port"],
    )
    logger.info("Connected to PostgreSQL")
