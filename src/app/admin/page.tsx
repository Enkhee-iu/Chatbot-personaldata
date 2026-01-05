'use client'
import { useState } from 'react'

export default function AdminPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', registerId: '', phone: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/upsert', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    if (res.ok) alert('Мэдээлэл амжилттай хадгалагдлаа!')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-4 max-w-md">
      <input placeholder="Овог" onChange={e => setForm({...form, lastName: e.target.value})} className="border p-2" />
      <input placeholder="Нэр" onChange={e => setForm({...form, firstName: e.target.value})} className="border p-2" />
      <input placeholder="Регистр" onChange={e => setForm({...form, registerId: e.target.value})} className="border p-2" />
      <input placeholder="Утас" onChange={e => setForm({...form, phone: e.target.value})} className="border p-2" />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Хадгалах</button>
    </form>
    </div>
  )
}