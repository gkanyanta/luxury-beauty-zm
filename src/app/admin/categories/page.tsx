'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  _count: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) setCategories(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', imageUrl: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '' })
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to save' }))
        setError(data.error || 'Failed to save category')
        setSaving(false)
        return
      }
      closeForm()
      fetchCategories()
    } catch {
      setError('Something went wrong')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to delete' }))
        alert(data.error || 'Failed to delete category')
        setDeleteId(null)
        return
      }
      fetchCategories()
    } catch {
      alert('Something went wrong')
    }
    setDeleteId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">{editing ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={closeForm}><X className="h-4 w-4 text-neutral-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input placeholder="Category Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            <Input placeholder="Image URL (optional)" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Slug</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Description</th>
              <th className="text-center p-3 font-medium">Products</th>
              <th className="p-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-neutral-500">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No categories yet</td></tr>
            ) : categories.map(cat => (
              <tr key={cat.id} className="hover:bg-neutral-50">
                <td className="p-3 font-medium">{cat.name}</td>
                <td className="p-3 hidden sm:table-cell text-neutral-500">{cat.slug}</td>
                <td className="p-3 hidden md:table-cell text-neutral-500 truncate max-w-[200px]">{cat.description || '-'}</td>
                <td className="p-3 text-center">{cat._count.products}</td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded hover:bg-neutral-100" title="Edit">
                      <Pencil className="h-3.5 w-3.5 text-neutral-500" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${cat.name}"?`)) handleDelete(cat.id) }}
                      disabled={deleteId === cat.id}
                      className="p-1.5 rounded hover:bg-red-50"
                      title="Delete"
                    >
                      {deleteId === cat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" /> : <Trash2 className="h-3.5 w-3.5 text-red-500" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
