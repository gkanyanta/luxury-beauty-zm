import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import prisma from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validations'
import { verifyPasswordResetToken, consumePasswordResetToken } from '@/lib/tokens'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, token } = body

    if (!email || !token) {
      return NextResponse.json({ error: 'Missing email or token' }, { status: 400 })
    }

    const { password, confirmPassword } = resetPasswordSchema.parse(body)

    const valid = await verifyPasswordResetToken(email, token)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    const hashedPassword = await bcryptjs.hash(password, 12)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    await consumePasswordResetToken(email, token)

    return NextResponse.json({ message: 'Password reset successfully' })
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
