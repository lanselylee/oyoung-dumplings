'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCartStore } from '@/store/cart'

interface Props {
  clientSecret: string
  orderId: string
  locale: string
  onBack: () => void
}

export default function StripePaymentForm({ orderId, locale, onBack }: Props) {
  const t = useTranslations()
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const clearCart = useCartStore(s => s.clearCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/order/${orderId}`,
      },
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message ?? t('common.error'))
      setLoading(false)
    } else {
      clearCart()
      router.push(`/${locale}/order/${orderId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-[#C62828] text-sm">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-outline flex-1">{t('common.back')}</button>
        <button type="submit" disabled={!stripe || loading} className="btn-primary flex-1">
          {loading ? t('checkout.processing') : t('checkout.placeOrder')}
        </button>
      </div>
    </form>
  )
}
