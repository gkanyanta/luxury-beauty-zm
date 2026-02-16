import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { OrderActions } from '@/components/admin/order-actions'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { brand: true } } } },
      user: { select: { name: true, email: true } },
      discountCode: true,
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!order) notFound()

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-amber-800 hover:underline mb-4 block">&larr; Back to Orders</Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge>{order.status}</Badge>
          <Link href={`/admin/orders/${order.id}/packing-slip`} className="text-sm text-amber-800 hover:underline">Packing Slip</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-medium mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.product.brand && <p className="text-xs text-neutral-500">{item.product.brand.name}</p>}
                    {item.variantName && <p className="text-xs text-neutral-400">Variant: {item.variantName}</p>}
                    <p className="text-xs text-neutral-400">Qty: {item.quantity} x {formatPrice(Number(item.price))}</p>
                  </div>
                  <p className="font-medium">{formatPrice(Number(item.total))}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payments */}
          {order.transactions.length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <h2 className="font-medium mb-3">Payment Transactions</h2>
              <div className="space-y-2 text-sm">
                {order.transactions.map((p) => (
                  <div key={p.id} className="flex justify-between border-b pb-2 last:border-0">
                    <div>
                      <p>{p.provider} — {p.reference}</p>
                      <p className="text-xs text-neutral-400">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge className={p.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : p.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <OrderActions orderId={order.id} currentStatus={order.status} paymentMethod={order.paymentMethod} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium mb-2 text-sm">Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-700"><span>Discount {order.discountCode ? `(${order.discountCode.code})` : ''}</span><span>-{formatPrice(Number(order.discount))}</span></div>
              )}
              <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{formatPrice(Number(order.shippingCost))}</span></div>
              <div className="flex justify-between font-medium border-t pt-2 mt-2"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4 text-sm">
            <h3 className="font-medium mb-2">Customer</h3>
            <p>{order.shippingName}</p>
            <p className="text-neutral-500">{order.user?.email || order.guestEmail || '-'}</p>
            <p className="text-neutral-500">{order.shippingPhone}</p>
          </div>

          <div className="bg-white rounded-lg border p-4 text-sm">
            <h3 className="font-medium mb-2">Shipping Address</h3>
            <p>{order.shippingAddress}</p>
            <p>{order.shippingTown}, {order.shippingProvince}</p>
          </div>

          <div className="bg-white rounded-lg border p-4 text-sm">
            <h3 className="font-medium mb-1">Payment Method</h3>
            <p className="text-neutral-500">{order.paymentMethod.replace(/_/g, ' ')}</p>
          </div>

          {order.customerNotes && (
            <div className="bg-white rounded-lg border p-4 text-sm">
              <h3 className="font-medium mb-1">Notes</h3>
              <p className="text-neutral-500">{order.customerNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
