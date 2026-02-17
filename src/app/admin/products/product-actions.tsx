'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

export function ProductActions({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Archive "${productName}"? This will hide it from the shop.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to delete' }))
        alert(data.error || 'Failed to archive product')
        setDeleting(false)
        return
      }
      router.refresh()
    } catch {
      alert('Something went wrong')
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/products/${productId}/edit`} className="p-1.5 rounded hover:bg-neutral-100" title="Edit">
        <Pencil className="h-3.5 w-3.5 text-neutral-500" />
      </Link>
      <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded hover:bg-red-50" title="Archive">
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" /> : <Trash2 className="h-3.5 w-3.5 text-red-500" />}
      </button>
    </div>
  )
}
