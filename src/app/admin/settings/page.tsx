'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    storeName: 'Luxury Beauty ZM',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    mobileMoneyInstructions: '',
    whatsappNumber: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      if (data && typeof data === 'object') setSettings(prev => ({ ...prev, ...data }))
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
    } catch {}
    setSaving(false)
  }

  const update = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }))

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Store Settings</h1>
      <div className="bg-white rounded-lg border p-6 max-w-xl space-y-4">
        <div><label className="text-sm font-medium block mb-1">Store Name</label><Input value={settings.storeName} onChange={e => update('storeName', e.target.value)} /></div>
        <div><label className="text-sm font-medium block mb-1">Store Email</label><Input type="email" value={settings.storeEmail} onChange={e => update('storeEmail', e.target.value)} /></div>
        <div><label className="text-sm font-medium block mb-1">Store Phone</label><Input value={settings.storePhone} onChange={e => update('storePhone', e.target.value)} /></div>
        <div><label className="text-sm font-medium block mb-1">Store Address</label><Input value={settings.storeAddress} onChange={e => update('storeAddress', e.target.value)} /></div>
        <div><label className="text-sm font-medium block mb-1">WhatsApp Number</label><Input value={settings.whatsappNumber} onChange={e => update('whatsappNumber', e.target.value)} /></div>
        <div><label className="text-sm font-medium block mb-1">Mobile Money Instructions</label><Textarea value={settings.mobileMoneyInstructions} onChange={e => update('mobileMoneyInstructions', e.target.value)} rows={4} /></div>
        <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Settings'}</Button>
      </div>
    </div>
  )
}
