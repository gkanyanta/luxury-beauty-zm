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
  const session = await requireAdmin()
  const body = await req.json()
  const { name, images, variants, ...data } = body

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
}
