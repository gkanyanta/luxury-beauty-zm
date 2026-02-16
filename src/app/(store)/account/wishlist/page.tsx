import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/products/product-card'
import Link from 'next/link'

export const metadata = { title: 'Wishlist | Luxury Beauty ZM' }

export const dynamic = 'force-dynamic'

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account/wishlist')

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { brand: true, images: { take: 2 } } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mb-8">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">Your wishlist is empty.</p>
          <Link href="/shop" className="text-amber-800 hover:underline">Discover products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map(item => <ProductCard key={item.id} product={{
            ...item.product,
            price: Number(item.product.price),
            compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
          }} />)}
        </div>
      )}
    </div>
  )
}
