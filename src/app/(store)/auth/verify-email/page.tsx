'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      return
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    })
      .then(res => {
        setStatus(res.ok ? 'success' : 'error')
      })
      .catch(() => setStatus('error'))
  }, [token, email])

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setResent(true)
    } catch {
      // ignore
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-amber-800 mx-auto" />
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 mt-6">Verifying your email...</h1>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 mt-6">Email Verified</h1>
          <p className="mt-2 text-sm text-neutral-500">Your email has been verified successfully.</p>
          <Link href="/auth/login?verified=true">
            <Button variant="luxury" size="lg" className="mt-6">
              Sign In
            </Button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 mt-6">Verification Failed</h1>
          <p className="mt-2 text-sm text-neutral-500">This link is invalid or has expired.</p>
          {email && !resent && (
            <Button variant="luxury" size="lg" className="mt-6" onClick={handleResend} disabled={resending}>
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend Verification Email'}
            </Button>
          )}
          {resent && (
            <p className="mt-4 text-sm text-green-600">A new verification link has been sent to your email.</p>
          )}
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-neutral-500">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
