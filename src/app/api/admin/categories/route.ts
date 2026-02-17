import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/utils'

export async function GET() {
  await requireAdmin()
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      products: {
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { name, description, imageUrl } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = slugify(name)
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })

    const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } })
    const category = await prisma.category.create({
      data: { name, slug, description: description || null, imageUrl: imageUrl || null, sortOrder: (maxSort._max.sortOrder ?? 0) + 1 },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Category create error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 })
  }
}
