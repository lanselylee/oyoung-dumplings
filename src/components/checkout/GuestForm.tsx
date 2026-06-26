'use client'

import { useTranslations } from 'next-intl'

interface GuestInfo {
  name: string
  email: string
  phone: string
  notes: string
}

interface Props {
  value: GuestInfo
  onChange: (v: GuestInfo) => void
  locale: string
}

export default function GuestForm({ value, onChange, locale }: Props) {
  const t = useTranslations()

  function set(field: keyof GuestInfo) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [field]: e.target.value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('checkout.guestName')} *</label>
        <input className="input" value={value.name} onChange={set('name')} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('checkout.guestEmail')} *</label>
        <input className="input" type="email" value={value.email} onChange={set('email')} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('checkout.guestPhone')}</label>
        <input className="input" type="tel" value={value.phone} onChange={set('phone')} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('checkout.notes')}</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder={t('checkout.notesPlaceholder')}
          value={value.notes}
          onChange={set('notes')}
        />
      </div>
    </div>
  )
}
