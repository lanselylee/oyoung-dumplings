import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, MenuItem } from '@/types'

interface CartStore {
  items: CartItem[]
  orderType: 'group' | 'solo'
  groupOrderId: string | null
  pickupLocationId: string | null
  addItem: (menuItem: MenuItem) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  setOrderType: (type: 'group' | 'solo') => void
  setGroupOrderId: (id: string | null) => void
  setPickupLocationId: (id: string | null) => void
  clearCart: () => void
  subtotal: () => number
  discountedTotal: (discountPercent: number) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: 'group',
      groupOrderId: null,
      pickupLocationId: null,

      addItem: (menuItem) => {
        set(s => {
          const existing = s.items.find(i => i.menuItem.id === menuItem.id)
          if (existing) {
            return { items: s.items.map(i => i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i) }
          }
          return { items: [...s.items, { menuItem, quantity: 1 }] }
        })
      },

      removeItem: (menuItemId) => {
        set(s => ({ items: s.items.filter(i => i.menuItem.id !== menuItemId) }))
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }
        set(s => ({ items: s.items.map(i => i.menuItem.id === menuItemId ? { ...i, quantity } : i) }))
      },

      setOrderType: (type) => set({ orderType: type }),
      setGroupOrderId: (id) => set({ groupOrderId: id }),
      setPickupLocationId: (id) => set({ pickupLocationId: id }),
      clearCart: () => set({ items: [], groupOrderId: null }),

      subtotal: () => get().items.reduce((acc, i) => acc + i.menuItem.base_price * i.quantity, 0),

      discountedTotal: (discountPercent) => {
        const sub = get().subtotal()
        return sub * (1 - discountPercent / 100)
      },
    }),
    { name: 'oyoung-cart' }
  )
)
