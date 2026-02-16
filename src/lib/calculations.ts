export interface CartItem {
  productId: string
  variantId?: string
  price: number
  quantity: number
}

export interface ShippingRate {
  baseRate: number
  region: string
}

export interface DiscountCode {
  type: 'PERCENTAGE' | 'FLAT'
  value: number
  minSpend?: number | null
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateShipping(region: string, shippingRates: ShippingRate[]): number {
  const rate = shippingRates.find((r) => r.region === region)
  return rate ? rate.baseRate : 0
}

export function calculateDiscount(
  subtotal: number,
  discount: DiscountCode | null
): number {
  if (!discount) return 0
  if (discount.minSpend && subtotal < discount.minSpend) return 0

  if (discount.type === 'PERCENTAGE') {
    return Math.round(((subtotal * discount.value) / 100) * 100) / 100
  }

  return Math.min(discount.value, subtotal)
}

export function calculateTotal(
  subtotal: number,
  shipping: number,
  discount: number
): number {
  return Math.max(0, Math.round((subtotal + shipping - discount) * 100) / 100)
}

export function calculateOrderTotals(
  items: CartItem[],
  region: string,
  shippingRates: ShippingRate[],
  discountCode: DiscountCode | null = null
) {
  const subtotal = calculateSubtotal(items)
  const shipping = calculateShipping(region, shippingRates)
  const discount = calculateDiscount(subtotal, discountCode)
  const total = calculateTotal(subtotal, shipping, discount)

  return { subtotal, shipping, discount, total }
}
