'use client'

import { Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { applyDiscount } from '@/lib/discount'
import { useCartStore } from '@/store/cart'
import type { MenuItem } from '@/types'

interface Props {
  item: MenuItem
  locale: string
  discountPercent: number
}

export default function MenuItemRow({ item, locale, discountPercent }: Props) {
  const t = useTranslations()
  const addItem = useCartStore(s => s.addItem)
  const removeItem = useCartStore(s => s.removeItem)
  const cartItems = useCartStore(s => s.items)
  const cartItem = cartItems.find(i => i.menuItem.id === item.id)
  const quantity = cartItem?.quantity ?? 0

  const name = locale === 'zh' ? item.name_zh : item.name_en
  const desc = locale === 'zh' ? item.description_zh : item.description_en
  const groupPrice = discountPercent > 0 ? applyDiscount(item.base_price, discountPercent) : null

  return (
    <div className="card flex gap-3">
      {item.image_url && (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
          <Image src={item.image_url} alt={name} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm">{name}</h4>
        {desc && <p className="text-xs text-[#6B6B6B] line-clamp-2 mt-0.5">{desc}</p>}
        <div className="flex items-center justify-between mt-2">
          <div>
            {groupPrice ? (
              <>
                <span className="text-[#F5A623] font-bold text-sm">${groupPrice.toFixed(2)}</span>
                <span className="text-xs text-[#6B6B6B] line-through ml-1">${item.base_price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-bold text-sm">${item.base_price.toFixed(2)}</span>
            )}
          </div>
          {item.is_available ? (
            <div className="flex items-center gap-2">
              {quantity > 0 ? (
                <>
                  <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full border border-[#D92B2B] text-[#D92B2B] flex items-center justify-center hover:bg-[#D92B2B] hover:text-white transition-colors">
                    <Minus size={13} />
                  </button>
                  <span className="w-4 text-center font-bold text-sm">{quantity}</span>
                </>
              ) : null}
              <button onClick={() => addItem(item)} className="w-7 h-7 rounded-full bg-[#D92B2B] text-white flex items-center justify-center hover:bg-[#B52222] transition-colors">
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <span className="text-xs text-[#6B6B6B]">{t('menu.outOfStock')}</span>
          )}
        </div>
      </div>
    </div>
  )
}
