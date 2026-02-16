import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(req: NextRequest) {
  await requireAdmin()
  const status = req.nextUrl.searchParams.get('status')
  const where: any = {}
  if (status) where.status = status

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: { select: { name: true } } } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(orders)
}
