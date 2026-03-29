import { db } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/requireRole";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const askSchema = z.object({
  question: z.string().min(3).max(500),
});

const AI_CHATBOT_API_URL = process.env.AI_CHATBOT_API_URL || "http://localhost:8000/api/v0/ask";
const ALLOWED_ROLES = ["Admin", "Manager"] as const;

function isReadOnlySql(sql: string): boolean {
  const normalized = sql.trim().replace(/^```sql|```$/gim, "").trim();
  return /^(select|with)\b/i.test(normalized);
}

function buildScopedQuestion(question: string, role: string, departmentNames: string[]): string {
  if (role !== "Manager") {
    return question;
  }

  const list = departmentNames.length ? departmentNames.join(", ") : "(none)";

  return [
    "You are generating SQL for InternHub analytics.",
    `User role is Manager and can only access departments: ${list}.`,
    "Always include a department filter and never query data outside these departments.",
    "Return read-only SQL only.",
    `User question: ${question}`,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req, [...ALLOWED_ROLES]);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;

  if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
    return NextResponse.json({ message: "Chatbot is disabled for your role" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = askSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid question payload", errors: parsed.error.issues }, { status: 400 });
  }

  let departmentNames: string[] = [];

  if (role === "Manager") {
    const userId = Number(session.user.id);

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ message: "Invalid session user id" }, { status: 400 });
    }

    const manager = await db.user.findUnique({
      where: { id: userId },
      select: {
        departmentsManaged: {
          select: { name: true },
        },
      },
    });

    departmentNames = manager?.departmentsManaged.map((item) => item.name) || [];

    if (!departmentNames.length) {
      return NextResponse.json(
        { message: "No department scope assigned to this manager account" },
        { status: 403 },
      );
    }
  }

  const scopedQuestion = buildScopedQuestion(parsed.data.question, role, departmentNames);

  try {
    const response = await fetch(AI_CHATBOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: scopedQuestion,
        role,
        department_names: departmentNames,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: payload?.detail || payload?.message || "Chatbot backend request failed" },
        { status: 502 },
      );
    }

    const sql = typeof payload.sql === "string" ? payload.sql : "";

    if (sql && !isReadOnlySql(sql)) {
      return NextResponse.json({ message: "Only read-only SQL is allowed" }, { status: 400 });
    }

    if (role === "Manager" && sql && !/department\b|departmentid|department_id/i.test(sql)) {
      return NextResponse.json(
        { message: "Generated SQL is missing department scope. Please ask a more specific question." },
        { status: 400 },
      );
    }

    const rawResults = Array.isArray(payload.results) ? payload.results : [];

    return NextResponse.json(
      {
        question: parsed.data.question,
        role,
        scopedToDepartments: departmentNames,
        sql,
        columns: Array.isArray(payload.columns) ? payload.columns : [],
        results: rawResults.slice(0, 200),
        notice: rawResults.length > 200 ? "Showing first 200 rows" : undefined,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Chatbot ask route failed", error);
    return NextResponse.json(
      { message: "Unable to reach AI chatbot backend" },
      { status: 500 },
    );
  }
}
