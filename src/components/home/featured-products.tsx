'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/products/product-card'
import { Button } from '@/components/ui/button'

export function FeaturedProducts({ products }: { products: any[] }) {
  if (!products.length) return null

  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">Featured Products</h2>
            <p className="mt-2 text-sm text-neutral-500">Hand-picked essentials for your beauty routine</p>
          </div>
          <Link href="/shop" className="hidden sm:block">
            <Button variant="ghost" className="gap-1">View All <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop"><Button variant="outline" className="gap-1">View All Products <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    </section>
  )
}
