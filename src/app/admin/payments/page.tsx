import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

export const dynamic = 'force-dynamic'

export default async function AdminPaymentsPage() {
  const transactions = await prisma.paymentTransaction.findMany({
    include: { order: { select: { id: true, orderNumber: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Payments</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Reference</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Provider</th>
              <th className="text-right p-3 font-medium">Amount</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Customer</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Order</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-neutral-50">
                <td className="p-3">
                  <Link href={`/admin/orders/${tx.order.id}`} className="font-medium text-amber-800 hover:underline">
                    {tx.reference}
                  </Link>
                </td>
                <td className="p-3 hidden sm:table-cell text-neutral-500 text-xs">
                  {tx.provider.replace(/_/g, ' ')}
                </td>
                <td className="p-3 text-right font-medium">
                  {formatPrice(Number(tx.amount))}
                </td>
                <td className="p-3 text-center">
                  <Badge className={statusColors[tx.status] || ''}>{tx.status}</Badge>
                </td>
                <td className="p-3 hidden md:table-cell text-neutral-500 text-xs">
                  {tx.customerEmail || '-'}
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <Link href={`/admin/orders/${tx.order.id}`} className="text-amber-800 hover:underline">
                    {tx.order.orderNumber}
                  </Link>
                </td>
                <td className="p-3 hidden md:table-cell text-neutral-500">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="p-8 text-center text-neutral-500">No payment transactions yet</p>
        )}
      </div>
    </div>
  )
}
