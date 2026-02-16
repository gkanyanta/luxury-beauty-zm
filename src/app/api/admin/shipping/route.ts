import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  await requireAdmin()
  const rates = await prisma.shippingRate.findMany({ orderBy: { region: 'asc' } })
  return NextResponse.json(rates)
}

export async function PUT(req: Request) {
  const session = await requireAdmin()
  const { rates } = await req.json()
  for (const rate of rates) {
    if (rate.id) {
      await prisma.shippingRate.update({
        where: { id: rate.id },
        data: {
          baseRate: parseFloat(rate.baseRate),
          estimatedDaysMin: parseInt(rate.estimatedDaysMin),
          estimatedDaysMax: parseInt(rate.estimatedDaysMax),
          active: rate.active ?? true,
        },
      })
    }
  }
  await prisma.auditLog.create({ data: { userId: session.user.id, action: 'UPDATE_SHIPPING', entity: 'ShippingRate', entityId: 'bulk' } })
  return NextResponse.json({ success: true })
}
