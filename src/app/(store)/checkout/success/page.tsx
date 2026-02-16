import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export const metadata = { title: 'Order Confirmed | Luxury Beauty ZM' }

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
      <h1 className="text-2xl font-light text-neutral-900 mb-2">Thank You!</h1>
      <p className="text-neutral-500 mb-1">Your order has been placed successfully.</p>
      {order && <p className="text-sm text-amber-800 font-medium mb-6">Order Number: {order}</p>}
      <p className="text-sm text-neutral-500 mb-8">We&apos;ve sent a confirmation email with your order details. Our team will begin preparing your order shortly.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/shop"><Button variant="luxury">Continue Shopping</Button></Link>
        <Link href="/account/orders"><Button variant="outline">View Orders</Button></Link>
      </div>
    </div>
  )
}
