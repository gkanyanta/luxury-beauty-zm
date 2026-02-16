import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ items: [] })
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { brand: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { productId } = await req.json()
  const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: session.user.id, productId } } })
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } })
    return NextResponse.json({ action: 'removed' })
  }
  await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } })
  return NextResponse.json({ action: 'added' })
}
