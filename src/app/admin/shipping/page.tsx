'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export default function AdminShippingPage() {
  const [rates, setRates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/shipping-rates').then(r => r.json()).then(data => { setRates(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const updateRate = (idx: number, field: string, value: any) => {
    setRates(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  const saveRates = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/shipping', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates }),
      })
    } catch {}
    setSaving(false)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Shipping Rates</h1>
      <div className="bg-white rounded-lg border p-6 max-w-xl space-y-4">
        {rates.map((rate, i) => (
          <div key={rate.id || i} className="grid grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-neutral-500">{rate.region}</label>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500">Price (ZMW)</label>
              <Input type="number" step="0.01" value={rate.baseRate} onChange={e => updateRate(i, 'baseRate', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500">Min Days</label>
              <Input type="number" value={rate.estimatedDaysMin} onChange={e => updateRate(i, 'estimatedDaysMin', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500">Max Days</label>
              <Input type="number" value={rate.estimatedDaysMax} onChange={e => updateRate(i, 'estimatedDaysMax', e.target.value)} />
            </div>
          </div>
        ))}
        <Button onClick={saveRates} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Rates'}
        </Button>
      </div>
    </div>
  )
}
