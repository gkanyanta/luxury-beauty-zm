import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { reviewSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Must be logged in' }, { status: 401 })
    const body = await req.json()
    const { productId, ...reviewData } = body
    const parsed = reviewSchema.parse(reviewData)
    const existing = await prisma.review.findUnique({ where: { productId_userId: { productId, userId: session.user.id } } })
    if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 400 })
    const purchased = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: session.user.id, status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED'] } } },
    })
    const review = await prisma.review.create({
      data: { productId, userId: session.user.id, rating: parsed.rating, title: parsed.title, comment: parsed.comment, verified: !!purchased, approved: true },
    })
    const stats = await prisma.review.aggregate({ where: { productId, approved: true }, _avg: { rating: true }, _count: true })
    await prisma.product.update({ where: { id: productId }, data: { avgRating: stats._avg.rating || 0, reviewCount: stats._count } })
    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
