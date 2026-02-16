import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateOrderNumber, provinceToRegion } from '@/lib/utils'
import { LencoProvider } from '@/lib/payment-provider'
import { sendEmail, orderConfirmationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json()
    const { items, email, firstName, lastName, phone, addressLine1, addressLine2, city, province, compound, paymentMethod, notes, discountCode, shippingRateId } = body

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    if (!email || !firstName || !lastName || !phone || !addressLine1 || !city || !province) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate products and calculate server-side prices
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      include: { variants: true },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products are unavailable' }, { status: 400 })
    }

    // Build order items with server-side prices
    const orderItems: { productId: string; variantId?: string; variantName?: string; quantity: number; price: number; name: string }[] = []
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) return NextResponse.json({ error: `Product not found` }, { status: 400 })

      let price = Number(product.price)
      let variantName: string | undefined

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId)
        if (!variant || !variant.active) return NextResponse.json({ error: `Variant unavailable` }, { status: 400 })
        if (variant.stockQty < item.quantity) return NextResponse.json({ error: `${product.name} (${variant.name}) is low on stock` }, { status: 400 })
        price = Number(variant.price)
        variantName = variant.name
      } else {
        if (product.stockQty < item.quantity) return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 })
      }

      orderItems.push({ productId: product.id, variantId: item.variantId || undefined, variantName, quantity: item.quantity, price, name: product.name })
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // Shipping
    const region = provinceToRegion(province)
    let shippingCost = 0
    if (shippingRateId) {
      const rate = await prisma.shippingRate.findUnique({ where: { id: shippingRateId } })
      if (rate) shippingCost = Number(rate.baseRate)
    } else {
      const rate = await prisma.shippingRate.findFirst({ where: { region, active: true } })
      if (rate) { shippingCost = Number(rate.baseRate) }
    }

    // Discount
    let discountAmount = 0
    let discountId: string | undefined
    if (discountCode) {
      const dc = await prisma.discountCode.findUnique({ where: { code: discountCode } })
      if (dc && dc.active) {
        const now = new Date()
        if (now >= dc.startDate && now <= dc.endDate) {
          if (!dc.maxUses || dc.usedCount < dc.maxUses) {
            if (!dc.minSpend || subtotal >= Number(dc.minSpend)) {
              discountAmount = dc.type === 'PERCENTAGE'
                ? subtotal * (Number(dc.value) / 100)
                : Math.min(Number(dc.value), subtotal)
              discountId = dc.id
            }
          }
        }
      }
    }

    const total = subtotal - discountAmount + shippingCost
    const orderNumber = generateOrderNumber()

    // Map paymentMethod from client to enum
    const paymentMethodMap: Record<string, string> = {
      'LENCO_ONLINE': 'LENCO',
      'MANUAL_MOBILE_MONEY': 'MANUAL_MOMO',
      'PAY_ON_DELIVERY': 'PAY_ON_DELIVERY',
    }
    const mappedPaymentMethod = paymentMethodMap[paymentMethod] || paymentMethod

    // Create order in transaction
    const order = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id || undefined,
          guestEmail: session?.user?.id ? undefined : email,
          guestPhone: session?.user?.id ? undefined : phone,
          status: mappedPaymentMethod === 'LENCO' ? 'AWAITING_PAYMENT' : 'PLACED',
          paymentMethod: mappedPaymentMethod as any,
          subtotal,
          discount: discountAmount,
          shippingCost,
          total,
          discountCodeId: discountId,
          shippingName: `${firstName} ${lastName}`,
          shippingPhone: phone,
          shippingAddress: addressLine1 + (addressLine2 ? `, ${addressLine2}` : ''),
          shippingTown: city,
          shippingProvince: province,
          shippingRegion: region as any,
          customerNotes: notes || undefined,
          items: {
            create: orderItems.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.name,
              variantName: item.variantName,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
          },
        },
        include: { items: true },
      })

      // Decrement stock
      for (const item of orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({ where: { id: item.variantId }, data: { stockQty: { decrement: item.quantity } } })
        } else {
          await tx.product.update({ where: { id: item.productId }, data: { stockQty: { decrement: item.quantity }, soldCount: { increment: item.quantity } } })
        }
      }

      // Increment discount usage
      if (discountId) {
        await tx.discountCode.update({ where: { id: discountId }, data: { usedCount: { increment: 1 } } })
      }

      // Save address if logged in
      if (session?.user?.id) {
        const existingAddress = await tx.address.findFirst({ where: { userId: session.user.id, addressLine1, town: city, province } })
        if (!existingAddress) {
          await tx.address.create({
            data: {
              userId: session.user.id, label: 'Home', fullName: `${firstName} ${lastName}`,
              addressLine1, addressLine2: addressLine2 || undefined,
              town: city, province, compound: compound || undefined, phone, region: region as any, isDefault: true,
            },
          })
        }
      }

      return newOrder
    })

    // Handle payment
    if (mappedPaymentMethod === 'LENCO') {
      try {
        const provider = new LencoProvider()
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/verify`
        const paymentResult = await provider.initialize({
          orderId: order.id,
          amount: total,
          currency: 'ZMW',
          email,
          callbackUrl,
        })

        await prisma.paymentTransaction.create({
          data: {
            orderId: order.id, provider: 'LENCO', reference: paymentResult.reference,
            amount: total, status: 'PENDING', customerEmail: email, idempotencyKey: `${order.id}-init`,
          },
        })

        return NextResponse.json({ orderNumber: order.orderNumber, paymentUrl: paymentResult.checkoutUrl })
      } catch (err) {
        console.error('Payment init error:', err)
        return NextResponse.json({ orderNumber: order.orderNumber, error: 'Payment initialization failed. Please try again.' }, { status: 500 })
      }
    }

    // For manual/COD — send confirmation email
    try {
      const html = orderConfirmationEmail(order)
      await sendEmail({ to: email, subject: `Order Confirmed — ${order.orderNumber}`, html })
    } catch (err) { console.error('Email error:', err) }

    return NextResponse.json({ orderNumber: order.orderNumber })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
  }
}
