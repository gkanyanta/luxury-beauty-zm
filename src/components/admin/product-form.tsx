'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Trash2, ImagePlus } from 'lucide-react'

interface ProductFormProps {
  product?: any
  categories: any[]
  brands: any[]
}

export function ProductForm({ product, categories, brands }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compareAtPrice: product?.compareAtPrice?.toString() || '',
    sku: product?.sku || '',
    stock: product?.stockQty?.toString() || '0',
    categoryId: product?.categoryId || '',
    brandId: product?.brandId || '',
    status: product?.status || 'DRAFT',
    featured: product?.featured || false,
    volume: product?.volume || '',
    ingredients: product?.ingredients || '',
    howToUse: product?.howToUse || '',
    skinTypes: product?.skinTypes?.join(', ') || '',
    concerns: product?.concerns?.join(', ') || '',
    fragranceFamily: product?.fragranceFamily || '',
    topNotes: product?.topNotes || '',
    middleNotes: product?.middleNotes || '',
    baseNotes: product?.baseNotes || '',
    concentration: product?.concentration || '',
  })

  const [images, setImages] = useState<string[]>(product?.images?.map((i: any) => i.url) || [])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [variants, setVariants] = useState<any[]>(product?.variants || [])

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const addImage = () => {
    if (newImageUrl) { setImages(prev => [...prev, newImageUrl]); setNewImageUrl('') }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    setError('')
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Upload failed' }))
          throw new Error(data.error || 'Upload failed')
        }
        const data = await res.json()
        urls.push(data.url)
      }
      setImages(prev => [...prev, ...urls])
    } catch (err: any) {
      setError(err.message || 'Failed to upload one or more images')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addVariant = () => {
    setVariants(prev => [...prev, { name: '', sku: '', price: 0, stock: 0, active: true }])
  }

  const updateVariant = (idx: number, field: string, value: any) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stock: parseInt(form.stock),
        skinTypes: form.skinTypes ? form.skinTypes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        concerns: form.concerns ? form.concerns.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        images,
        variants: variants.map(v => ({ name: v.name, sku: v.sku || null, price: parseFloat(v.price), stock: parseInt(v.stock), active: v.active })),
      }

      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        let message = 'Failed to save product'
        try { const data = await res.json(); message = data.error || message } catch {}
        throw new Error(message)
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="font-medium">Basic Information</h2>
        <Input placeholder="Product Name *" value={form.name} onChange={e => update('name', e.target.value)} required />
        <Textarea placeholder="Description" value={form.description} onChange={e => update('description', e.target.value)} rows={4} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input type="number" step="0.01" placeholder="Price *" value={form.price} onChange={e => update('price', e.target.value)} required />
          <Input type="number" step="0.01" placeholder="Compare Price" value={form.compareAtPrice} onChange={e => update('compareAtPrice', e.target.value)} />
          <Input placeholder="SKU" value={form.sku} onChange={e => update('sku', e.target.value)} />
          <Input type="number" placeholder="Stock" value={form.stock} onChange={e => update('stock', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Select value={form.categoryId} onValueChange={v => update('categoryId', v)}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.brandId} onValueChange={v => update('brandId', v)}>
            <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
            <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.status} onValueChange={v => update('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={e => update('featured', e.target.checked)} className="accent-amber-800" /> Featured product
        </label>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg border p-6 space-y-3">
        <h2 className="font-medium">Images</h2>
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
              <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-1">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Browse Files
          </Button>
          <Input placeholder="Image URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="flex-1" />
          <Button type="button" variant="outline" onClick={addImage}>Add</Button>
        </div>
      </div>

      {/* Skincare details */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="font-medium">Skincare Details (optional)</h2>
        <Input placeholder="Volume (e.g. 50ml)" value={form.volume} onChange={e => update('volume', e.target.value)} />
        <Textarea placeholder="Ingredients" value={form.ingredients} onChange={e => update('ingredients', e.target.value)} rows={2} />
        <Textarea placeholder="How to Use" value={form.howToUse} onChange={e => update('howToUse', e.target.value)} rows={2} />
        <Input placeholder="Skin Types (comma-separated: oily, dry, combination)" value={form.skinTypes} onChange={e => update('skinTypes', e.target.value)} />
        <Input placeholder="Concerns (comma-separated: acne, aging, hydration)" value={form.concerns} onChange={e => update('concerns', e.target.value)} />
      </div>

      {/* Fragrance details */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="font-medium">Fragrance Details (optional)</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Fragrance Family" value={form.fragranceFamily} onChange={e => update('fragranceFamily', e.target.value)} />
          <Input placeholder="Concentration (EDP, EDT...)" value={form.concentration} onChange={e => update('concentration', e.target.value)} />
        </div>
        <Input placeholder="Top Notes" value={form.topNotes} onChange={e => update('topNotes', e.target.value)} />
        <Input placeholder="Middle/Heart Notes" value={form.middleNotes} onChange={e => update('middleNotes', e.target.value)} />
        <Input placeholder="Base Notes" value={form.baseNotes} onChange={e => update('baseNotes', e.target.value)} />
      </div>

      {/* Variants */}
      <div className="bg-white rounded-lg border p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Variants</h2>
          <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1"><Plus className="h-3 w-3" /> Add Variant</Button>
        </div>
        {variants.map((v, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 items-center">
            <Input placeholder="Name" value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} />
            <Input placeholder="SKU" value={v.sku || ''} onChange={e => updateVariant(i, 'sku', e.target.value)} />
            <Input type="number" step="0.01" placeholder="Price" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} />
            <Input type="number" placeholder="Stock" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setVariants(prev => prev.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : product ? 'Update Product' : 'Create Product'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
