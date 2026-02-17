'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function ResendVerificationButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return <span className="text-xs text-green-700 shrink-0">Sent!</span>
  }

  return (
    <Button variant="outline" size="sm" onClick={handleResend} disabled={loading} className="shrink-0 text-xs border-amber-300 text-amber-800 hover:bg-amber-100">
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Resend'}
    </Button>
  )
}
