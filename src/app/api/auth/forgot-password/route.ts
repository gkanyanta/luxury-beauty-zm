import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validations'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendEmail, passwordResetEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      const token = await createPasswordResetToken(email)
      const resetUrl = `${process.env.APP_BASE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`
      await sendEmail({
        to: email,
        subject: 'Reset your password — Luxury Beauty ZM',
        html: passwordResetEmail(user.name || 'Valued Customer', resetUrl),
      })
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ message: 'If an account exists with that email, a password reset link has been sent.' })
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
