'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { MapPin, Clock, Users } from 'lucide-react'
import { formatTimeLeft } from '@/lib/discount'
import type { GroupOrder, PickupLocation } from '@/types'

interface Props {
  location: PickupLocation
  group: GroupOrder | null
  locale: string
}

export default function LocationCard({ location, group, locale }: Props) {
  const t = useTranslations()
  const name = locale === 'zh' ? location.name_zh : location.name_en

  return (
    <div className="card hover:shadow-md transition-shadow">
      <h3 className="font-bold text-lg mb-1">{name}</h3>
      <div className="flex items-start gap-1.5 text-sm text-[#6B6B6B] mb-3">
        <MapPin size={14} className="mt-0.5 shrink-0" />
        <span>{location.address}</span>
      </div>

      {group ? (
        <div className="bg-[#FFF8F0] border border-[#E8D5C0] rounded-xl p-3 mb-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm">
            <Users size={14} className="text-[#D92B2B]" />
            <span className="font-medium text-[#D92B2B]">
              {t('location.activeGroup')}
            </span>
          </div>
          <div className="text-sm text-[#1A1A1A]">
            <span className="font-bold text-[#F5A623]">{group.current_people}</span> {locale === 'zh' ? '人' : 'people'}
            {group.applied_discount_percent > 0 && (
              <span className="ml-2 badge-gold">{group.applied_discount_percent}% off</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#6B6B6B]">
            <Clock size={12} />
            <span>{formatTimeLeft(group.closes_at)} {t('location.timeLeft', { time: '' }).replace('{time}', '').trim()}</span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm text-[#6B6B6B]">
          {t('location.noGroup')}
        </div>
      )}

      <div className="flex gap-2">
        {group ? (
          <Link href={`/${locale}/group/${location.id}`} className="btn-primary text-sm flex-1 text-center py-2.5 px-4 rounded-xl">
            {t('location.joinGroup')}
          </Link>
        ) : (
          <Link href={`/${locale}/group/${location.id}`} className="btn-outline text-sm flex-1 text-center py-2.5 px-4 rounded-xl">
            {t('location.startGroup')}
          </Link>
        )}
        {location.google_maps_url && (
          <a
            href={location.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#E8D5C0] text-sm px-3 py-2.5 rounded-xl hover:bg-[#E8D5C0] transition-colors"
          >
            <MapPin size={16} />
          </a>
        )}
      </div>
    </div>
  )
}
