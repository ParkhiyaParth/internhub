"use client";

import { askChatbot, type ChatbotResponse } from "@/services/ChatbotApi";
import { Bot, Code2, Database, MessageCircle, Send, User, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Role = "Admin" | "Manager" | "HR" | "Intern";

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  payload?: ChatbotResponse;
};

const ALLOWED_CHATBOT_ROLES: Role[] = ["Admin", "Manager"];

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function buildAnswerSummary(payload: ChatbotResponse): string {
  const rowCount = payload.results.length;
  if (!rowCount) return "No matching records were found for your question.";

  if (payload.columns.length === 2) {
    const first = payload.results[0];
    const leftCol = payload.columns[0];
    const rightCol = payload.columns[1];
    return `Top result: ${formatCellValue(first[leftCol])} -> ${formatCellValue(first[rightCol])}`;
  }

  return `Query completed successfully with ${rowCount} row(s).`;
}

export default function ChatbotWidget() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const role = (session?.user?.role || "") as Role;
  const canUseChatbot = useMemo(() => {
    if (status !== "authenticated") return false;
    return ALLOWED_CHATBOT_ROLES.includes(role);
  }, [role, status]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  if (!canUseChatbot) {
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = question.trim();
    if (!value || isLoading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      text: value,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const payload = await askChatbot(value);
      const botText = payload.notice
        ? payload.notice
        : buildAnswerSummary(payload);

      const botMessage: ChatMessage = {
        id: `${Date.now()}-b`,
        role: "bot",
        text: botText,
        payload,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: "bot",
          text: message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="flex h-[72vh] w-[min(96vw,460px)] flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-100 to-blue-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">InternHub Assistant</p>
              <p className="text-xs text-slate-500">Role: {role}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-slate-600 hover:bg-slate-200"
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-800">Try asking:</p>
                <p className="mt-1">How many interns are in each department?</p>
                <p>Top 3 interns by overall evaluation score</p>
                <p>How many users joined in the last 30 days by role?</p>
              </div>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[92%] rounded-xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-blue-600 text-white shadow"
                    : "mr-auto border border-slate-200 bg-white text-slate-800 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === "user" ? <User size={16} className="mt-0.5 shrink-0" /> : <Bot size={16} className="mt-0.5 shrink-0 text-blue-600" />}
                  <div className="w-full">
                    <p>{message.text}</p>

                    {message.role === "bot" && message.payload ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                            {message.payload.results.length} rows
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                            {message.payload.columns.length} columns
                          </span>
                          {message.payload.role ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                              role: {message.payload.role}
                            </span>
                          ) : null}
                        </div>

                        {message.payload.scopedToDepartments?.length ? (
                          <p className="text-xs text-slate-500">
                            Department scope: {message.payload.scopedToDepartments.join(", ")}
                          </p>
                        ) : null}

                        {message.payload.columns?.length ? (
                          <div className="overflow-x-auto rounded-md border border-slate-200">
                            <table className="min-w-full text-xs">
                              <thead className="bg-slate-100">
                                <tr>
                                  {message.payload.columns.map((col) => (
                                    <th key={col} className="whitespace-nowrap px-2 py-1 text-left font-semibold text-slate-700">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {message.payload.results.slice(0, 8).map((row, index) => (
                                  <tr key={index} className="border-t border-slate-100 odd:bg-white even:bg-slate-50/60">
                                    {message.payload?.columns?.map((col) => (
                                      <td key={`${index}-${col}`} className="whitespace-nowrap px-2 py-1 text-slate-700">
                                        {formatCellValue(row[col])}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}

                        {message.payload.sql ? (
                          <details className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-slate-600">
                              <Code2 size={12} />
                              Show SQL
                            </summary>
                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[11px] text-slate-600">{message.payload.sql}</pre>
                          </details>
                        ) : null}

                        {message.payload.results.length > 8 ? (
                          <p className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Database size={12} />
                            Showing first 8 rows for readability
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="mr-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                <div className="flex items-center gap-2">
                  <Bot size={14} className="text-blue-600" />
                  <span>Generating answer</span>
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question..."
                className="h-10 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-50 disabled:grayscale"
                aria-label="Send question"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:scale-105"
          aria-label="Open chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}
