"use client";
import { useState, useEffect } from "react";
import AdminPanel from "@/components/AdminPanel";
import ChatBot from "@/components/ChatBot";
import { Maximize2, X, Trash2, CheckSquare, Square } from "lucide-react";

export default function Home() {
  const [people, setPeople] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal & Selection State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    fetchPeople();
  }, []);

  const handlePersonAdded = (person: any) => {
    setPeople((prev) => [person, ...prev]);
    setTimeout(fetchPeople, 1000); 
  };

  // Checkbox toggle logic
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select All logic
  const toggleSelectAll = () => {
    if (selectedIds.size === people.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(people.map(p => p.id)));
    }
  };

  // Delete logic
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Та сонгогдсон ${selectedIds.size} мэдээллийг устгахдаа итгэлтэй байна уу?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        alert("Амжилттай устгагдлаа!");
        setSelectedIds(new Set()); // Clear selection
        fetchPeople(); // Refresh list
      } else {
        alert("Устгахад алдаа гарлаа.");
      }
    } catch (error) {
      console.error(error);
      alert("Сүлжээний алдаа.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-3rem)]">
        
        {/* Left Column: Admin & List Preview */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="flex-shrink-0">
            <AdminPanel onPersonAdded={handlePersonAdded} />
          </div>
          
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Бүртгэл</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors font-medium"
              >
                See More <Maximize2 size={12} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-2 flex-1">
              {isLoading && people.length === 0 ? (
                 <div className="p-4 text-center text-gray-500">Уншиж байна...</div>
              ) : people.length === 0 ? (
                <div className="p-4 text-center text-gray-400">Мэдээлэл алга</div>
              ) : (
                <div className="space-y-2">
                  {/* Show only first 5 items in preview */}
                  {people.slice(0, 5).map((p, i) => (
                    <div key={p.id || i} className="p-3 border rounded-lg bg-gray-50">
                      <div className="font-medium text-sm">{p.lastName} {p.firstName}</div>
                      <div className="text-xs text-gray-500">{p.registerId}</div>
                    </div>
                  ))}
                  {people.length > 5 && (
                    <div className="text-center text-xs text-gray-400 py-2">
                      + цаана нь {people.length - 5} хүн байна
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: ChatBot */}
        <div className="lg:col-span-8 h-full">
          <ChatBot />
        </div>
      </div>

      {/* FULL SCREEN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">Бүх бүртгэл ({people.length})</h2>
                {selectedIds.size > 0 && (
                   <button 
                     onClick={handleDeleteSelected}
                     disabled={isDeleting}
                     className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-2 transition-colors"
                   >
                     <Trash2 size={16} />
                     Устгах ({selectedIds.size})
                   </button>
                )}
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content - Table/List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
               <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50 border-b">
                     <tr>
                       <th className="p-4 text-sm font-semibold text-gray-600">Нэр / Овог</th>
                       <th className="p-4 text-sm font-semibold text-gray-600">Регистр</th>
                       <th className="p-4 text-sm font-semibold text-gray-600">Утас / Хаяг</th>
                       <th className="p-4 text-sm font-semibold text-gray-600 text-right">
                         <button 
                            onClick={toggleSelectAll}
                            className="text-blue-600 hover:text-blue-800 text-xs uppercase font-bold"
                         >
                            {selectedIds.size === people.length ? "Deselect All" : "Select All"}
                         </button>
                       </th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {people.map((p) => {
                       const isSelected = selectedIds.has(p.id);
                       return (
                         <tr 
                            key={p.id} 
                            className={`hover:bg-blue-50/50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => toggleSelection(p.id)} // Row click selects
                          >
                           <td className="p-4">
                             <div className="font-medium text-gray-900">{p.lastName} {p.firstName}</div>
                             <div className="text-xs text-gray-500">{p.timestamp}</div>
                           </td>
                           <td className="p-4 text-gray-600">{p.registerId}</td>
                           <td className="p-4 text-gray-600">
                             <div className="text-sm">{p.phone}</div>
                             <div className="text-xs text-gray-400 truncate max-w-[200px]">{p.Address}</div>
                           </td>
                           <td className="p-4 text-right">
                             {/* Checkbox Button on the Right */}
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation(); // Stop row click
                                 toggleSelection(p.id);
                               }}
                               className={`p-2 rounded-lg transition-all ${
                                 isSelected 
                                   ? 'text-blue-600 bg-blue-100' 
                                   : 'text-gray-300 hover:text-gray-500'
                               }`}
                             >
                               {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                             </button>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
                 
                 {people.length === 0 && (
                   <div className="p-10 text-center text-gray-400">Өгөгдөл олдсонгүй</div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
