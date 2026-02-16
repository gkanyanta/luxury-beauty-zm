import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json()
    const discount = await prisma.discountCode.findUnique({ where: { code } })
    if (!discount || !discount.active) return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 })
    const now = new Date()
    if (now < discount.startDate || now > discount.endDate) return NextResponse.json({ error: 'Discount code expired' }, { status: 400 })
    if (discount.maxUses && discount.usedCount >= discount.maxUses) return NextResponse.json({ error: 'Discount code fully redeemed' }, { status: 400 })
    if (discount.minSpend && subtotal < Number(discount.minSpend)) return NextResponse.json({ error: `Minimum spend of K${Number(discount.minSpend).toFixed(2)} required` }, { status: 400 })
    return NextResponse.json({ code: discount.code, type: discount.type, value: Number(discount.value) })
  } catch { return NextResponse.json({ error: 'Validation failed' }, { status: 500 }) }
}
