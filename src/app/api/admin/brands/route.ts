import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/utils'

export async function GET() {
  await requireAdmin()
  const brands = await prisma.brand.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(brands)
}

export async function POST(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { name, description, logoUrl, country, active } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = slugify(name)
    const existing = await prisma.brand.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'A brand with this name already exists' }, { status: 400 })

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
        country: country || null,
        active: active ?? true,
      },
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error: any) {
    console.error('Brand create error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create brand' }, { status: 500 })
  }
}
