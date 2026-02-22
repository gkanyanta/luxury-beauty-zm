import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItemData {
  productId: string
  variantId?: string
  slug: string
  name: string
  variantName?: string
  price: number
  image?: string
  quantity: number
  maxStock: number
}

interface StockValidationResult {
  success: boolean
  message?: string
  currentStock?: number
}

interface CartState {
  items: CartItemData[]
  addItem: (item: Omit<CartItemData, 'quantity'> & { quantity?: number }) => void
  validateAndAddItem: (item: Omit<CartItemData, 'quantity'> & { quantity?: number }) => Promise<StockValidationResult>
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          if (idx > -1) {
            const updated = [...state.items]
            const existing = updated[idx]
            updated[idx] = { ...existing, quantity: Math.min(existing.quantity + (item.quantity || 1), existing.maxStock) }
            return { items: updated }
          }
          return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] }
        })
      },
      validateAndAddItem: async (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        )
        const desiredQty = (existing?.quantity || 0) + (item.quantity || 1)

        try {
          const res = await fetch('/api/stock/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.productId,
              variantId: item.variantId,
              quantity: desiredQty,
            }),
          })

          if (!res.ok) {
            return { success: false, message: 'Unable to verify stock. Please try again.' }
          }

          const { available, currentStock } = await res.json()

          if (!available) {
            return {
              success: false,
              message: currentStock === 0
                ? 'This item is out of stock.'
                : `Only ${currentStock} left in stock.`,
              currentStock,
            }
          }

          // Stock is available — add to cart with fresh maxStock
          set((state) => {
            const idx = state.items.findIndex(
              (i) => i.productId === item.productId && i.variantId === item.variantId
            )
            if (idx > -1) {
              const updated = [...state.items]
              const existing = updated[idx]
              updated[idx] = {
                ...existing,
                quantity: Math.min(existing.quantity + (item.quantity || 1), currentStock),
                maxStock: currentStock,
              }
              return { items: updated }
            }
            return {
              items: [...state.items, { ...item, quantity: item.quantity || 1, maxStock: currentStock }],
            }
          })

          return { success: true, currentStock }
        } catch {
          return { success: false, message: 'Unable to verify stock. Please try again.' }
        }
      },
      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.productId === productId && i.variantId === variantId)),
        }))
      },
      updateQuantity: (productId, quantity, variantId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'luxury-beauty-cart' }
  )
)
