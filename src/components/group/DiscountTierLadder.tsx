'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import type { DiscountTier } from '@/types'

interface Props {
  tiers: DiscountTier[]
  currentPeople: number
  locale: string
}

export default function DiscountTierLadder({ tiers, currentPeople, locale }: Props) {
  const t = useTranslations()
  const sorted = [...tiers].sort((a, b) => a.min_people - b.min_people)

  return (
    <div className="card">
      <h3 className="font-bold mb-3">{t('group.tiers')}</h3>
      <div className="space-y-2">
        {sorted.map(tier => {
          const achieved = currentPeople >= tier.min_people
          const label = locale === 'zh' ? tier.label_zh : tier.label_en
          return (
            <div
              key={tier.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border ${
                achieved
                  ? 'border-[#F5A623] bg-[#FFF8F0]'
                  : 'border-[#E8D5C0] bg-white'
              }`}
            >
              <span className={`text-sm font-medium ${achieved ? 'text-[#F5A623]' : 'text-[#6B6B6B]'}`}>
                {label ?? `${tier.min_people} people · ${tier.discount_percent}% off`}
              </span>
              {achieved && <Check size={16} className="text-[#F5A623]" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
