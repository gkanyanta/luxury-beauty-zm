'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Loader2, X, ImagePlus } from 'lucide-react'

interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  country: string | null
  active: boolean
  _count: { products: number }
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [form, setForm] = useState({ name: '', description: '', logoUrl: '', country: '', active: true })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/brands')
      if (res.ok) setBrands(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchBrands() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', logoUrl: '', country: '', active: true })
    setError('')
    setShowForm(true)
  }

  const openEdit = (brand: Brand) => {
    setEditing(brand)
    setForm({
      name: brand.name,
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
      country: brand.country || '',
      active: brand.active,
    })
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
      setForm(f => ({ ...f, logoUrl: data.url }))
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
      const url = editing ? `/api/admin/brands/${editing.id}` : '/api/admin/brands'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to save' }))
        setError(data.error || 'Failed to save brand')
        setSaving(false)
        return
      }
      closeForm()
      fetchBrands()
    } catch {
      setError('Something went wrong')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to delete' }))
        alert(data.error || 'Failed to delete brand')
        setDeleteId(null)
        return
      }
      fetchBrands()
    } catch {
      alert('Something went wrong')
    }
    setDeleteId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Brands</h1>
        <Button onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Add Brand</Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">{editing ? 'Edit Brand' : 'New Brand'}</h2>
            <button onClick={closeForm}><X className="h-4 w-4 text-neutral-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Brand Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            <Input placeholder="Country (optional)" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Logo</label>
              {form.logoUrl && (
                <div className="mb-3 relative inline-block">
                  <img src={form.logoUrl} alt="Logo" className="h-20 w-20 object-contain rounded border" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, logoUrl: '' }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-1">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  Upload Logo
                </Button>
              </div>
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="h-4 w-4 rounded border-neutral-300"
              />
              <span className="text-sm">Active</span>
            </label>

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
              <th className="text-left p-3 font-medium">Logo</th>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Country</th>
              <th className="text-center p-3 font-medium hidden md:table-cell">Active</th>
              <th className="text-center p-3 font-medium">Products</th>
              <th className="p-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-500">Loading...</td></tr>
            ) : brands.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No brands yet</td></tr>
            ) : brands.map(brand => (
              <tr key={brand.id} className="hover:bg-neutral-50">
                <td className="p-3">
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt="" className="h-10 w-10 rounded object-contain shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-neutral-100 shrink-0" />
                  )}
                </td>
                <td className="p-3 font-medium">{brand.name}</td>
                <td className="p-3 hidden sm:table-cell text-neutral-500">{brand.country || '-'}</td>
                <td className="p-3 hidden md:table-cell text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${brand.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {brand.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-center">{brand._count.products}</td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(brand)} className="p-1.5 rounded hover:bg-neutral-100" title="Edit">
                      <Pencil className="h-3.5 w-3.5 text-neutral-500" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${brand.name}"?`)) handleDelete(brand.id) }}
                      disabled={deleteId === brand.id}
                      className="p-1.5 rounded hover:bg-red-50"
                      title="Delete"
                    >
                      {deleteId === brand.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" /> : <Trash2 className="h-3.5 w-3.5 text-red-500" />}
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
