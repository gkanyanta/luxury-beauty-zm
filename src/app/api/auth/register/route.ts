import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

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
    return NextResponse.json({ message: 'Account created successfully', userId: user.id }, { status: 201 })
  } catch (error: any) {
    if (error?.issues) return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
