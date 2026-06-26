'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Globe, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const cartCount = useCartStore(s => s.items.reduce((acc, i) => acc + i.quantity, 0))

  function toggleLocale() {
    const next = locale === 'zh' ? 'en' : 'zh'
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    document.cookie = `locale=${next}; path=/; max-age=31536000`
    router.push(newPath)
  }

  return (
    <header className="bg-[#D92B2B] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="font-bold text-lg tracking-wide">
          🥟 O&apos;Young Dumplings
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href={`/${locale}/menu`} className="hover:text-[#F5A623] transition-colors">
            {t('nav.menu')}
          </Link>
          <Link href={`/${locale}/account/orders`} className="hover:text-[#F5A623] transition-colors">
            {t('nav.orders')}
          </Link>
          <button onClick={toggleLocale} className="flex items-center gap-1 hover:text-[#F5A623] transition-colors">
            <Globe size={16} />
            {locale === 'zh' ? 'EN' : '中文'}
          </button>
          <Link href={`/${locale}/checkout`} className="relative">
            <ShoppingCart size={20} className="hover:text-[#F5A623] transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F5A623] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <Link href={`/${locale}/checkout`} className="relative">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F5A623] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#B52222] px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
          <Link href={`/${locale}/menu`} onClick={() => setOpen(false)}>{t('nav.menu')}</Link>
          <Link href={`/${locale}/account/orders`} onClick={() => setOpen(false)}>{t('nav.orders')}</Link>
          <button onClick={() => { toggleLocale(); setOpen(false) }} className="text-left">
            {locale === 'zh' ? 'Switch to English' : '切换到中文'}
          </button>
        </div>
      )}
    </header>
  )
}
