import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Star } from 'lucide-react'

export const metadata = { title: 'My Reviews | Luxury Beauty ZM' }
export const dynamic = 'force-dynamic'

export default async function MyReviewsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account/reviews')

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { name: true, slug: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mb-2">My Reviews</h1>
      <p className="text-neutral-500 mb-8">Reviews you&apos;ve written</p>

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 mb-4">You haven&apos;t written any reviews yet.</p>
          <Link href="/shop" className="text-amber-800 underline hover:text-amber-900 text-sm">
            Browse products to review
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const image = review.product.images[0]
            return (
              <Link
                key={review.id}
                href={`/product/${review.product.slug}`}
                className="flex items-start gap-4 p-4 border rounded-sm hover:bg-neutral-50 transition-colors"
              >
                {image ? (
                  <img
                    src={image.url}
                    alt={review.product.name}
                    className="h-16 w-16 rounded-sm object-cover shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-sm bg-neutral-100 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate">{review.product.name}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                  {review.title && <p className="text-sm font-medium text-neutral-800 mt-1">{review.title}</p>}
                  {review.comment && <p className="text-sm text-neutral-600 mt-0.5 line-clamp-2">{review.comment}</p>}
                  <p className="text-xs text-neutral-400 mt-1">
                    {review.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
