import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'
import { slugify } from '@/lib/utils'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const { name, description, imageUrl } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = slugify(name)
    const existing = await prisma.category.findFirst({ where: { slug, NOT: { id } } })
    if (existing) return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description: description || null, imageUrl: imageUrl || null },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Category update error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return NextResponse.json({ error: `Cannot delete: ${productCount} product${productCount > 1 ? 's' : ''} use this category` }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Category delete error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 })
  }
}
