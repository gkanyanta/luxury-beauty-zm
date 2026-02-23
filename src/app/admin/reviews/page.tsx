import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { ReviewActions } from './review-actions'
import Image from 'next/image'
import { Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Reviews</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Customer</th>
              <th className="text-left p-3 font-medium">Rating</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Comment</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Image</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reviews.map(review => (
              <tr key={review.id} className="hover:bg-neutral-50">
                <td className="p-3">
                  <span className="font-medium text-amber-800">{review.product.name}</span>
                </td>
                <td className="p-3 hidden sm:table-cell text-neutral-500">
                  <div>{review.user.name || 'Anonymous'}</div>
                  <div className="text-xs">{review.user.email}</div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell text-neutral-500 max-w-xs truncate">
                  {review.comment ? (review.comment.length > 80 ? review.comment.slice(0, 80) + '...' : review.comment) : '-'}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  {review.imageUrl ? (
                    <Image src={review.imageUrl} alt="Review" width={40} height={40} className="rounded object-cover" />
                  ) : (
                    <span className="text-neutral-300">-</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <Badge variant={review.approved ? 'success' : 'warning'}>
                    {review.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </td>
                <td className="p-3 hidden md:table-cell text-neutral-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <ReviewActions id={review.id} approved={review.approved} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && <p className="p-8 text-center text-neutral-500">No reviews yet</p>}
      </div>
    </div>
  )
}
