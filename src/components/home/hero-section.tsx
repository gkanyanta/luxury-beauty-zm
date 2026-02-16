'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    image: '/hero/slide-1.svg',
    subtitle: '100% Authentic \u2022 Premium Quality',
    title: ['Radiant Beauty', 'Starts Here'],
    highlight: 'Luxury Beauty ZM',
    description: 'Discover your glow with our curated collection of authentic international beauty products, made for every skin type.',
    cta: { text: 'Shop Collection', href: '/shop' },
    cta2: { text: 'Explore Fragrances', href: '/shop?category=fragrances' },
  },
  {
    image: '/hero/slide-2.svg',
    subtitle: 'Flawless Skin \u2022 Naturally Beautiful',
    title: ['Embrace Your', 'Natural Glow'],
    highlight: 'Skincare Essentials',
    description: 'Premium K-Beauty and international skincare trusted by women across Zambia for radiant, healthy skin.',
    cta: { text: 'Shop Skincare', href: '/shop?category=skincare' },
    cta2: { text: 'K-Beauty', href: '/shop?category=k-beauty' },
  },
  {
    image: '/hero/slide-3.svg',
    subtitle: 'Signature Scents \u2022 Authentic Only',
    title: ['Original Perfumes', '& Fragrances'],
    highlight: 'From Top Houses',
    description: 'Chanel, Dior, Tom Ford, Creed, Byredo and more \u2014 100% authentic fragrances delivered to your door in Zambia.',
    cta: { text: 'Shop Fragrances', href: '/shop?category=fragrances' },
    cta2: { text: 'View All', href: '/shop' },
  },
  {
    image: '/hero/slide-4.svg',
    subtitle: 'K-Beauty \u2022 UK & USA Brands',
    title: ['Premium Skincare', 'Curated For You'],
    highlight: 'COSRX \u2022 CeraVe \u2022 The Ordinary',
    description: 'From snail mucin essences to BHA exfoliants \u2014 the best of Korean and Western skincare, available in Zambia.',
    cta: { text: 'Shop K-Beauty', href: '/shop?category=k-beauty' },
    cta2: { text: 'New Arrivals', href: '/shop' },
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
      {/* Background images - all preloaded, opacity toggle */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/50 to-transparent" />
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
