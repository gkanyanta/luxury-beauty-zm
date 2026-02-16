'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const defaultCategories = [
  { name: 'Fragrances', slug: 'fragrances', description: 'Classic luxury, niche & contemporary perfumes', gradient: 'from-amber-900/80 to-amber-950/90' },
  { name: 'K-Beauty', slug: 'k-beauty', description: 'Korean skincare for glass skin goals', gradient: 'from-rose-800/80 to-rose-950/90' },
  { name: 'Skincare', slug: 'skincare', description: 'UK & USA premium dermatological brands', gradient: 'from-emerald-800/80 to-emerald-950/90' },
  { name: 'Hair Products', slug: 'hair-products', description: 'Professional hair care and styling', gradient: 'from-violet-800/80 to-violet-950/90' },
]

const gradientMap: Record<string, string> = {
  fragrances: 'from-amber-900/80 to-amber-950/90',
  'k-beauty': 'from-rose-800/80 to-rose-950/90',
  skincare: 'from-emerald-800/80 to-emerald-950/90',
  'hair-products': 'from-violet-800/80 to-violet-950/90',
}

export function CategoryCards({ categories }: { categories?: any[] }) {
  const displayCategories = categories?.length ? categories : defaultCategories

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">Shop by Category</h2>
        <p className="mt-2 text-sm text-neutral-500">Explore our curated collections</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayCategories.map((cat: any, i: number) => {
          const gradient = gradientMap[cat.slug] || defaultCategories[0].gradient
          const defaults = defaultCategories.find((d) => d.slug === cat.slug) || defaultCategories[0]
          return (
            <motion.div key={cat.slug || cat.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link href={`/shop?category=${cat.slug}`} className="group block relative h-64 sm:h-80 rounded-sm overflow-hidden bg-neutral-900">
                <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />
                <div className="relative h-full flex flex-col justify-end p-6">
                  <h3 className="text-xl font-light tracking-wide text-white">{cat.name}</h3>
                  <p className="mt-1 text-sm text-white/70">{cat.description || defaults.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-white/80 tracking-wider uppercase group-hover:gap-2 transition-all">
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
