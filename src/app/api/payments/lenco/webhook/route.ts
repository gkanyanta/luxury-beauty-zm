import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { LencoProvider } from '@/lib/payment-provider'
import { sendEmail, orderConfirmationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-lenco-signature') || ''

    const provider = new LencoProvider()
    if (!provider.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const { event, data } = payload

    if (event === 'charge.success' || event === 'transaction.success') {
      const reference = data.reference
      const transaction = await prisma.paymentTransaction.findFirst({ where: { reference } })
      if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

      // Idempotency
      if (transaction.status === 'SUCCESS') return NextResponse.json({ received: true })

      await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
        await tx.paymentTransaction.update({ where: { id: transaction.id }, data: { status: 'SUCCESS', rawPayload: payload } })
        await tx.order.update({ where: { id: transaction.orderId }, data: { status: 'PAID', paidAt: new Date() } })
      })

      const order = await prisma.order.findUnique({ where: { id: transaction.orderId }, include: { items: true } })
      if (order) {
        try {
          const html = orderConfirmationEmail(order)
          const email = order.guestEmail || ''
          await sendEmail({ to: email, subject: `Payment Confirmed — ${order.orderNumber}`, html })
        } catch (err) { console.error('Webhook email error:', err) }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
