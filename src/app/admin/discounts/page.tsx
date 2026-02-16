import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Discount Codes</h1>
        <Link href="/admin/discounts/new"><Button className="gap-1"><Plus className="h-4 w-4" /> Add Discount</Button></Link>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Code</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Value</th>
              <th className="text-center p-3 font-medium hidden sm:table-cell">Used</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {discounts.map(d => (
              <tr key={d.id} className="hover:bg-neutral-50">
                <td className="p-3 font-mono font-medium">{d.code}</td>
                <td className="p-3 text-neutral-500">{d.type}</td>
                <td className="p-3 text-right">{d.type === 'PERCENTAGE' ? `${Number(d.value)}%` : formatPrice(Number(d.value))}</td>
                <td className="p-3 text-center hidden sm:table-cell">{d.usedCount}{d.maxUses ? `/${d.maxUses}` : ''}</td>
                <td className="p-3 text-center"><Badge className={d.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{d.active ? 'Active' : 'Inactive'}</Badge></td>
                <td className="p-3 hidden md:table-cell text-neutral-500 text-xs">{new Date(d.endDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {discounts.length === 0 && <p className="p-8 text-center text-neutral-500">No discount codes yet</p>}
      </div>
    </div>
  )
}
