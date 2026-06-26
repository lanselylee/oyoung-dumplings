import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "O'Young Dumplings | 团购点餐",
  description: 'Fresh handmade dumplings — group orders, bigger savings | 新鲜手工饺子，拼团更优惠',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
