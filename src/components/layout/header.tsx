'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const itemCount = useCartStore((s) => s.getItemCount())

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSearchResults(data.products || [])
      } catch { setSearchResults([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const categories = [
    { name: 'Fragrances', href: '/shop?category=fragrances' },
    { name: 'K-Beauty', href: '/shop?category=k-beauty' },
    { name: 'Skincare', href: '/shop?category=skincare' },
    { name: 'Hair Products', href: '/shop?category=hair-products' },
  ]

  return (
    <>
      <div className="bg-neutral-900 text-white text-center text-xs py-2 px-4 tracking-wider">
        FREE DELIVERY IN LUSAKA ON ORDERS OVER K2000
      </div>
      <header className={cn('sticky top-0 z-50 w-full transition-all duration-300', isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-lg sm:text-xl font-light tracking-[0.2em] text-neutral-900">
                LUXURY BEAUTY <span className="font-medium">ZM</span>
              </h1>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {categories.map((cat) => (
                <Link key={cat.name} href={cat.href} className="text-sm tracking-wide text-neutral-600 hover:text-neutral-900 transition-colors">{cat.name}</Link>
              ))}
              <Link href="/shop" className="text-sm tracking-wide text-neutral-600 hover:text-neutral-900 transition-colors">Shop All</Link>
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <Link href="/account/wishlist" className="hidden sm:block p-2 text-neutral-600 hover:text-neutral-900 transition-colors"><Heart className="h-5 w-5" /></Link>
              <Link href="/account" className="hidden sm:block p-2 text-neutral-600 hover:text-neutral-900 transition-colors"><User className="h-5 w-5" /></Link>
              <Link href="/cart" className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-neutral-100 bg-white">
              <div className="mx-auto max-w-7xl px-4 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <input ref={searchRef} type="text" placeholder="Search products, brands..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery) { router.push(`/shop?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false) } }}
                    className="w-full rounded-sm border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-3 divide-y divide-neutral-100">
                    {searchResults.slice(0, 5).map((product: any) => (
                      <Link key={product.id} href={`/product/${product.slug}`} onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 py-2 hover:bg-neutral-50 px-2 rounded">
                        {product.images?.[0]?.url && <img src={product.images[0].url} alt={product.name} className="h-10 w-10 rounded object-cover" />}
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-neutral-500">{product.brand?.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-neutral-100 bg-white lg:hidden">
              <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                {categories.map((cat) => (
                  <Link key={cat.name} href={cat.href} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm tracking-wide text-neutral-600 hover:text-neutral-900">{cat.name}</Link>
                ))}
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm tracking-wide text-neutral-600 hover:text-neutral-900">Shop All</Link>
                <div className="border-t border-neutral-100 pt-2 mt-2">
                  <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-neutral-600 hover:text-neutral-900">My Account</Link>
                  <Link href="/account/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-neutral-600 hover:text-neutral-900">Wishlist</Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
