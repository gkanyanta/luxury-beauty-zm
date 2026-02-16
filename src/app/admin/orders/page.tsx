import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800', PAID: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-purple-100 text-purple-800', SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Customer</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Payment</th>
              <th className="text-right p-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-neutral-50">
                <td className="p-3"><Link href={`/admin/orders/${order.id}`} className="font-medium text-amber-800 hover:underline">{order.orderNumber}</Link></td>
                <td className="p-3 hidden sm:table-cell text-neutral-500">{order.guestEmail || '-'}</td>
                <td className="p-3 hidden md:table-cell text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-center"><Badge className={statusColors[order.status] || ''}>{order.status}</Badge></td>
                <td className="p-3 hidden sm:table-cell text-neutral-500 text-xs">{order.paymentMethod.replace(/_/g, ' ')}</td>
                <td className="p-3 text-right font-medium">{formatPrice(Number(order.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-neutral-500">No orders yet</p>}
      </div>
    </div>
  )
}
