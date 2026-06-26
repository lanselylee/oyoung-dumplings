'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import { useCartStore } from '@/store/cart'
import CartSummary from '@/components/checkout/CartSummary'
import GuestForm from '@/components/checkout/GuestForm'
import StripePaymentForm from '@/components/checkout/StripePaymentForm'
import { Minus, Plus, Trash2 } from 'lucide-react'

interface Props {
  locale: string
}

export default function CheckoutClient({ locale }: Props) {
  const t = useTranslations()
  const router = useRouter()
  const { items, orderType, groupOrderId, pickupLocationId, subtotal, updateQuantity, removeItem } = useCartStore()
  const [step, setStep] = useState<'cart' | 'info' | 'payment'>('cart')
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '', notes: '' })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sub = subtotal()
  const discountPercent = 0 // comes from group order data — simplified here
  const total = sub * (1 - discountPercent / 100)

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-[#6B6B6B] mb-4">{t('cart.empty')}</p>
        <a href={`/${locale}/menu`} className="btn-primary inline-block">{t('nav.menu')}</a>
      </div>
    )
  }

  async function handleProceedToPayment() {
    if (!guestInfo.name || !guestInfo.email) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ menuItemId: i.menuItem.id, quantity: i.quantity, unitPrice: i.menuItem.base_price })),
          groupOrderId,
          pickupLocationId,
          orderType,
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          guestPhone: guestInfo.phone,
          notes: guestInfo.notes,
        }),
      })
      const data = await res.json()
      setClientSecret(data.clientSecret)
      setOrderId(data.orderId)
      setStep('payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('checkout.title')}</h1>

      {/* Step: Cart */}
      {step === 'cart' && (
        <div>
          <div className="space-y-3 mb-6">
            {items.map(ci => (
              <div key={ci.menuItem.id} className="card flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {locale === 'zh' ? ci.menuItem.name_zh : ci.menuItem.name_en}
                  </p>
                  <p className="text-sm text-[#6B6B6B]">${(ci.menuItem.base_price * ci.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(ci.menuItem.id, ci.quantity - 1)} className="w-7 h-7 rounded-full border border-[#E8D5C0] flex items-center justify-center hover:border-[#D92B2B]">
                    <Minus size={13} />
                  </button>
                  <span className="w-4 text-center text-sm font-bold">{ci.quantity}</span>
                  <button onClick={() => updateQuantity(ci.menuItem.id, ci.quantity + 1)} className="w-7 h-7 rounded-full border border-[#E8D5C0] flex items-center justify-center hover:border-[#D92B2B]">
                    <Plus size={13} />
                  </button>
                  <button onClick={() => removeItem(ci.menuItem.id)} className="ml-1 text-[#C62828]">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <CartSummary subtotal={sub} discountPercent={discountPercent} total={total} locale={locale} groupOrderId={groupOrderId} />

          <button onClick={() => setStep('info')} className="btn-primary w-full mt-4">
            {t('common.confirm')} →
          </button>
        </div>
      )}

      {/* Step: Guest info */}
      {step === 'info' && (
        <div>
          <GuestForm value={guestInfo} onChange={setGuestInfo} locale={locale} />
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep('cart')} className="btn-outline flex-1">{t('common.back')}</button>
            <button
              onClick={handleProceedToPayment}
              disabled={loading || !guestInfo.name || !guestInfo.email}
              className="btn-primary flex-1"
            >
              {loading ? t('checkout.processing') : t('checkout.payment') + ' →'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Payment */}
      {step === 'payment' && clientSecret && orderId && (
        <Elements stripe={getStripe()} options={{ clientSecret }}>
          <StripePaymentForm
            clientSecret={clientSecret}
            orderId={orderId}
            locale={locale}
            onBack={() => setStep('info')}
          />
        </Elements>
      )}
    </div>
  )
}
