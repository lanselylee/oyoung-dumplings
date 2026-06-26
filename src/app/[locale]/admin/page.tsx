import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayOrders } = await supabase
    .from('orders')
    .select('*, order_items(*, menu_item:menu_items(*)), pickup_location:pickup_locations(*)')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })

  const { data: activeGroups } = await supabase
    .from('group_orders')
    .select('*, pickup_location:pickup_locations(*)')
    .eq('status', 'open')

  const revenue = todayOrders?.filter(o => o.status !== 'pending').reduce((acc, o) => acc + (o.total_amount ?? 0), 0) ?? 0

  return (
    <AdminDashboardClient
      locale={locale}
      orders={todayOrders ?? []}
      activeGroups={activeGroups ?? []}
      revenue={revenue}
    />
  )
}
