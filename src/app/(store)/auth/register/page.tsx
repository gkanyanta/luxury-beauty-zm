'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-light tracking-tight text-neutral-900">Create Account</h1>
        <p className="mt-2 text-sm text-neutral-500">Join Luxury Beauty ZM for authentic beauty</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Full Name" required value={form.name} onChange={e => update('name', e.target.value)} />
        <Input type="email" placeholder="Email address" required value={form.email} onChange={e => update('email', e.target.value)} />
        <Input type="password" placeholder="Password (min 8 characters)" required value={form.password} onChange={e => update('password', e.target.value)} />
        <Input type="password" placeholder="Confirm Password" required value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" variant="luxury" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
        </Button>
      </form>
      <p className="text-center text-sm text-neutral-500 mt-6">
        Already have an account? <Link href="/auth/login" className="text-amber-800 hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
