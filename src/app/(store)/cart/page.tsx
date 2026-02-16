'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
        <h1 className="text-2xl font-light text-neutral-900 mb-2">Your cart is empty</h1>
        <p className="text-neutral-500 mb-6">Browse our collection to find something you love</p>
        <Link href="/shop"><Button variant="luxury">Continue Shopping</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId || ''}`} className="flex gap-4 p-4 border rounded-sm">
              <Link href={`/product/${item.slug}`} className="relative w-20 h-20 sm:w-24 sm:h-24 bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
                {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <div className="w-full h-full" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="text-sm font-medium text-neutral-900 hover:text-amber-800 line-clamp-2">{item.name}</Link>
                <p className="text-sm text-amber-800 mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center border rounded-sm">
                    <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)} className="p-1"><Minus className="h-3 w-3" /></button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} className="p-1"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => removeItem(item.productId, item.variantId)} className="text-neutral-400 hover:text-red-500 ml-auto"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="text-sm font-medium text-neutral-900 hidden sm:block">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="bg-neutral-50 border rounded-sm p-6 h-fit">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatPrice(getSubtotal())}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span className="text-neutral-500">Calculated at checkout</span></div>
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-medium">
            <span>Estimated Total</span>
            <span>{formatPrice(getSubtotal())}</span>
          </div>
          <Link href="/checkout" className="block mt-4">
            <Button variant="luxury" size="lg" className="w-full gap-2">Checkout <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <Link href="/shop" className="block text-center mt-3 text-sm text-neutral-500 hover:text-neutral-700">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
