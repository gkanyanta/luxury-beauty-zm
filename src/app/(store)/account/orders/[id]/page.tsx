import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: { items: { include: { product: { include: { brand: true, images: { take: 1 } } } } } },
  })
  if (!order) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/account/orders" className="text-sm text-amber-800 hover:underline mb-4 block">&larr; Back to Orders</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light">{order.orderNumber}</h1>
        <Badge>{order.status}</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-medium mb-3">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm border-b pb-3">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  {item.variantName && <p className="text-xs text-neutral-500">{item.variantName}</p>}
                  <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                </div>
                <p>{formatPrice(Number(item.total))}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-neutral-50 p-4 rounded-sm">
            <h3 className="font-medium mb-2 text-sm">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
              {Number(order.discount) > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatPrice(Number(order.discount))}</span></div>}
              <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{formatPrice(Number(order.shippingCost))}</span></div>
              <div className="flex justify-between font-medium border-t pt-2 mt-2"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div>
            </div>
          </div>
          <div className="bg-neutral-50 p-4 rounded-sm text-sm">
            <h3 className="font-medium mb-2">Shipping To</h3>
            <p>{order.shippingName}</p>
            <p className="text-neutral-500">{order.shippingAddress}</p>
            <p className="text-neutral-500">{order.shippingTown}, {order.shippingProvince}</p>
            <p className="text-neutral-500">{order.shippingPhone}</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-sm text-sm">
            <h3 className="font-medium mb-1">Payment</h3>
            <p className="text-neutral-500">{order.paymentMethod.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
