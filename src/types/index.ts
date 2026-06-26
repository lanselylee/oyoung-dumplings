export type Locale = 'zh' | 'en'

export interface User {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  preferred_language: Locale
  created_at: string
}

export interface MenuItem {
  id: string
  name_zh: string
  name_en: string
  description_zh: string | null
  description_en: string | null
  image_url: string | null
  base_price: number
  category: string
  is_available: boolean
  sort_order: number
  created_at: string
}

export interface DiscountTier {
  id: string
  min_people: number
  discount_percent: number
  label_zh: string | null
  label_en: string | null
  sort_order: number
}

export interface PickupLocation {
  id: string
  name_zh: string
  name_en: string
  address: string
  google_maps_url: string | null
  is_active: boolean
  sort_order: number
}

export interface GroupOrder {
  id: string
  pickup_location_id: string
  status: 'open' | 'closed' | 'cancelled' | 'fulfilled'
  closes_at: string
  min_people: number
  current_people: number
  applied_discount_percent: number
  share_code: string
  created_at: string
  closed_at: string | null
  pickup_location?: PickupLocation
}

export interface Order {
  id: string
  group_order_id: string | null
  user_id: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  pickup_location_id: string
  order_type: 'group' | 'solo'
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'fulfilled'
  subtotal: number
  discount_percent: number
  total_amount: number
  stripe_payment_intent_id: string | null
  notes: string | null
  created_at: string
  order_items?: OrderItem[]
  pickup_location?: PickupLocation
  group_order?: GroupOrder
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  subtotal: number
  menu_item?: MenuItem
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: 'owner' | 'staff'
  created_at: string
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

export interface Cart {
  items: CartItem[]
  groupOrderId: string | null
  orderType: 'group' | 'solo'
  pickupLocationId: string | null
}
