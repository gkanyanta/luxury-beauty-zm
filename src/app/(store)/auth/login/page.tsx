'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const verified = searchParams.get('verified')
  const reset = searchParams.get('reset')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">Welcome Back</h1>
        <p className="mt-2 text-sm text-neutral-500">Sign in to your Luxury Beauty ZM account</p>
      </div>
      {verified && (
        <div className="flex items-center gap-2 rounded-sm border border-green-200 bg-green-50 p-3 mb-4 text-sm text-green-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Email verified successfully. You can now sign in.
        </div>
      )}
      {reset && (
        <div className="flex items-center gap-2 rounded-sm border border-green-200 bg-green-50 p-3 mb-4 text-sm text-green-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Password reset successfully. Sign in with your new password.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-xs text-amber-800 hover:underline">Forgot password?</Link>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" variant="luxury" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
        </Button>
      </form>
      <p className="text-center text-sm text-neutral-500 mt-6">
        Don&apos;t have an account? <Link href="/auth/register" className="text-amber-800 hover:underline">Create one</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-neutral-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
