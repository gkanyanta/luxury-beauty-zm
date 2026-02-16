import { ProductForm } from '@/components/admin/product-form'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ])
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Add New Product</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  )
}
