import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { ProductActions } from './product-actions'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { brand: true, category: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  const statusColor: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-800', DRAFT: 'bg-yellow-100 text-yellow-800', ARCHIVED: 'bg-gray-100 text-gray-800' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new"><Button className="gap-1"><Plus className="h-4 w-4" /> Add Product</Button></Link>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Brand</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
              <th className="text-right p-3 font-medium">Price</th>
              <th className="text-center p-3 font-medium hidden sm:table-cell">Stock</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="p-3 w-28"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-neutral-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <img src={product.images[0].url} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-neutral-100 shrink-0" />
                    )}
                    <p className="font-medium truncate max-w-[180px]">{product.name}</p>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell text-neutral-500">{product.brand?.name || '-'}</td>
                <td className="p-3 hidden md:table-cell text-neutral-500">{product.category?.name || '-'}</td>
                <td className="p-3 text-right">{formatPrice(Number(product.price))}</td>
                <td className="p-3 text-center hidden sm:table-cell">{product.stockQty}</td>
                <td className="p-3 text-center"><Badge className={statusColor[product.status] || ''}>{product.status}</Badge></td>
                <td className="p-3">
                  <ProductActions productId={product.id} productName={product.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-neutral-500">No products yet</p>}
      </div>
    </div>
  )
}
