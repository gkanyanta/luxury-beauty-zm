import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  const { id } = await params
  const body = await req.json()
  const discount = await prisma.discountCode.update({ where: { id }, data: body })
  await prisma.auditLog.create({ data: { userId: session.user.id, action: 'UPDATE_DISCOUNT', entity: 'DiscountCode', entityId: id } })
  return NextResponse.json(discount)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  const { id } = await params
  await prisma.discountCode.update({ where: { id }, data: { active: false } })
  await prisma.auditLog.create({ data: { userId: session.user.id, action: 'DEACTIVATE_DISCOUNT', entity: 'DiscountCode', entityId: id } })
  return NextResponse.json({ success: true })
}
