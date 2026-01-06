"use client";
import { useState } from "react";

interface AdminPanelProps {
  onPersonAdded: (person: any) => void;
}

export default function AdminPanel({ onPersonAdded }: AdminPanelProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    registerId: "",
    phone: "",
    Address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Backend API (route.js) expects flat fields based on our analysis
      const res = await fetch("/api/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        // Parent component руу мэдээллийг дамжуулах
        onPersonAdded({ ...form, timestamp: new Date().toLocaleTimeString() });
        
        alert("Мэдээлэл амжилттай хадгалагдлаа!");
        setForm({
          firstName: "",
          lastName: "",
          registerId: "",
          phone: "",
          Address: "",
        });
      } else {
        const errorData = await res.json();
        alert(`Алдаа гарлаа: ${errorData.error || "Тодорхойгүй алдаа"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Сүлжээний алдаа гарлаа.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>👤</span> Шинэ ажилтан бүртгэх
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Овог</label>
            <input
              value={form.lastName}
              placeholder="Болд"
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium placeholder:text-gray-400"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Нэр</label>
            <input
              value={form.firstName}
              placeholder="Дорж"
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium placeholder:text-gray-400"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Регистрийн дугаар</label>
          <input
            value={form.registerId}
            placeholder="УБ90010101"
            onChange={(e) => setForm({ ...form, registerId: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium placeholder:text-gray-400"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Утасны дугаар</label>
          <input
            value={form.phone}
            placeholder="99119911"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Гэрийн хаяг</label>
          <input
            value={form.Address}
            placeholder="ХУД, 11-р хороо..."
            onChange={(e) => setForm({ ...form, Address: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium placeholder:text-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-70 flex justify-center items-center"
        >
          {isSubmitting ? (
            <span className="animate-spin mr-2">⟳</span>
          ) : null}
          {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </form>
    </div>
  );
}
