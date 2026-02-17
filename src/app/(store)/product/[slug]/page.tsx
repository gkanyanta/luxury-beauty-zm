import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ProductDetail } from '@/components/shop/product-detail'
import { ReviewSection } from '@/components/shop/review-section'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug }, include: { brand: true } })
  if (!product) return { title: 'Product Not Found' }
  return { title: `${product.name} | Luxury Beauty ZM`, description: product.description?.slice(0, 160) }
}

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { slug, status: 'ACTIVE' },
      include: {
        brand: true, category: true, images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { active: true }, orderBy: { price: 'asc' } },
        reviews: { where: { approved: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    }),
    auth(),
  ])
  if (!product) notFound()

  const userReview = session?.user
    ? await prisma.review.findUnique({
        where: { productId_userId: { productId: product.id, userId: session.user.id } },
        select: { rating: true, title: true, comment: true },
      })
    : null

  const serializedReviews = product.reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: undefined,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <ProductDetail product={product} />
      <ReviewSection
        reviews={serializedReviews}
        productId={product.id}
        avgRating={product.avgRating ?? 0}
        reviewCount={product.reviewCount ?? 0}
        userId={session?.user?.id}
        userReview={userReview}
      />
    </div>
  )
}
