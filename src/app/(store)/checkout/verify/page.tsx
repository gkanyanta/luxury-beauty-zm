'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function VerifyContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) { setStatus('failed'); return }
    fetch('/api/payments/lenco/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success')
          setOrderNumber(data.orderNumber || '')
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-amber-800 animate-spin mb-4" />
        <p className="text-neutral-600">Verifying your payment...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
        <h1 className="text-2xl font-light text-neutral-900 mb-2">Payment Confirmed!</h1>
        {orderNumber && <p className="text-sm text-amber-800 font-medium mb-6">Order: {orderNumber}</p>}
        <div className="flex gap-3 justify-center">
          <Link href="/shop"><Button variant="luxury">Continue Shopping</Button></Link>
          <Link href="/account/orders"><Button variant="outline">View Orders</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-light text-neutral-900 mb-2">Payment Failed</h1>
      <p className="text-neutral-500 mb-6">We couldn&apos;t verify your payment. Please try again or contact support.</p>
      <div className="flex gap-3 justify-center">
        <Link href="/checkout"><Button variant="luxury">Try Again</Button></Link>
        <Link href="/shop"><Button variant="outline">Back to Shop</Button></Link>
      </div>
    </div>
  )
}

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-amber-800 animate-spin mb-4" />
        <p className="text-neutral-600">Verifying your payment...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
