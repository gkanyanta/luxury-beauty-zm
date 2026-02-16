'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { formatPrice } from '@/lib/utils'
import { ZAMBIA_PROVINCES } from '@/lib/utils'
import { Loader2, CreditCard, Smartphone, Truck, Tag } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState<any>(null)
  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [lencoReady, setLencoReady] = useState(false)
  const [awaitingPayment, setAwaitingPayment] = useState<{
    reference: string
    total: number
    email: string
    orderNumber: string
  } | null>(null)

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    addressLine1: '', addressLine2: '', city: '', province: '', compound: '',
    paymentMethod: 'LENCO_ONLINE',
    notes: '',
  })

  useEffect(() => {
    if (items.length === 0 && !awaitingPayment) router.push('/cart')
    fetch('/api/shipping-rates').then(r => r.json()).then(data => setShippingRates(data)).catch(() => {})
  }, [items.length, router, awaitingPayment])

  useEffect(() => {
    if (form.province && shippingRates.length > 0) {
      const regionMap: Record<string, string> = {
        'Lusaka': 'LUSAKA', 'Copperbelt': 'COPPERBELT',
      }
      const region = regionMap[form.province] || 'OTHER'
      const rate = shippingRates.find(r => r.region === region) || shippingRates[shippingRates.length - 1]
      setSelectedRate(rate)
    }
  }, [form.province, shippingRates])

  const subtotal = getSubtotal()
  const shipping = selectedRate ? Number(selectedRate.baseRate) : 0
  const discountAmount = discount
    ? discount.type === 'PERCENTAGE' ? subtotal * (discount.value / 100) : Math.min(discount.value, subtotal)
    : 0
  const total = subtotal - discountAmount + shipping

  const validateDiscount = async () => {
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, subtotal }),
      })
      const data = await res.json()
      if (res.ok) { setDiscount(data); setError('') }
      else setError(data.error || 'Invalid code')
    } catch { setError('Failed to validate') }
  }

  const openLencoWidget = (paymentData: { reference: string; total: number; email: string; orderNumber: string }) => {
    if (typeof window === 'undefined' || !window.LencoPay) {
      setError('Payment system is loading. Please try again.')
      setLoading(false)
      return
    }

    window.LencoPay.getPaid({
      key: process.env.NEXT_PUBLIC_LENCO_PUBLIC_KEY || '',
      reference: paymentData.reference,
      amount: paymentData.total,
      currency: 'ZMW',
      email: paymentData.email,
      customer: {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      },
      onSuccess: async (response) => {
        try {
          const res = await fetch('/api/payments/lenco/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: response.reference }),
          })
          const data = await res.json()
          if (data.success) {
            clearCart()
            router.push(`/checkout/success?order=${paymentData.orderNumber}`)
          } else if (data.pending) {
            clearCart()
            router.push(`/checkout/verify?reference=${paymentData.reference}`)
          } else {
            setError('Payment verification failed. Please contact support.')
            setLoading(false)
          }
        } catch {
          clearCart()
          router.push(`/checkout/verify?reference=${paymentData.reference}`)
        }
      },
      onClose: () => {
        setAwaitingPayment(paymentData)
        setError('')
        setLoading(false)
      },
      onConfirmationPending: (response) => {
        clearCart()
        router.push(`/checkout/verify?reference=${response.reference}`)
      },
    })
  }

  const handleRetryPayment = () => {
    if (!awaitingPayment) return
    setLoading(true)
    setError('')
    openLencoWidget(awaitingPayment)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.province) { setError('Please select a province'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, items: items.map(i => ({
            productId: i.productId, variantId: i.variantId, quantity: i.quantity,
          })),
          discountCode: discount?.code || null,
          shippingRateId: selectedRate?.id || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')

      if (data.requiresPayment) {
        const paymentData = {
          reference: data.reference,
          total: data.total,
          email: data.email,
          orderNumber: data.orderNumber,
        }
        openLencoWidget(paymentData)
      } else {
        clearCart()
        router.push(`/checkout/success?order=${data.orderNumber}`)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  // Show retry UI when user closed the payment widget
  if (awaitingPayment) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Script
          src="https://pay.lenco.co/js/v1/inline.js"
          onReady={() => setLencoReady(true)}
        />
        <CreditCard className="mx-auto h-16 w-16 text-amber-800 mb-4" />
        <h1 className="text-2xl font-light text-neutral-900 mb-2">Complete Your Payment</h1>
        <p className="text-neutral-500 mb-2">
          Your order <span className="font-medium text-amber-800">{awaitingPayment.orderNumber}</span> has been saved.
        </p>
        <p className="text-sm text-neutral-400 mb-6">Click below to complete payment of {formatPrice(awaitingPayment.total)}.</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex gap-3 justify-center">
          <Button variant="luxury" size="lg" onClick={handleRetryPayment} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Opening...</> : 'Pay Now'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/account/orders')}>View Orders</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Script
        src="https://pay.lenco.co/js/v1/inline.js"
        onReady={() => setLencoReady(true)}
      />
      <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Contact */}
            <section>
              <h2 className="text-lg font-medium text-neutral-900 mb-3">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input required placeholder="First Name *" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                <Input required placeholder="Last Name *" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                <Input required type="email" placeholder="Email *" value={form.email} onChange={e => update('email', e.target.value)} />
                <Input required placeholder="Phone *" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </section>

            {/* Shipping address */}
            <section>
              <h2 className="text-lg font-medium text-neutral-900 mb-3">Shipping Address</h2>
              <div className="space-y-3">
                <Input required placeholder="Street Address *" value={form.addressLine1} onChange={e => update('addressLine1', e.target.value)} />
                <Input placeholder="Apartment, Compound, Suite (optional)" value={form.addressLine2} onChange={e => update('addressLine2', e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input required placeholder="City *" value={form.city} onChange={e => update('city', e.target.value)} />
                  <Select value={form.province} onValueChange={v => update('province', v)}>
                    <SelectTrigger><SelectValue placeholder="Province *" /></SelectTrigger>
                    <SelectContent>
                      {ZAMBIA_PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Compound / Area" value={form.compound} onChange={e => update('compound', e.target.value)} />
              </div>
            </section>

            {/* Payment method */}
            <section>
              <h2 className="text-lg font-medium text-neutral-900 mb-3">Payment Method</h2>
              <div className="space-y-2">
                {[
                  { value: 'LENCO_ONLINE', label: 'Pay Online', desc: 'Visa, Mastercard via Lenco', icon: CreditCard },
                  { value: 'MANUAL_MOBILE_MONEY', label: 'Mobile Money', desc: 'Airtel Money / MTN MoMo — send & share screenshot', icon: Smartphone },
                  { value: 'PAY_ON_DELIVERY', label: 'Pay on Delivery', desc: 'Lusaka only — cash or mobile money', icon: Truck },
                ].map(method => (
                  <label key={method.value} className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${form.paymentMethod === method.value ? 'border-amber-800 bg-amber-50/50' : 'hover:bg-neutral-50'}`}>
                    <input type="radio" name="paymentMethod" value={method.value} checked={form.paymentMethod === method.value} onChange={() => update('paymentMethod', method.value)} className="accent-amber-800" />
                    <method.icon className="h-5 w-5 text-neutral-600" />
                    <div>
                      <p className="text-sm font-medium">{method.label}</p>
                      <p className="text-xs text-neutral-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Notes */}
            <Input placeholder="Order notes (optional)" value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-50 border rounded-sm p-5 sticky top-24">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                    <span className="text-neutral-600 truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {/* Discount code */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
                  <Input placeholder="Discount code" value={discountCode} onChange={e => setDiscountCode(e.target.value)} className="pl-8 text-sm" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={validateDiscount} disabled={!discountCode}>Apply</Button>
              </div>
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                {discount && <div className="flex justify-between text-green-700"><span>Discount ({discount.code})</span><span>-{formatPrice(discountAmount)}</span></div>}
                <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{selectedRate ? formatPrice(shipping) : 'Select province'}</span></div>
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-medium text-lg">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
              {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
              <Button type="submit" variant="luxury" size="lg" className="w-full mt-4" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</> : `Pay ${formatPrice(total)}`}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
