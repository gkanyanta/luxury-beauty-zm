'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

const transitions: Record<string, { label: string; next: string; variant?: any }[]> = {
  PLACED: [{ label: 'Mark as Paid', next: 'PAID' }, { label: 'Cancel Order', next: 'CANCELLED', variant: 'destructive' }],
  AWAITING_PAYMENT: [{ label: 'Mark as Paid', next: 'PAID' }, { label: 'Cancel Order', next: 'CANCELLED', variant: 'destructive' }],
  PAID: [{ label: 'Mark as Packed', next: 'PACKED' }, { label: 'Cancel Order', next: 'CANCELLED', variant: 'destructive' }],
  PACKED: [{ label: 'Mark as Shipped', next: 'SHIPPED' }, { label: 'Cancel Order', next: 'CANCELLED', variant: 'destructive' }],
  SHIPPED: [{ label: 'Mark as Delivered', next: 'DELIVERED' }],
  DELIVERED: [{ label: 'Issue Refund', next: 'REFUNDED', variant: 'destructive' }],
}

export function OrderActions({ orderId, currentStatus, paymentMethod }: { orderId: string; currentStatus: string; paymentMethod: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [error, setError] = useState('')

  const actions = transitions[currentStatus] || []

  const handleAction = async (nextStatus: string) => {
    setLoading(nextStatus)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, trackingNumber: nextStatus === 'SHIPPED' ? trackingNumber : undefined }),
      })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed') }
      router.refresh()
    } catch (err: any) { setError(err.message) }
    setLoading('')
  }

  if (actions.length === 0) return null

  return (
    <div className="bg-white rounded-lg border p-4">
      <h2 className="font-medium mb-3">Actions</h2>
      {currentStatus === 'PACKED' && (
        <div className="mb-3">
          <Input placeholder="Tracking number (optional)" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {actions.map(action => (
          <Button key={action.next} variant={action.variant || 'default'} size="sm" disabled={!!loading} onClick={() => handleAction(action.next)}>
            {loading === action.next ? <Loader2 className="h-4 w-4 animate-spin" /> : action.label}
          </Button>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
