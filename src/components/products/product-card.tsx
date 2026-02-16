'use client'

import Link from 'next/link'
import { ShoppingBag, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: {
    id: string; name: string; slug: string; price: number | string
    compareAtPrice?: number | string | null
    brand?: { name: string }
    images: { url: string; alt?: string | null }[]
    avgRating: number; reviewCount: number; stockQty: number
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const compareAt = product.compareAtPrice ? (typeof product.compareAtPrice === 'string' ? parseFloat(product.compareAtPrice) : product.compareAtPrice) : null
  const discount = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0
  const primaryImage = product.images[0]?.url || '/placeholder-product.svg'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group relative">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100">
          <img src={primaryImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && <Badge variant="danger" className="text-[10px]">-{discount}%</Badge>}
            {product.stockQty === 0 && <Badge variant="default" className="text-[10px]">Sold Out</Badge>}
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.preventDefault(); if (product.stockQty > 0) addItem({ productId: product.id, slug: product.slug, name: product.name, price, image: primaryImage, maxStock: product.stockQty }) }}
              className="rounded-full bg-white p-2 shadow-md hover:bg-neutral-50 transition-colors" title="Add to cart">
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
      <div className="mt-3 space-y-1">
        {product.brand && <p className="text-xs tracking-wider text-neutral-500 uppercase">{product.brand.name}</p>}
        <Link href={`/product/${product.slug}`}><h3 className="text-sm font-medium text-neutral-900 line-clamp-2 hover:underline">{product.name}</h3></Link>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-neutral-900">{formatPrice(price)}</p>
          {compareAt && <p className="text-xs text-neutral-400 line-through">{formatPrice(compareAt)}</p>}
        </div>
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-neutral-500">{product.avgRating.toFixed(1)} ({product.reviewCount})</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
