import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PackingSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  })
  if (!order) notFound()

  return (
    <div className="max-w-3xl mx-auto p-8 print:p-0">
      <style>{`@media print { body { -webkit-print-color-adjust: exact; } .no-print { display: none; } }`}</style>
      <button onClick={() => typeof window !== 'undefined' && window.print()} className="no-print mb-4 px-4 py-2 bg-neutral-900 text-white rounded text-sm">Print</button>

      <div className="border p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">Luxury Beauty ZM</h1>
            <p className="text-sm text-neutral-500">Packing Slip</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">{order.orderNumber}</p>
            <p className="text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <h3 className="font-medium mb-1">Ship To</h3>
            <p>{order.shippingName}</p>
            <p>{order.shippingAddress}</p>
            <p>{order.shippingTown}, {order.shippingProvince}</p>
            <p>{order.shippingPhone}</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Order Details</h3>
            <p>Payment: {order.paymentMethod.replace(/_/g, ' ')}</p>
            <p>Status: {order.status}</p>
          </div>
        </div>

        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2">
              <th className="text-left py-2">Item</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.productName}{item.variantName ? ` (${item.variantName})` : ''}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{formatPrice(Number(item.price))}</td>
                <td className="py-2 text-right">{formatPrice(Number(item.total))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3} className="pt-4 text-right font-medium">Subtotal</td><td className="pt-4 text-right">{formatPrice(Number(order.subtotal))}</td></tr>
            {Number(order.discount) > 0 && <tr><td colSpan={3} className="text-right">Discount</td><td className="text-right">-{formatPrice(Number(order.discount))}</td></tr>}
            <tr><td colSpan={3} className="text-right">Shipping</td><td className="text-right">{formatPrice(Number(order.shippingCost))}</td></tr>
            <tr className="border-t-2"><td colSpan={3} className="pt-2 text-right font-bold">Total</td><td className="pt-2 text-right font-bold">{formatPrice(Number(order.total))}</td></tr>
          </tfoot>
        </table>

        <p className="text-xs text-neutral-500 text-center">Thank you for shopping with Luxury Beauty ZM</p>
      </div>
    </div>
  )
}
