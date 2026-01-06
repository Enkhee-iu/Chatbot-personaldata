"use client";
import { useState, useEffect } from "react";
import AdminPanel from "./_components/AdminPanel";
import ChatBot from "./_components/ChatBot";

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
    // Шинэ хүнийг жагсаалтын дээр шууд нэмэх
    setPeople((prev) => [person, ...prev]);
    // Баазаас дахин шинэчилж татах
    setTimeout(fetchPeople, 1000); 
  };

  // УСТГАХ ФУНКЦ
  const handleDelete = async (id: string) => {
    if (!id) {
      alert("ID олдсонгүй!");
      return;
    }

    if (window.confirm("Та энэ бүртгэлийг устгахдаа итгэлтэй байна уу?")) {
      try {
        const response = await fetch(`/api/delete-person?id=${id}`, { 
          method: 'DELETE' 
        });

        if (response.ok) {
          // Амжилттай болбол state-ээс хасаж жагсаалтыг шинэчлэх
          setPeople((prev) => prev.filter(p => (p.id || p._id) !== id));
          alert("Амжилттай устгагдлаа.");
        } else {
          alert("Устгахад алдаа гарлаа.");
        }
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Сервертэй холбогдоход алдаа гарлаа.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-3rem)]">
        
        {/* ЗҮҮН ТАЛ: Админ ба Жагсаалт */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="flex-shrink-0">
            <AdminPanel onPersonAdded={handlePersonAdded} />
          </div>
          
          {/* БҮРТГЭЛИЙН ЖАГСААЛТ */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4  bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Бүртгэл</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-600 font-medium">
                  {people.length} хүн
                </span>
                <button 
                  onClick={fetchPeople}
                  className="p-1  rounded-full transition-colors"
                  title="Шинэчлэх"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              {isLoading && people.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center ">
                  <span className="animate-spin text-2xl mb-2">⟳</span>
                  <p className="text-sm">Уншиж байна...</p>
                </div>
              ) : people.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center  p-4 text-center">
                  <p className="text-4xl mb-2">📂</p>
                  <p className="text-sm">Мэдээллийн санд өгөгдөл алга.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {people.map((p, i) => (
                    <div key={p.id || i} className="p-3 border-gray-200 rounded-lg bg-white hover:border-blue-200 transition-all shadow-sm group">
                      <div className="flex justify-between items-start ">
                        <div>
                          <p className="font-bold ">{p.lastName} {p.firstName}</p>
                          <p className="text-[10px] ">{p.timestamp || "N/A"}</p>
                        </div>

                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors border border-transparent hover:border-red-100"
                          title="Устгах"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="text-xs  text-gray-600 mt-2 pt-2 border-t border-gray-50 space-y-1">
                        <p><span className="">Регистр:</span> {p.registerId}</p>
                        {p.phone && <p><span className="">Утас:</span> {p.phone}</p>}
                        {p.Address && <p className="truncate"><span className="">Хаяг:</span> {p.Address}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* БАРУУН ТАЛ: Чатбот */}
        <div className="lg:col-span-8 h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ChatBot />
        </div>
      </div>
    </main>
  );
}