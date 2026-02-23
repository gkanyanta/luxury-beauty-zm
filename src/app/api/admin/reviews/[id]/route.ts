import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const { approved } = await req.json()

    const review = await prisma.review.update({
      where: { id },
      data: { approved },
    })

    return NextResponse.json(review)
  } catch (error: any) {
    console.error('Review update error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const review = await prisma.review.delete({ where: { id } })

    // Recalculate product avgRating and reviewCount
    const stats = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        avgRating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Review delete error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete review' }, { status: 500 })
  }
}
