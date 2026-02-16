import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import { ShopContent } from '@/components/shop/shop-content'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Shop | Luxury Beauty ZM' }

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null }, orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-light tracking-tight text-neutral-900 mb-2">Shop</h1>
      <p className="text-neutral-500 text-sm mb-8">Browse our complete collection of authentic beauty products</p>
      <Suspense fallback={<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div>}>
        <ShopContent categories={categories} brands={brands} />
      </Suspense>
    </div>
  )
}
