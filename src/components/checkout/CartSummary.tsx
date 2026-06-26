'use client'

import { useTranslations } from 'next-intl'

interface Props {
  subtotal: number
  discountPercent: number
  total: number
  locale: string
  groupOrderId: string | null
}

export default function CartSummary({ subtotal, discountPercent, total, locale, groupOrderId }: Props) {
  const t = useTranslations()

  return (
    <div className="border-t border-[#E8D5C0] pt-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-[#6B6B6B]">{t('cart.subtotal')}</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      {groupOrderId && discountPercent > 0 && (
        <div className="flex justify-between text-[#F5A623]">
          <span>{t('cart.discount')} ({discountPercent}%)</span>
          <span>-${(subtotal - total).toFixed(2)}</span>
        </div>
      )}
      {groupOrderId && discountPercent === 0 && (
        <p className="text-xs text-[#6B6B6B] italic">{t('cart.estimatedDiscount')}</p>
      )}
      <div className="flex justify-between font-bold text-base pt-1 border-t border-[#E8D5C0]">
        <span>{t('cart.total')}</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  )
}
