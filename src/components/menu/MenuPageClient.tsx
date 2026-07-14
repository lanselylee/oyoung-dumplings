'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { applyDiscount } from '@/lib/discount'
import type { DiscountTier, MenuItem } from '@/types'

interface Props {
  locale: string
  items: MenuItem[]
  tiers: DiscountTier[]
}

export default function MenuPageClient({ locale, items }: Props) {
  const t = useTranslations()
  const addItem = useCartStore(s => s.addItem)
  const groupOrderId = useCartStore(s => s.groupOrderId)
  const discountPercent = useCartStore(s => {
    if (!s.groupOrderId) return 0
    return 0 // real value comes from group page
  })

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))]
  const [activeCategory, setActiveCategory] = useState('all')
  const [addedId, setAddedId] = useState<string | null>(null)

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory)

  function handleAdd(item: MenuItem) {
    addItem(item)
    setAddedId(item.id)
    setTimeout(() => setAddedId(null), 800)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('menu.title')}</h1>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-[#D92B2B] text-white'
                : 'bg-white border border-[#E8D5C0] text-[#1A1A1A] hover:border-[#D92B2B]'
            }`}
          >
            {cat === 'all' ? t('menu.allCategories') : cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => {
          const name = locale === 'zh' ? item.name_zh : item.name_en
          const desc = locale === 'zh' ? item.description_zh : item.description_en
          const groupPrice = groupOrderId ? applyDiscount(item.base_price, discountPercent) : null

          return (
            <div key={item.id} className="card flex flex-col">
              {item.image_url && (
                <div className="relative h-40 rounded-xl overflow-hidden mb-3 -mx-4 -mt-4">
                  <Image src={item.image_url} alt={name} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold mb-0.5">{name}</h3>
                {desc && <p className="text-xs text-[#6B6B6B] mb-2">{desc}</p>}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  {groupPrice ? (
                    <>
                      <span className="text-[#F5A623] font-bold">${groupPrice.toFixed(2)}</span>
                      <span className="text-xs text-[#6B6B6B] line-through ml-1.5">${item.base_price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="font-bold">${item.base_price.toFixed(2)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleAdd(item)}
                  disabled={!item.is_available}
                  className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                    addedId === item.id
                      ? 'bg-[#2E7D32] text-white scale-95'
                      : 'bg-[#D92B2B] text-white hover:bg-[#B52222]'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <Plus size={14} />
                  {addedId === item.id ? '✓' : t('menu.addToCart')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
