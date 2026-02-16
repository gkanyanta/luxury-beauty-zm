'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export default function NewDiscountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: '', type: 'PERCENTAGE', value: '', minSpend: '',
    maxUses: '', startDate: new Date().toISOString().split('T')[0],
    endDate: '', active: true,
  })

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, value: parseFloat(form.value), minSpend: form.minSpend ? parseFloat(form.minSpend) : null,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        }),
      })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed') }
      router.push('/admin/discounts')
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">New Discount Code</h1>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4 bg-white p-6 rounded-lg border">
        <div>
          <label className="text-sm font-medium block mb-1">Code</label>
          <Input placeholder="e.g. WELCOME10" value={form.code} onChange={e => update('code', e.target.value.toUpperCase())} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Type</label>
            <Select value={form.type} onValueChange={v => update('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FLAT">Flat Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Value</label>
            <Input type="number" step="0.01" placeholder={form.type === 'PERCENTAGE' ? '10' : '50.00'} value={form.value} onChange={e => update('value', e.target.value)} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Min Spend (optional)</label>
            <Input type="number" step="0.01" placeholder="0.00" value={form.minSpend} onChange={e => update('minSpend', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Max Uses (optional)</label>
            <Input type="number" placeholder="Unlimited" value={form.maxUses} onChange={e => update('maxUses', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Start Date</label>
            <Input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">End Date</label>
            <Input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} required />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Discount'}</Button>
      </form>
    </div>
  )
}
