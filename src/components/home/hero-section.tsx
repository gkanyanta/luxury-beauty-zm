'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    image: '/hero/slide-1.jpeg',
    subtitle: 'Flawless Finish \u2022 Every Shade',
    title: ['Perfect Your', 'Complexion'],
    highlight: 'Ruby Kisses \u2022 Matte Powder Foundation',
    description: 'Achieve a flawless matte finish with our curated range of foundations and beauty essentials for every skin tone.',
    cta: { text: 'Shop Collection', href: '/shop' },
    cta2: { text: 'Explore Skincare', href: '/shop?category=skincare' },
  },
  {
    image: '/hero/slide-2.jpeg',
    subtitle: 'Luxury Fragrances \u2022 100% Authentic',
    title: ['Amouage', 'Guidance'],
    highlight: 'The Gift of Kings',
    description: 'Experience the art of fine perfumery. Authentic luxury fragrances from the world\u2019s most prestigious houses, delivered to Zambia.',
    cta: { text: 'Shop Fragrances', href: '/shop?category=fragrances' },
    cta2: { text: 'View All', href: '/shop' },
  },
  {
    image: '/hero/slide-3.jpeg',
    subtitle: 'Signature Scents \u2022 Iconic Brands',
    title: ['Kim Kardashian', 'Gold EDP'],
    highlight: '100ml \u2022 Eau de Parfum',
    description: 'Bold, glamorous, and unforgettable. Discover iconic celebrity fragrances and designer perfumes at unbeatable prices.',
    cta: { text: 'Shop Now', href: '/shop?category=fragrances' },
    cta2: { text: 'New Arrivals', href: '/shop' },
  },
  {
    image: '/hero/slide-4.jpeg',
    subtitle: 'Designer Perfumes \u2022 Delivered to You',
    title: ['YSL Libre', 'Eau de Parfum'],
    highlight: 'Yves Saint Laurent',
    description: 'Freedom in a bottle. Shop authentic YSL, Dior, Chanel, and more \u2014 Zambia\u2019s trusted destination for luxury beauty.',
    cta: { text: 'Shop Fragrances', href: '/shop?category=fragrances' },
    cta2: { text: 'Explore K-Beauty', href: '/shop?category=k-beauty' },
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-amber-950/30" />

      {/* Product images - positioned on the right */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-y-0 right-0 w-1/2 sm:w-[45%] transition-opacity duration-700 ease-in-out flex items-center justify-center"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt=""
            className="h-[88%] w-auto max-w-[90%] object-contain drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/60 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-2xl">
          <p
            key={`sub-${current}`}
            className="text-xs tracking-[0.3em] text-amber-200/80 uppercase mb-6 animate-fade-in-up"
          >
            {slide.subtitle}
          </p>
          <h1
            key={`title-${current}`}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {slide.title[0]}<br />
            <span className="text-amber-200/90 font-medium">{slide.title[1]}</span>
          </h1>
          <p
            key={`hl-${current}`}
            className="mt-3 text-sm tracking-[0.15em] text-amber-200/60 uppercase animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            {slide.highlight}
          </p>
          <p
            key={`desc-${current}`}
            className="mt-6 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-lg animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            {slide.description}
          </p>
          <div
            key={`cta-${current}`}
            className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <Link href={slide.cta.href}>
              <Button size="lg" variant="luxury" className="w-full sm:w-auto">
                {slide.cta.text}
              </Button>
            </Link>
            <Link href={slide.cta2.href}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white">
                {slide.cta2.text}
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
          <button onClick={prev} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-amber-200' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  )
}
