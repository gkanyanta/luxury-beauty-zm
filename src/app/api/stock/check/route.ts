import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { productId, variantId, quantity } = await req.json()

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'productId and quantity are required' }, { status: 400 })
    }

    let currentStock = 0

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { stockQty: true },
      })
      if (!variant) {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
      }
      currentStock = variant.stockQty
    } else {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stockQty: true },
      })
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      currentStock = product.stockQty
    }

    return NextResponse.json({
      available: quantity <= currentStock,
      currentStock,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
