"use client";
import { useState, useRef, useEffect } from "react";

// 1. Мессежний төрлийг тодорхойлно
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  // 2. useState дээр Message[] төрлийг оноож өгнө
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse chat messages", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, isInitialized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearHistory = () => {
    if (confirm("Чатны түүхийг устгахдаа итгэлтэй байна уу?")) {
      setMessages([]);
      localStorage.removeItem("chatMessages");
    }
  };

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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Уучлаарай, алдаа гарлаа. Та дахин оролдоно уу.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) return null; // Avoid hydration mismatch

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg text-gray-800">AI Туслах</h2>
          <p className="text-xs text-gray-500">Байгууллагын мэдээлэлд суурилсан чатбот</p>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-transparent hover:border-red-200 transition-colors"
          >
            Түүх цэвэрлэх
          </button>
        )}
      </div>

      {/* Чатны хэсэг */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p>Сайн байна уу? Танд юугаар туслах вэ?</p>
          </div>
        )}
        {messages.map((m, index) => (
          <div
            key={index}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none text-gray-500 text-sm animate-pulse">
              Бодож байна...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Мессеж бичих хэсэг */}
      <div className="p-4 bg-gray-50">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Асуултаа бичнэ үү..."
            className="flex-1 border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Илгээх
          </button>
        </form>
      </div>
    </div>
  );
}