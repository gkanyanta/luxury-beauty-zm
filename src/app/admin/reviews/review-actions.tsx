'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ReviewActions({ id, approved }: { id: string; approved: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleApproval() {
    setLoading(true)
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !approved }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this review? This cannot be undone.')) return
    setLoading(true)
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleApproval}
        disabled={loading}
        className="text-xs px-2 py-1 rounded border hover:bg-neutral-50 disabled:opacity-50"
      >
        {approved ? 'Reject' : 'Approve'}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}
