import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  await requireAdmin()
  const discounts = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(discounts)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  const body = await req.json()
  const discount = await prisma.discountCode.create({ data: body })
  await prisma.auditLog.create({ data: { userId: session.user.id, action: 'CREATE_DISCOUNT', entity: 'DiscountCode', entityId: discount.id, newValue: { code: body.code } } })
  return NextResponse.json(discount, { status: 201 })
}
