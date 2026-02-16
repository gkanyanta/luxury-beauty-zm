import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/utils'

export async function GET() {
  await requireAdmin()
  const products = await prisma.product.findMany({
    include: { brand: true, category: true, images: { take: 1 } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin()
    const body = await req.json()
    const { name, images, variants, volume, ingredients, topNotes, middleNotes, baseNotes, stock, ...data } = body

    // Map form fields to Prisma schema fields
    if (stock !== undefined) data.stockQty = parseInt(stock) || 0
    if (volume) {
      const ml = parseFloat(volume)
      if (!isNaN(ml)) data.sizeML = ml
    }
    if (ingredients) {
      data.ingredientHighlights = ingredients.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
    if (topNotes || middleNotes || baseNotes) {
      data.fragranceNotes = {
        top: topNotes ? topNotes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        middle: middleNotes ? middleNotes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        base: baseNotes ? baseNotes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      }
    }

    const slug = slugify(name)
    const existing = await prisma.product.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const product = await prisma.product.create({
      data: {
        ...data, name, slug: finalSlug,
        images: images?.length ? { create: images.map((url: string, i: number) => ({ url, sortOrder: i })) } : undefined,
        variants: variants?.length ? { create: variants } : undefined,
      },
      include: { images: true, variants: true },
    })

    await prisma.auditLog.create({ data: { userId: session.user.id, action: 'CREATE_PRODUCT', entity: 'Product', entityId: product.id, newValue: { name } } })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Product create error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 })
  }
}
