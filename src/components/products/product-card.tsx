'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Star, Loader2, Zap } from 'lucide-react'
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
  const router = useRouter()
  const validateAndAddItem = useCartStore((s) => s.validateAndAddItem)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const [stockError, setStockError] = useState('')
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const compareAt = product.compareAtPrice ? (typeof product.compareAtPrice === 'string' ? parseFloat(product.compareAtPrice) : product.compareAtPrice) : null
  const discount = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0
  const primaryImage = product.images[0]?.url || '/placeholder-product.svg'

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.stockQty <= 0 || adding) return
    setAdding(true)
    setStockError('')
    const result = await validateAndAddItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: primaryImage,
      maxStock: product.stockQty,
    })
    if (!result.success) {
      setStockError(result.message || 'Out of stock')
      setTimeout(() => setStockError(''), 3000)
    }
    setAdding(false)
  }

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.stockQty <= 0 || buying) return
    setBuying(true)
    setStockError('')
    const result = await validateAndAddItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: primaryImage,
      maxStock: product.stockQty,
    })
    if (result.success) {
      router.push('/checkout')
    } else {
      setStockError(result.message || 'Out of stock')
      setTimeout(() => setStockError(''), 3000)
      setBuying(false)
    }
  }

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
            <button onClick={handleBuyNow} disabled={product.stockQty <= 0 || buying}
              className="rounded-full bg-neutral-900 p-2 shadow-md hover:bg-neutral-800 transition-colors disabled:opacity-50" title="Buy now">
              {buying ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Zap className="h-4 w-4 text-white" />}
            </button>
            <button onClick={handleQuickAdd} disabled={product.stockQty <= 0 || adding}
              className="rounded-full bg-white p-2 shadow-md hover:bg-neutral-50 transition-colors disabled:opacity-50" title="Add to cart">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
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
        {product.stockQty > 5 && (
          <p className="text-xs text-green-600">In Stock</p>
        )}
        {product.stockQty > 0 && product.stockQty <= 5 && (
          <p className="text-xs text-amber-600">Only {product.stockQty} left</p>
        )}
        {stockError && <p className="text-xs text-red-500">{stockError}</p>}
      </div>
    </motion.div>
  )
}
