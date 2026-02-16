import prisma from '@/lib/prisma'
import { HeroSection } from '@/components/home/hero-section'
import { CategoryCards } from '@/components/home/category-cards'
import { FeaturedProducts } from '@/components/home/featured-products'
import { TrustBadges } from '@/components/home/trust-badges'
import { CollectionBanner } from '@/components/home/collection-banner'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'ACTIVE', featured: true },
      include: { brand: true, category: true, images: { take: 2, orderBy: { sortOrder: 'asc' } } },
      take: 8,
    }).catch(() => []),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])

  return (
    <>
      <HeroSection />
      <TrustBadges />
      <CategoryCards categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <CollectionBanner />
    </>
  )
}
