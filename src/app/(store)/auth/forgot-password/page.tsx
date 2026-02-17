'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">Check Your Email</h1>
        <p className="mt-4 text-sm text-neutral-500">
          If an account exists with that email, we&apos;ve sent a password reset link. Please check your inbox and spam folder.
        </p>
        <Link href="/auth/login">
          <Button variant="luxury" size="lg" className="mt-6">
            Back to Sign In
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-neutral-500">Enter your email and we&apos;ll send you a reset link</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" variant="luxury" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
        </Button>
      </form>
      <p className="text-center text-sm text-neutral-500 mt-6">
        <Link href="/auth/login" className="text-amber-800 hover:underline">Back to Sign In</Link>
      </p>
    </div>
  )
}
