'use client'

import Link from 'next/link'
import { Star, BadgeCheck } from 'lucide-react'
import { ReviewForm } from './review-form'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  verified: boolean
  createdAt: string
  user: { name: string | null }
}

interface ReviewSectionProps {
  reviews: Review[]
  productId: string
  avgRating: number
  reviewCount: number
  userId?: string
  userReview?: { rating: number; title: string | null; comment: string | null } | null
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
        />
      ))}
    </div>
  )
}

export function ReviewSection({ reviews, productId, avgRating, reviewCount, userId, userReview }: ReviewSectionProps) {
  return (
    <section className="mt-16 border-t border-neutral-200 pt-12">
      <h2 className="text-xl font-light tracking-tight text-neutral-900 mb-8">Customer Reviews</h2>

      {/* Rating summary */}
      <div className="flex items-center gap-4 mb-8">
        <StarRating rating={avgRating} size="lg" />
        <div>
          <p className="text-lg font-medium text-neutral-900">{avgRating.toFixed(1)} out of 5</p>
          <p className="text-sm text-neutral-500">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</p>
        </div>
      </div>

      {/* Form area */}
      <div className="mb-12 max-w-xl">
        <h3 className="text-base font-medium text-neutral-900 mb-4">Write a Review</h3>
        {!userId ? (
          <p className="text-sm text-neutral-500">
            <Link href="/auth/login" className="text-amber-800 underline hover:text-amber-900">Sign in</Link> to leave a review.
          </p>
        ) : (
          <ReviewForm productId={productId} existingReview={userReview || undefined} />
        )}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-neutral-500">No reviews yet. Be the first to share your experience!</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-neutral-100 pb-6 last:border-0">
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={review.rating} />
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <BadgeCheck className="h-3 w-3" /> Verified Purchase
                  </span>
                )}
              </div>
              {review.title && <p className="text-sm font-medium text-neutral-900 mb-1">{review.title}</p>}
              {review.comment && <p className="text-sm text-neutral-600 leading-relaxed">{review.comment}</p>}
              <p className="mt-2 text-xs text-neutral-400">
                {review.user.name || 'Anonymous'} &middot; {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
