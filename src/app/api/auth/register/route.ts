import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { createEmailVerificationToken } from '@/lib/tokens'
import { sendEmail, emailVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.parse(body)
    const exists = await prisma.user.findUnique({ where: { email: parsed.email } })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    const hashedPassword = await bcryptjs.hash(parsed.password, 12)
    const user = await prisma.user.create({
      data: { name: parsed.name, email: parsed.email, password: hashedPassword, phone: parsed.phone, role: 'CUSTOMER' },
    })

    // Send verification email (non-blocking — don't fail registration if email fails)
    try {
      const token = await createEmailVerificationToken(parsed.email)
      const verifyUrl = `${process.env.APP_BASE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(parsed.email)}`
      await sendEmail({
        to: parsed.email,
        subject: 'Verify your email — Luxury Beauty ZM',
        html: emailVerificationEmail(parsed.name, verifyUrl),
      })
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
    }

    return NextResponse.json({ message: 'Account created successfully', userId: user.id }, { status: 201 })
  } catch (error: any) {
    if (error?.issues) return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
