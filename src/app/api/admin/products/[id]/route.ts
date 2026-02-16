import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/utils'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id }, include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' } }, variants: true } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  const { id } = await params
  const body = await req.json()
  const { images, variants, ...data } = body

  if (data.name) {
    const slug = slugify(data.name)
    const existing = await prisma.product.findFirst({ where: { slug, NOT: { id } } })
    data.slug = existing ? `${slug}-${Date.now()}` : slug
  }

  const product = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
    const updated = await tx.product.update({ where: { id }, data })

    if (images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } })
      if (images?.length) {
        await tx.productImage.createMany({ data: images.map((url: string, i: number) => ({ productId: id, url, sortOrder: i })) })
      }
    }

    if (variants !== undefined) {
      await tx.productVariant.deleteMany({ where: { productId: id } })
      if (variants?.length) {
        await tx.productVariant.createMany({ data: variants.map((v: any) => ({ ...v, productId: id })) })
      }
    }

    return updated
  })

  await prisma.auditLog.create({ data: { userId: session.user.id, action: 'UPDATE_PRODUCT', entity: 'Product', entityId: id, newValue: { name: data.name } } })

  return NextResponse.json(product)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  const { id } = await params
  await prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } })
  await prisma.auditLog.create({ data: { userId: session.user.id, action: 'ARCHIVE_PRODUCT', entity: 'Product', entityId: id } })
  return NextResponse.json({ success: true })
}
