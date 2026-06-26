'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Share2, Users, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { calculateDiscount, formatTimeLeft, nextTier } from '@/lib/discount'
import { useCartStore } from '@/store/cart'
import MenuItemRow from '@/components/menu/MenuItemRow'
import DiscountTierLadder from '@/components/group/DiscountTierLadder'
import type { DiscountTier, GroupOrder, MenuItem, PickupLocation } from '@/types'

interface Props {
  locale: string
  location: PickupLocation
  group: GroupOrder | null
  items: MenuItem[]
  tiers: DiscountTier[]
}

export default function GroupPageClient({ locale, location, group: initialGroup, items, tiers }: Props) {
  const t = useTranslations()
  const [group, setGroup] = useState<GroupOrder | null>(initialGroup)
  const [copied, setCopied] = useState(false)
  const setGroupOrderId = useCartStore(s => s.setGroupOrderId)
  const setPickupLocationId = useCartStore(s => s.setPickupLocationId)
  const setOrderType = useCartStore(s => s.setOrderType)

  const discount = group ? calculateDiscount(group.current_people, tiers) : 0
  const next = group ? nextTier(group.current_people, tiers) : null
  const timeLeft = group ? formatTimeLeft(group.closes_at) : ''
  const locationName = locale === 'zh' ? location.name_zh : location.name_en

  useEffect(() => {
    if (!group) return
    const supabase = createClient()
    const channel = supabase
      .channel(`group_order:${group.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'group_orders', filter: `id=eq.${group.id}` }, payload => {
        setGroup(payload.new as GroupOrder)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [group?.id])

  useEffect(() => {
    if (group) {
      setGroupOrderId(group.id)
      setOrderType('group')
    }
    setPickupLocationId(location.id)
  }, [group?.id, location.id])

  function handleShare() {
    if (!group) return
    const url = `${window.location.origin}/${locale}/group/share/${group.share_code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCreateGroup() {
    const supabase = createClient()
    const closesAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data } = await supabase
      .from('group_orders')
      .insert({ pickup_location_id: location.id, closes_at: closesAt, share_code: shareCode, min_people: 3 })
      .select()
      .single()
    if (data) setGroup(data)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{locationName}</h1>
        <p className="text-sm text-[#6B6B6B]">{location.address}</p>
      </div>

      {/* Group status banner */}
      {group && group.status === 'open' ? (
        <div className="bg-[#D92B2B] text-white rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span className="font-bold text-lg">{group.current_people} {locale === 'zh' ? '人' : 'people'}</span>
              {discount > 0 && <span className="badge-gold">{discount}% off</span>}
            </div>
            <div className="flex items-center gap-1 text-sm opacity-80">
              <Clock size={14} />
              <span>{timeLeft}</span>
            </div>
          </div>

          {/* Progress bar toward next tier */}
          {next && (
            <div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-[#F5A623] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (group.current_people / next.min_people) * 100)}%` }}
                />
              </div>
              <p className="text-xs opacity-80">
                {locale === 'zh'
                  ? `再来${next.min_people - group.current_people}人可享${next.discount_percent}%优惠`
                  : `${next.min_people - group.current_people} more for ${next.discount_percent}% off`}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card mb-6 text-center">
          <p className="text-[#6B6B6B] mb-4">{t('location.noGroup')}</p>
          <button onClick={handleCreateGroup} className="btn-primary">
            {t('location.startGroup')}
          </button>
        </div>
      )}

      {/* Discount tier ladder */}
      <DiscountTierLadder tiers={tiers} currentPeople={group?.current_people ?? 0} locale={locale} />

      {/* Menu */}
      <h2 className="text-xl font-bold mb-4 mt-6">{t('menu.title')}</h2>
      <div className="space-y-3">
        {items.map(item => (
          <MenuItemRow key={item.id} item={item} locale={locale} discountPercent={discount} />
        ))}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8D5C0] px-4 py-3 flex gap-3 md:hidden">
        {group && (
          <button onClick={handleShare} className="btn-outline flex-1 py-2.5">
            <Share2 size={16} className="inline mr-1" />
            {copied ? t('group.shareCopied') : t('group.shareButton')}
          </button>
        )}
        <Link href={`/${locale}/checkout`} className="btn-primary flex-1 py-2.5 text-center">
          {t('cart.checkout')} <ChevronRight size={16} className="inline" />
        </Link>
      </div>

      {/* Desktop share + checkout */}
      <div className="hidden md:flex gap-3 mt-8">
        {group && (
          <button onClick={handleShare} className="btn-outline">
            <Share2 size={16} className="inline mr-1" />
            {copied ? t('group.shareCopied') : t('group.shareButton')}
          </button>
        )}
        <Link href={`/${locale}/checkout`} className="btn-primary">
          {t('cart.checkout')} <ChevronRight size={16} className="inline" />
        </Link>
      </div>
    </div>
  )
}
