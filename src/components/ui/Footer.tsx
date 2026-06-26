import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations()
  return (
    <footer className="bg-[#1A1A1A] text-[#6B6B6B] text-sm py-8 mt-12">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-1">
        <p className="text-white font-bold">{t('footer.name')}</p>
        <p>{t('footer.tagline')}</p>
        <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
      </div>
    </footer>
  )
}
