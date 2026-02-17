import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createEmailVerificationToken } from '@/lib/tokens'
import { sendEmail, emailVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (user && !user.emailVerified) {
      const token = await createEmailVerificationToken(email)
      const verifyUrl = `${process.env.APP_BASE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
      await sendEmail({
        to: email,
        subject: 'Verify your email — Luxury Beauty ZM',
        html: emailVerificationEmail(user.name || 'Valued Customer', verifyUrl),
      })
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ message: 'If an account exists with that email, a verification link has been sent.' })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
