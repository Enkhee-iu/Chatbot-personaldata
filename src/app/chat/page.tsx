"use client";
import { useState } from "react";

// 1. Мессежний төрлийг тодорхойлно
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  // 2. useState дээр Message[] төрлийг оноож өгнө
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 3. 'e' параметрт React.FormEvent төрлийг заана
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // API руу хүсэлт илгээх
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) throw new Error("API хүсэлт амжилтгүй");

      const data = await res.json();

      // AI-ийн хариултыг нэмэх
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message || data.text || "Хариулт олдсонгүй",
        },
      ]);
    } catch (error) {
      console.error("Алдаа гарлаа:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Туслах (Хүний нөөц)</h1>

      {/* Чатны хэсэг */}
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50 mb-4 space-y-4">
        {messages.map((m, index) => (
          <div
            key={index}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-gray-500 animate-pulse">
            AI хариулж байна...
          </div>
        )}
      </div>

      {/* Мессеж бичих хэсэг */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Нэр эсвэл регистр бичнэ үү..."
          className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Илгээх
        </button>
      </form>
    </div>
  );
}
