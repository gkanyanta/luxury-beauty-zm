import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [orderCount, productCount, customerCount, recentOrders, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { items: true } }),
    prisma.order.aggregate({ where: { status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED'] } }, _sum: { total: true } }),
  ])

  const stats = [
    { label: 'Total Revenue', value: formatPrice(Number(revenue._sum.total || 0)), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Orders', value: orderCount, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Products', value: productCount, icon: Package, color: 'text-purple-600 bg-purple-50' },
    { label: 'Customers', value: customerCount, icon: Users, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-neutral-500">{s.label}</p>
                <p className="text-lg font-semibold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-amber-800 hover:underline">View all</Link>
        </div>
        <div className="divide-y">
          {recentOrders.map(order => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-neutral-50">
              <div>
                <p className="text-sm font-medium">{order.orderNumber}</p>
                <p className="text-xs text-neutral-500">{order.guestEmail || 'Registered'} &middot; {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatPrice(Number(order.total))}</p>
                <p className="text-xs text-neutral-500">{order.status}</p>
              </div>
            </Link>
          ))}
          {recentOrders.length === 0 && <p className="p-4 text-sm text-neutral-500">No orders yet</p>}
        </div>
      </div>
    </div>
  )
}
