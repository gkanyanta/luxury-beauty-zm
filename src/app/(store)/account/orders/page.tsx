import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

export const metadata = { title: 'My Orders | Luxury Beauty ZM' }

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account/orders')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="text-amber-800 hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="block border rounded-sm p-4 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium">{order.orderNumber}</span>
                  <span className="text-xs text-neutral-400 ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <Badge className={statusColors[order.status] || ''}>{order.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                <p className="font-medium">{formatPrice(Number(order.total))}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
