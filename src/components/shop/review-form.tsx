'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface ReviewFormProps {
  productId: string
  existingReview?: { rating: number; title: string | null; comment: string | null }
}

export function ReviewForm({ productId, existingReview }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (existingReview) {
    return (
      <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-6">
        <p className="text-sm font-medium text-neutral-700 mb-2">You&apos;ve already reviewed this product</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${star <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
            />
          ))}
        </div>
        {existingReview.title && <p className="mt-2 text-sm font-medium text-neutral-800">{existingReview.title}</p>}
        {existingReview.comment && <p className="mt-1 text-sm text-neutral-600">{existingReview.comment}</p>}
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title: title || undefined, comment: comment || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to submit review')
        return
      }
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Your Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-neutral-700 mb-1">Title (optional)</label>
        <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" />
      </div>
      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-neutral-700 mb-1">Comment (optional)</label>
        <Textarea id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell others what you think..." rows={4} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" variant="luxury" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}
