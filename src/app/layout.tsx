import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Luxury Beauty ZM | Authentic Fragrances & Premium Skincare', template: '%s | Luxury Beauty ZM' },
  description: "Zambia's premier destination for 100% authentic international fragrances, K-Beauty, and premium UK & USA skincare.",
  keywords: ['luxury beauty zambia', 'authentic perfumes lusaka', 'k-beauty zambia', 'skincare zambia'],
  openGraph: { type: 'website', locale: 'en_ZM', siteName: 'Luxury Beauty ZM' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
