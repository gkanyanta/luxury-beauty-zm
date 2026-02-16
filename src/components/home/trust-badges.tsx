'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Truck, Lock, Award } from 'lucide-react'

const badges = [
  { icon: ShieldCheck, title: 'Authenticity Guarantee', description: '100% genuine products from authorized sources' },
  { icon: Truck, title: 'Countrywide Delivery', description: 'Lusaka express & nationwide shipping' },
  { icon: Lock, title: 'Secure Payments', description: 'Multiple safe payment options' },
  { icon: Award, title: 'Curated Selection', description: 'Expert-picked for diverse skin types' },
]

export function TrustBadges() {
  return (
    <section className="border-b border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {badges.map((badge, i) => (
            <motion.div key={badge.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <badge.icon className="mx-auto h-6 w-6 text-amber-800 mb-3" />
              <h3 className="text-sm font-medium text-neutral-900">{badge.title}</h3>
              <p className="mt-1 text-xs text-neutral-500">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
