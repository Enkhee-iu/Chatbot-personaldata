"use client";
import { useState, useEffect } from "react";
import AdminPanel from "@/components/AdminPanel";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  const [people, setPeople] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pinecone-оос өгөгдөл татах функц
  const fetchPeople = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/people");
      if (res.ok) {
        const data = await res.json();
        if (data.people) {
          setPeople(data.people);
        }
      }
    } catch (error) {
      console.error("Failed to fetch people:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Хуудас ачаалагдахад өгөгдөл татах
  useEffect(() => {
    fetchPeople();
  }, []);

  const handlePersonAdded = (person: any) => {
    // Шинээр хүн нэмэгдмэгц жагсаалтыг дахин татах
    // Эсвэл хурдан харагдуулахын тулд шууд state рүү нэмж болно
    setPeople((prev) => [person, ...prev]);
    // Баталгаажуулж дахин татах (optional)
    setTimeout(fetchPeople, 1000); 
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-3rem)]">
        
        {/* Зүүн тал: Админ хэсэг (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="flex-shrink-0">
            <AdminPanel onPersonAdded={handlePersonAdded} />
          </div>
          
          {/* Нэмэгдсэн хүмүүсийн жагсаалт (Pinecone-оос) */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Бүртгэл (Pinecone)</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                  {people.length}
                </span>
                <button 
                  onClick={fetchPeople}
                  className="text-xs text-blue-500 hover:text-blue-700 p-1"
                  title="Шинэчлэх"
                >
                  🔄
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto p-2 flex-1">
              {isLoading && people.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <span className="animate-spin text-2xl mb-2">⟳</span>
                  <p className="text-sm">Уншиж байна...</p>
                </div>
              ) : people.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <p className="text-4xl mb-2">📂</p>
                  <p className="text-sm">Мэдээллийн санд одоогоор өгөгдөл алга.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {people.map((p, i) => (
                    <div key={p.id || i} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-800">{p.lastName} {p.firstName}</span>
                        {/* Timestamp might not be in metadata, show placeholder or formatted date if available */}
                        <span className="text-xs text-gray-500">
                             {p.timestamp || "N/A"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>Регистр: {p.registerId}</p>
                        {p.phone && <p>Утас: {p.phone}</p>}
                        {p.Address && <p className="truncate">Хаяг: {p.Address}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Баруун тал: Чатбот (8/12) */}
        <div className="lg:col-span-8 h-full">
          <ChatBot />
        </div>
      </div>
    </main>
  );
}
