"use client";
import { useState } from "react";

export default function AdminPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    registerId: "",
    phone: "",
    Address: "", // Хаяг нэмэгдсэн
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // САЙЖРУУЛАЛТ: Хаягийг текст рүү нэмлээ. Ингэж байж AI хаягийг мэднэ.
    const fullText = `Овог: ${form.lastName}, Нэр: ${form.firstName}, Регистр: ${form.registerId}, Утас: ${form.phone}, Хаяг: ${form.Address}`;

    const res = await fetch("/api/upsert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        textContent: fullText,
        id: form.registerId || Date.now().toString(), // ID-гүй үед алдаа гарахаас сэргийлнэ
        metadata: form,
      }),
    });

    if (res.ok) {
      alert("Мэдээлэл амжилттай хадгалагдлаа!");
      // Хадгалсны дараа формыг цэвэрлэж болно
      setForm({
        firstName: "",
        lastName: "",
        registerId: "",
        phone: "",
        Address: "",
      });
    } else {
      alert("Алдаа гарлаа, дахин оролдоно уу.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="p-10 flex flex-col gap-4 max-w-md w-full"
      >
        <h1 className="text-xl font-bold mb-4">Мэдээлэл бүртгэх</h1>

        <input
          value={form.lastName}
          placeholder="Овог"
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          value={form.firstName}
          placeholder="Нэр"
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          value={form.registerId}
          placeholder="Регистр"
          onChange={(e) => setForm({ ...form, registerId: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          value={form.phone}
          placeholder="Утас"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          value={form.Address}
          placeholder="Xаяг"
          onChange={(e) => setForm({ ...form, Address: e.target.value })}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Хадгалах
        </button>
      </form>
    </div>
  );
}
