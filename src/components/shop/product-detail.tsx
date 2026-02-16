'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Heart, Star, Truck, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductDetail({ product }: { product: any }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)

  const images = product.images || []
  const price = selectedVariant ? selectedVariant.price : product.price
  const comparePrice = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice
  const inStock = selectedVariant ? selectedVariant.stockQty > 0 : product.stockQty > 0

  const handleAdd = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name: product.name + (selectedVariant ? ` - ${selectedVariant.name}` : ''),
      price: Number(price),
      image: images[0]?.url || '',
      slug: product.slug,
      maxStock: selectedVariant?.stockQty || product.stockQty,
      quantity: qty,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image gallery */}
      <div>
        <div className="relative aspect-square bg-neutral-100 rounded-sm overflow-hidden mb-3">
          {images.length > 0 ? (
            <Image src={images[selectedImage]?.url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">No image</div>
          )}
          {images.length > 1 && (
            <>
              <button onClick={() => setSelectedImage(i => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setSelectedImage(i => Math.min(images.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 hover:bg-white"><ChevronRight className="h-4 w-4" /></button>
            </>
          )}
          {comparePrice && Number(comparePrice) > Number(price) && (
            <Badge className="absolute top-3 left-3 bg-red-600">-{Math.round((1 - Number(price) / Number(comparePrice)) * 100)}%</Badge>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img: any, i: number) => (
              <button key={img.id} onClick={() => setSelectedImage(i)} className={`relative w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 border-2 ${i === selectedImage ? 'border-amber-800' : 'border-transparent'}`}>
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        {product.brand && <p className="text-sm text-amber-800 tracking-wider uppercase mb-2">{product.brand.name}</p>}
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">{product.name}</h1>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />)}</div>
            <span className="text-sm text-neutral-500">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-medium text-neutral-900">{formatPrice(Number(price))}</span>
          {comparePrice && Number(comparePrice) > Number(price) && (
            <span className="text-lg text-neutral-400 line-through">{formatPrice(Number(comparePrice))}</span>
          )}
        </div>

        {/* Variants */}
        {product.variants?.length > 0 && (
          <div className="mt-6">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Size / Variant</label>
            <Select value={selectedVariant?.id || ''} onValueChange={(v) => setSelectedVariant(product.variants.find((vr: any) => vr.id === v))}>
              <SelectTrigger><SelectValue placeholder="Select variant" /></SelectTrigger>
              <SelectContent>
                {product.variants.map((v: any) => (
                  <SelectItem key={v.id} value={v.id}>{v.name} — {formatPrice(Number(v.price))}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quantity + Add to cart */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center border rounded-sm">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-neutral-600 hover:bg-neutral-50">-</button>
            <span className="px-3 py-2 text-sm min-w-[40px] text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-neutral-600 hover:bg-neutral-50">+</button>
          </div>
          <Button variant="luxury" size="lg" onClick={handleAdd} disabled={!inStock} className="flex-1 gap-2">
            <ShoppingBag className="h-4 w-4" />
            {added ? 'Added!' : !inStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>

        {/* Key info */}
        <div className="mt-6 space-y-2 border-t pt-4 text-sm text-neutral-600">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-800" /> 100% Authentic — Guaranteed Genuine</div>
          <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-amber-800" /> Lusaka Express & Nationwide Delivery</div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-6 border-t pt-6">
            <h2 className="text-sm font-medium text-neutral-900 mb-2">Description</h2>
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* How to use */}
        {product.howToUse && (
          <div className="mt-4 border-t pt-4">
            <h2 className="text-sm font-medium text-neutral-900 mb-2">How to Use</h2>
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{product.howToUse}</p>
          </div>
        )}

        {/* Ingredients */}
        {product.ingredients && (
          <div className="mt-4 border-t pt-4">
            <h2 className="text-sm font-medium text-neutral-900 mb-2">Ingredients</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">{product.ingredients}</p>
          </div>
        )}

        {/* Fragrance notes */}
        {(product.topNotes || product.middleNotes || product.baseNotes) && (
          <div className="mt-4 border-t pt-4">
            <h2 className="text-sm font-medium text-neutral-900 mb-3">Fragrance Notes</h2>
            <div className="space-y-2 text-sm">
              {product.topNotes && <div><span className="font-medium">Top:</span> <span className="text-neutral-600">{product.topNotes}</span></div>}
              {product.middleNotes && <div><span className="font-medium">Heart:</span> <span className="text-neutral-600">{product.middleNotes}</span></div>}
              {product.baseNotes && <div><span className="font-medium">Base:</span> <span className="text-neutral-600">{product.baseNotes}</span></div>}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {product.skinTypes?.map((t: string) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
          {product.concerns?.map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
          {product.fragranceFamily && <Badge variant="outline" className="text-xs">{product.fragranceFamily}</Badge>}
        </div>
      </motion.div>
    </div>
  )
}
