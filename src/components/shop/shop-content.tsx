'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/products/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export function ShopContent({ categories, brands }: { categories: any[]; brands: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    concern: searchParams.get('concern') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  })

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '12')
    if (filters.category) params.set('category', filters.category)
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.sort) params.set('sort', filters.sort)
    if (filters.search) params.set('search', filters.search)
    if (filters.concern) params.set('concern', filters.concern)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    try {
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch { setProducts([]) }
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/shop?${params}`, { scroll: false })
  }

  const clearFilters = () => {
    setFilters({ category: '', brand: '', sort: 'newest', search: '', concern: '', minPrice: '', maxPrice: '' })
    router.push('/shop', { scroll: false })
  }

  const activeFilterCount = [filters.category, filters.brand, filters.concern, filters.minPrice, filters.maxPrice].filter(Boolean).length

  return (
    <div>
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input placeholder="Search products..." value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Select value={filters.sort} onValueChange={(v) => updateFilter('sort', v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low-High</SelectItem>
              <SelectItem value="price_desc">Price: High-Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-neutral-50 border rounded-sm p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.brand} onValueChange={(v) => updateFilter('brand', v)}>
              <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Brands</SelectItem>
                {brands.map(b => <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Min Price" type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
            <Input placeholder="Max Price" type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1"><X className="h-3 w-3" /> Clear All</Button>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-neutral-500 mb-4">{pagination.total} product{pagination.total !== 1 ? 's' : ''} found</p>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-sm" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500">No products found matching your criteria.</p>
          <Button variant="outline" onClick={clearFilters} className="mt-4">Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <Button key={page} variant={page === pagination.page ? 'default' : 'outline'} size="sm" onClick={() => fetchProducts(page)}>
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
