import { NextResponse } from 'next/server'
import { verifyEmailVerificationToken } from '@/lib/tokens'

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Missing email or token' }, { status: 400 })
    }

    const valid = await verifyEmailVerificationToken(email, token)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
