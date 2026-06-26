import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OrderStatusClient from '@/components/checkout/OrderStatusClient'

export default async function OrderPage({ params }: { params: Promise<{ locale: string; orderId: string }> }) {
  const { locale, orderId } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_item:menu_items(*)), pickup_location:pickup_locations(*), group_order:group_orders(*)')
    .eq('id', orderId)
    .single()

  if (!order) notFound()

  return <OrderStatusClient order={order} locale={locale} />
}
