'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle, MapPin, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types'

const STATUS_ORDER = ['pending', 'paid', 'preparing', 'ready', 'fulfilled'] as const
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-200 text-gray-600',
  paid: 'bg-[#F5A623] text-white',
  preparing: 'bg-[#D92B2B] text-white',
  ready: 'bg-[#2E7D32] text-white',
  fulfilled: 'bg-[#2E7D32] text-white',
}

interface Props {
  order: Order
  locale: string
}

export default function OrderStatusClient({ order: initialOrder, locale }: Props) {
  const t = useTranslations()
  const [order, setOrder] = useState(initialOrder)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`order:${order.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` }, payload => {
        setOrder(prev => ({ ...prev, ...(payload.new as Partial<Order>) }))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [order.id])

  const locationName = locale === 'zh'
    ? order.pickup_location?.name_zh
    : order.pickup_location?.name_en

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <CheckCircle className="text-[#2E7D32] mx-auto mb-3" size={52} />
        <h1 className="text-2xl font-bold">{t('order.confirmed')}</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">{t('order.emailSent')}</p>
      </div>

      {/* Status badge */}
      <div className="flex justify-center mb-6">
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${STATUS_COLORS[order.status]}`}>
          {t(`order.status.${order.status}`)}
        </span>
      </div>

      {/* Order ID */}
      <div className="card mb-4">
        <p className="text-xs text-[#6B6B6B] mb-0.5">{t('order.id')}</p>
        <p className="font-mono text-sm break-all">{order.id}</p>
      </div>

      {/* Pickup location */}
      <div className="card mb-4 flex gap-2 items-start">
        <MapPin size={18} className="text-[#D92B2B] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm">{locationName}</p>
          <p className="text-xs text-[#6B6B6B]">{order.pickup_location?.address}</p>
        </div>
      </div>

      {/* Group pending note */}
      {order.order_type === 'group' && order.group_order?.status === 'open' && (
        <div className="bg-[#FFF8F0] border border-[#F5A623] rounded-xl p-3 mb-4 text-sm text-[#6B6B6B]">
          {t('order.groupPending')}
        </div>
      )}

      {/* Order items */}
      <div className="card">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Package size={16} /> {t('order.items')}
        </h2>
        <div className="space-y-2">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {locale === 'zh' ? item.menu_item?.name_zh : item.menu_item?.name_en} × {item.quantity}
              </span>
              <span>${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
        {order.discount_percent > 0 && (
          <div className="flex justify-between text-sm text-[#F5A623] mt-2 pt-2 border-t border-[#E8D5C0]">
            <span>{t('cart.discount')} ({order.discount_percent}%)</span>
            <span>-${(order.subtotal - order.total_amount).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-[#E8D5C0]">
          <span>{t('order.total')}</span>
          <span>${order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      <p className="text-center text-sm text-[#6B6B6B] mt-8">{t('order.thankYou')}</p>
    </div>
  )
}
