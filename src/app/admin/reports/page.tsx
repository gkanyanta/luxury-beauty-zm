import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { DollarSign, ShoppingBag, TrendingUp, CreditCard } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PAID_STATUSES = ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED'] as const

export default async function AdminReportsPage() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    revenueAgg,
    totalOrders,
    ordersByStatus,
    revenueByPaymentMethod,
    topProducts,
    recentPaidOrders,
    orderItemsByProduct,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: [...PAID_STATUSES] } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count(),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ['paymentMethod'],
      where: { status: { in: [...PAID_STATUSES] } },
      _count: true,
      _sum: { total: true },
    }),
    prisma.product.findMany({
      where: { soldCount: { gt: 0 } },
      orderBy: { soldCount: 'desc' },
      take: 10,
      include: { category: { select: { name: true } } },
    }),
    prisma.order.findMany({
      where: {
        status: { in: [...PAID_STATUSES] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { total: true },
      _count: true,
    }),
  ])

  const totalRevenue = Number(revenueAgg._sum.total || 0)
  const paidOrderCount = revenueAgg._count
  const avgOrderValue = paidOrderCount > 0 ? totalRevenue / paidOrderCount : 0

  // Build daily revenue from JS grouping
  const dailyMap = new Map<string, { orders: number; revenue: number }>()
  for (const order of recentPaidOrders) {
    const day = new Date(order.createdAt).toISOString().slice(0, 10)
    const entry = dailyMap.get(day) || { orders: 0, revenue: 0 }
    entry.orders++
    entry.revenue += Number(order.total)
    dailyMap.set(day, entry)
  }
  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }))

  // Resolve categories for revenue-by-category
  const productIds = orderItemsByProduct.map(i => i.productId)
  const products = productIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, categoryId: true, category: { select: { name: true } } },
      })
    : []
  const productCategoryMap = new Map(products.map(p => [p.id, p.category.name]))

  const categoryRevenueMap = new Map<string, { revenue: number; count: number }>()
  for (const item of orderItemsByProduct) {
    const catName = productCategoryMap.get(item.productId) || 'Uncategorized'
    const entry = categoryRevenueMap.get(catName) || { revenue: 0, count: 0 }
    entry.revenue += Number(item._sum.total || 0)
    entry.count += item._count
    categoryRevenueMap.set(catName, entry)
  }
  const revenueByCategory = Array.from(categoryRevenueMap.entries())
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([name, data]) => ({ name, ...data }))

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Avg Order Value', value: formatPrice(avgOrderValue), icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
    { label: 'Paid Orders', value: paidOrderCount, icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Reports</h1>

      {/* Summary Cards */}
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

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders by Status */}
        <div className="bg-white rounded-lg border">
          <h2 className="font-medium p-4 border-b">Orders by Status</h2>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Count</th>
                <th className="text-right p-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ordersByStatus.map(row => (
                <tr key={row.status} className="hover:bg-neutral-50">
                  <td className="p-3">{row.status}</td>
                  <td className="p-3 text-right">{row._count}</td>
                  <td className="p-3 text-right">{formatPrice(Number(row._sum.total || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ordersByStatus.length === 0 && (
            <p className="p-6 text-center text-neutral-500 text-sm">No orders yet</p>
          )}
        </div>

        {/* Revenue by Payment Method */}
        <div className="bg-white rounded-lg border">
          <h2 className="font-medium p-4 border-b">Revenue by Payment Method</h2>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Method</th>
                <th className="text-right p-3 font-medium">Orders</th>
                <th className="text-right p-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {revenueByPaymentMethod.map(row => (
                <tr key={row.paymentMethod} className="hover:bg-neutral-50">
                  <td className="p-3">{row.paymentMethod.replace(/_/g, ' ')}</td>
                  <td className="p-3 text-right">{row._count}</td>
                  <td className="p-3 text-right">{formatPrice(Number(row._sum.total || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {revenueByPaymentMethod.length === 0 && (
            <p className="p-6 text-center text-neutral-500 text-sm">No paid orders yet</p>
          )}
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-lg border">
          <h2 className="font-medium p-4 border-b">Revenue by Category</h2>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-right p-3 font-medium">Items Sold</th>
                <th className="text-right p-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {revenueByCategory.map(row => (
                <tr key={row.name} className="hover:bg-neutral-50">
                  <td className="p-3">{row.name}</td>
                  <td className="p-3 text-right">{row.count}</td>
                  <td className="p-3 text-right">{formatPrice(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {revenueByCategory.length === 0 && (
            <p className="p-6 text-center text-neutral-500 text-sm">No sales data yet</p>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-lg border">
          <h2 className="font-medium p-4 border-b">Top Selling Products</h2>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Category</th>
                <th className="text-right p-3 font-medium">Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topProducts.map(product => (
                <tr key={product.id} className="hover:bg-neutral-50">
                  <td className="p-3 max-w-[200px] truncate">{product.name}</td>
                  <td className="p-3 hidden sm:table-cell text-neutral-500">{product.category.name}</td>
                  <td className="p-3 text-right font-medium">{product.soldCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topProducts.length === 0 && (
            <p className="p-6 text-center text-neutral-500 text-sm">No products sold yet</p>
          )}
        </div>
      </div>

      {/* Daily Revenue (Last 30 Days) */}
      <div className="bg-white rounded-lg border">
        <h2 className="font-medium p-4 border-b">Daily Revenue (Last 30 Days)</h2>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-right p-3 font-medium">Orders</th>
              <th className="text-right p-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {dailyRevenue.map(row => (
              <tr key={row.date} className="hover:bg-neutral-50">
                <td className="p-3">{row.date}</td>
                <td className="p-3 text-right">{row.orders}</td>
                <td className="p-3 text-right">{formatPrice(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {dailyRevenue.length === 0 && (
          <p className="p-6 text-center text-neutral-500 text-sm">No revenue in the last 30 days</p>
        )}
      </div>
    </div>
  )
}
