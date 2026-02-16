import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  const { id } = await params
  const { status, trackingNumber } = await req.json()

  const validTransitions: Record<string, string[]> = {
    PLACED: ['AWAITING_PAYMENT', 'PAID', 'CANCELLED'],
    AWAITING_PAYMENT: ['PAID', 'CANCELLED'],
    PAID: ['PACKED', 'CANCELLED', 'REFUNDED'],
    PACKED: ['SHIPPED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: ['REFUNDED'],
  }

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (status) {
    const allowed = validTransitions[order.status] || []
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: `Cannot transition from ${order.status} to ${status}` }, { status: 400 })
    }
  }

  const updateData: any = {}
  if (status) {
    updateData.status = status
    if (status === 'PAID') updateData.paidAt = new Date()
    if (status === 'PACKED') updateData.packedAt = new Date()
    if (status === 'SHIPPED') updateData.shippedAt = new Date()
    if (status === 'DELIVERED') updateData.deliveredAt = new Date()
    if (status === 'CANCELLED') updateData.cancelledAt = new Date()
    if (status === 'REFUNDED') updateData.refundedAt = new Date()
  }
  if (trackingNumber) updateData.trackingNumber = trackingNumber

  const updated = await prisma.order.update({ where: { id }, data: updateData })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id, action: 'UPDATE_ORDER', entity: 'Order', entityId: id,
      newValue: { from: order.status, to: status, trackingNumber },
    },
  })

  // If cancelled, restore stock
  if (status === 'CANCELLED') {
    const items = await prisma.orderItem.findMany({ where: { orderId: id } })
    for (const item of items) {
      if (item.variantId) {
        await prisma.productVariant.update({ where: { id: item.variantId }, data: { stockQty: { increment: item.quantity } } })
      } else {
        await prisma.product.update({ where: { id: item.productId }, data: { stockQty: { increment: item.quantity }, soldCount: { decrement: item.quantity } } })
      }
    }
  }

  return NextResponse.json(updated)
}
