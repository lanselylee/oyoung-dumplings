import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('locale')?.value
  if (cookieLocale === 'zh' || cookieLocale === 'en') {
    locale = cookieLocale
  }

  if (locale !== 'zh' && locale !== 'en') locale = 'zh'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
