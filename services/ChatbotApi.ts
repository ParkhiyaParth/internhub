export type ChatbotResponse = {
  question: string;
  sql?: string;
  results: Record<string, unknown>[];
  columns: string[];
  role: string;
  scopedToDepartments?: string[];
  notice?: string;
};

export async function askChatbot(question: string): Promise<ChatbotResponse> {
  const response = await fetch("/api/chatbot/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || "Unable to process chatbot request";
    throw new Error(message);
  }

  return data as ChatbotResponse;
}
