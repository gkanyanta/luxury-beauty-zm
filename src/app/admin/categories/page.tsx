'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Loader2, X, Check, ImagePlus } from 'lucide-react'

interface ProductWithImage {
  id: string
  name: string
  images: { url: string }[]
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  _count: { products: number }
  products: ProductWithImage[]
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(data.error || 'Upload failed')
      }
      const data = await res.json()
      setForm(f => ({ ...f, imageUrl: data.url }))
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
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

  const editingProducts = editing?.products?.filter(p => p.images.length > 0) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">{editing ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={closeForm}><X className="h-4 w-4 text-neutral-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Category Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />

            {/* Cover image */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Cover Image</label>
              {form.imageUrl && (
                <div className="mb-3 relative inline-block">
                  <img src={form.imageUrl} alt="Cover" className="h-32 w-48 object-cover rounded border" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Upload button */}
              <div className="flex gap-2 mb-3">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-1">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  Upload Image
                </Button>
              </div>

              {/* Product image picker */}
              {editing && editingProducts.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Or choose from product images:</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {editingProducts.map(p => {
                      const imgUrl = p.images[0].url
                      const isSelected = form.imageUrl === imgUrl
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, imageUrl: imgUrl }))}
                          className={`relative rounded border-2 overflow-hidden transition-all ${isSelected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-transparent hover:border-neutral-300'}`}
                          title={p.name}
                        >
                          <img src={imgUrl} alt={p.name} className="h-16 w-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                              <Check className="h-5 w-5 text-amber-700" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

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
              <th className="text-left p-3 font-medium">Category</th>
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
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-neutral-100 shrink-0" />
                    )}
                    <span className="font-medium">{cat.name}</span>
                  </div>
                </td>
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
