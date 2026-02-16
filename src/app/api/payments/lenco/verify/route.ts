import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { LencoProvider } from '@/lib/payment-provider'
import { sendEmail, orderConfirmationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { reference } = await req.json()
    if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 })

    const transaction = await prisma.paymentTransaction.findFirst({ where: { reference } })
    if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    // Idempotency check
    if (transaction.status === 'SUCCESS') {
      const order = await prisma.order.findUnique({ where: { id: transaction.orderId } })
      return NextResponse.json({ success: true, orderNumber: order?.orderNumber })
    }

    const provider = new LencoProvider()
    const result = await provider.verify(reference)

    // Amount verification — compare Lenco amount with order total
    const order = await prisma.order.findUnique({ where: { id: transaction.orderId } })
    if (order && result.success) {
      const orderTotal = Number(order.total)
      if (Math.abs(result.amount - orderTotal) > 0.01) {
        console.error(`Amount mismatch: Lenco=${result.amount}, order=${orderTotal}, ref=${reference}`)
        return NextResponse.json({ success: false, error: 'Amount mismatch' })
      }
    }

    if (result.success) {
      await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
        await tx.paymentTransaction.update({ where: { id: transaction.id }, data: { status: 'SUCCESS', rawPayload: result as any } })
        await tx.order.update({ where: { id: transaction.orderId }, data: { status: 'PAID', paidAt: new Date() } })
      })

      const updatedOrder = await prisma.order.findUnique({ where: { id: transaction.orderId }, include: { items: true } })
      if (updatedOrder) {
        try {
          const html = orderConfirmationEmail(updatedOrder)
          const email = updatedOrder.guestEmail || ''
          await sendEmail({ to: email, subject: `Order Confirmed — ${updatedOrder.orderNumber}`, html })
        } catch (err) { console.error('Email error:', err) }
      }

      return NextResponse.json({ success: true, orderNumber: updatedOrder?.orderNumber })
    }

    if (result.pending) {
      return NextResponse.json({ success: false, pending: true, orderNumber: order?.orderNumber })
    }

    // Payment failed
    await prisma.paymentTransaction.update({ where: { id: transaction.id }, data: { status: 'FAILED', rawPayload: result as any } })
    return NextResponse.json({ success: false, error: 'Payment was not successful' })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
