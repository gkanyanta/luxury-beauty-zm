'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Loader2 } from 'lucide-react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token || !email) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">Invalid Link</h1>
        <p className="mt-2 text-sm text-neutral-500">This password reset link is invalid or incomplete.</p>
        <Link href="/auth/forgot-password">
          <Button variant="luxury" size="lg" className="mt-6">
            Request New Link
          </Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
        <h1 className="text-2xl font-light tracking-tight text-neutral-900 mt-6">Password Reset</h1>
        <p className="mt-2 text-sm text-neutral-500">Your password has been reset successfully.</p>
        <Link href="/auth/login?reset=true">
          <Button variant="luxury" size="lg" className="mt-6">
            Sign In
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">Set New Password</h1>
        <p className="mt-2 text-sm text-neutral-500">Enter your new password below</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="password" placeholder="New password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
        <Input type="password" placeholder="Confirm new password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" variant="luxury" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-neutral-500">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
