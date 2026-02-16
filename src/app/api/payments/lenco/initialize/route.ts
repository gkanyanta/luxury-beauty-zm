import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { LencoProvider } from '@/lib/payment-provider'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const { orderId } = await req.json()
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.userId && order.userId !== session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const provider = new LencoProvider()
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/verify`
    const result = await provider.initialize({
      orderId: order.id,
      amount: Number(order.total),
      currency: 'ZMW',
      email: order.guestEmail || session?.user?.email || '',
      callbackUrl,
    })

    await prisma.paymentTransaction.create({
      data: { orderId: order.id, provider: 'LENCO', reference: result.reference, amount: Number(order.total), status: 'PENDING', idempotencyKey: `${order.id}-reinit-${Date.now()}` },
    })

    return NextResponse.json({ checkoutUrl: result.checkoutUrl, reference: result.reference })
  } catch (error) {
    console.error('Payment init error:', error)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}
