import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/utils'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const { name, description, logoUrl, country, active } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = slugify(name)
    const existing = await prisma.brand.findFirst({ where: { slug, NOT: { id } } })
    if (existing) return NextResponse.json({ error: 'A brand with this name already exists' }, { status: 400 })

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
        country: country || null,
        active: active ?? true,
      },
    })

    return NextResponse.json(brand)
  } catch (error: any) {
    console.error('Brand update error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update brand' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const productCount = await prisma.product.count({ where: { brandId: id } })
    if (productCount > 0) {
      return NextResponse.json({ error: `Cannot delete: ${productCount} product${productCount > 1 ? 's' : ''} use this brand` }, { status: 400 })
    }

    await prisma.brand.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Brand delete error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete brand' }, { status: 500 })
  }
}
