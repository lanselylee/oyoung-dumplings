'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Users, DollarSign, Bell } from 'lucide-react'
import type { GroupOrder, Order } from '@/types'

interface Props {
  locale: string
  orders: Order[]
  activeGroups: GroupOrder[]
  revenue: number
}

export default function AdminDashboardClient({ locale, orders: initialOrders, activeGroups, revenue }: Props) {
  const t = useTranslations()
  const [orders, setOrders] = useState(initialOrders)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        setOrders(prev => [payload.new as Order, ...prev])
        setNewCount(c => c + 1)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleCloseGroup(groupId: string) {
    if (!confirm(t('admin.confirmClose'))) return
    await fetch('/api/groups/close', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}` },
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
        {newCount > 0 && (
          <span className="badge-red flex items-center gap-1 px-3 py-1">
            <Bell size={13} /> {newCount} {t('admin.newOrder')}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <ShoppingBag className="mx-auto text-[#D92B2B] mb-1" size={24} />
          <p className="text-2xl font-bold">{orders.length}</p>
          <p className="text-xs text-[#6B6B6B]">{t('admin.todayOrders')}</p>
        </div>
        <div className="card text-center">
          <Users className="mx-auto text-[#F5A623] mb-1" size={24} />
          <p className="text-2xl font-bold">{activeGroups.length}</p>
          <p className="text-xs text-[#6B6B6B]">{t('admin.activeGroups')}</p>
        </div>
        <div className="card text-center">
          <DollarSign className="mx-auto text-[#2E7D32] mb-1" size={24} />
          <p className="text-2xl font-bold">${revenue.toFixed(0)}</p>
          <p className="text-xs text-[#6B6B6B]">{t('admin.totalRevenue')}</p>
        </div>
      </div>

      {/* Active groups */}
      {activeGroups.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold mb-3">{t('admin.activeGroups')}</h2>
          <div className="space-y-3">
            {activeGroups.map(g => {
              const locName = locale === 'zh' ? g.pickup_location?.name_zh : g.pickup_location?.name_en
              return (
                <div key={g.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-medium">{locName}</p>
                    <p className="text-sm text-[#6B6B6B]">{g.current_people} people · closes {new Date(g.closes_at).toLocaleTimeString()}</p>
                  </div>
                  <button onClick={() => handleCloseGroup(g.id)} className="btn-outline text-sm py-2 px-4">
                    {t('admin.closeGroup')}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">{t('admin.orders')}</h2>
          <Link href={`/${locale}/admin/orders`} className="text-sm text-[#D92B2B]">View all →</Link>
        </div>
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{order.guest_name}</p>
                <p className="text-xs text-[#6B6B6B]">{order.order_type} · ${order.total_amount?.toFixed(2)}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                order.status === 'paid' ? 'bg-[#F5A623] text-white' :
                order.status === 'preparing' ? 'bg-[#D92B2B] text-white' :
                order.status === 'ready' ? 'bg-[#2E7D32] text-white' :
                'bg-gray-100 text-gray-600'
              }`}>
                {t(`order.status.${order.status}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Nav links */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        {(['menu', 'locations', 'groups', 'discounts'] as const).map(section => (
          <Link key={section} href={`/${locale}/admin/${section}`} className="card text-center hover:shadow-md transition-shadow">
            <p className="font-medium">{t(`admin.${section}`)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
