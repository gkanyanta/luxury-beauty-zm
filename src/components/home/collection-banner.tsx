'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const collections = [
  { title: 'Niche Perfumes', subtitle: 'Tom Ford, Creed, Byredo & Le Labo', href: '/shop?category=fragrances', bg: 'bg-gradient-to-r from-amber-900 to-amber-800' },
  { title: 'Glass Skin Essentials', subtitle: 'Korean skincare for radiant, dewy skin', href: '/shop?category=k-beauty', bg: 'bg-gradient-to-r from-rose-800 to-pink-700' },
  { title: 'Sensitive Skin Solutions', subtitle: 'Gentle, dermatologist-approved formulas', href: '/shop?concern=sensitive', bg: 'bg-gradient-to-r from-emerald-800 to-teal-700' },
]

export function CollectionBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900">Curated Collections</h2>
        <p className="mt-2 text-sm text-neutral-500">Discover collections tailored to your needs</p>
      </div>
      <div className="space-y-4">
        {collections.map((col, i) => (
          <motion.div key={col.title} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Link href={col.href} className={`block rounded-sm ${col.bg} p-8 sm:p-10 text-white hover:opacity-95 transition-opacity`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-light tracking-wide">{col.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{col.subtitle}</p>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex border-white/30 text-white hover:bg-white/10 hover:text-white">Shop Now</Button>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
