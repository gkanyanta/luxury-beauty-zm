import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ProductDetail } from '@/components/shop/product-detail'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug }, include: { brand: true } })
  if (!product) return { title: 'Product Not Found' }
  return { title: `${product.name} | Luxury Beauty ZM`, description: product.description?.slice(0, 160) }
}

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug, status: 'ACTIVE' },
    include: {
      brand: true, category: true, images: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { active: true }, orderBy: { price: 'asc' } },
      reviews: { where: { approved: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <ProductDetail product={product} />
    </div>
  )
}
