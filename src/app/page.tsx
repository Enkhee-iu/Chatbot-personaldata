"use client";
import { useState, useEffect } from "react";
import AdminPanel from "@/components/AdminPanel";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  const [addedPeople, setAddedPeople] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load added people from localStorage on mount
  useEffect(() => {
    const savedPeople = localStorage.getItem("addedPeople");
    if (savedPeople) {
      try {
        setAddedPeople(JSON.parse(savedPeople));
      } catch (e) {
        console.error("Failed to parse added people", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save added people to localStorage whenever the list changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("addedPeople", JSON.stringify(addedPeople));
    }
  }, [addedPeople, isInitialized]);

  const handlePersonAdded = (person: any) => {
    // Шинээр нэмэгдсэн хүнийг жагсаалтын хамгийн дээр гаргах
    setAddedPeople((prev) => [person, ...prev]);
  };

  const clearPeopleHistory = () => {
    if (confirm("Бүртгэлийн түүхийг цэвэрлэхдээ итгэлтэй байна уу?")) {
      setAddedPeople([]);
      localStorage.removeItem("addedPeople");
    }
  };

  if (!isInitialized) return null; // Avoid hydration mismatch

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-3rem)]">
        
        {/* Зүүн тал: Админ хэсэг (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="flex-shrink-0">
            <AdminPanel onPersonAdded={handlePersonAdded} />
          </div>
          
          {/* Нэмэгдсэн хүмүүсийн жагсаалт */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Бүртгэл</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                  {addedPeople.length}
                </span>
                {addedPeople.length > 0 && (
                  <button 
                    onClick={clearPeopleHistory}
                    className="text-xs text-red-500 hover:text-red-700"
                    title="Түүх цэвэрлэх"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-y-auto p-2 flex-1">
              {addedPeople.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <p className="text-4xl mb-2">📋</p>
                  <p className="text-sm">Одоогоор шинэ мэдээлэл нэмэгдээгүй байна.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {addedPeople.map((p, i) => (
                    <div key={i} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-800">{p.lastName} {p.firstName}</span>
                        <span className="text-xs text-gray-500">{p.timestamp}</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>Регистр: {p.registerId}</p>
                        {p.phone && <p>Утас: {p.phone}</p>}
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
