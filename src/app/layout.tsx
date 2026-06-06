import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://nirapod.com'),
  title: {
    default: 'Nirapod — Check before you pay',
    template: '%s — Nirapod',
  },
  description:
    'Search any Facebook shop or bKash number before sending money. Community-verified trust scores protect you from f-commerce scams in Bangladesh.',
  keywords: [
    'online shopping scam bangladesh',
    'facebook page scam check',
    'bkash scam number',
    'f-commerce fraud bangladesh',
    'nirapod',
    'নিরাপদ',
    'online scam bd',
  ],
  openGraph: {
    type:        'website',
    locale:      'en_BD',
    url:         'https://nirapod.com',
    siteName:    'Nirapod',
    title:       'Nirapod — Check before you pay',
    description: 'Community-verified trust scores for Facebook shops and bKash numbers in Bangladesh.',
    images: [
      {
        url:    '/og-image.png',
        width:  1200,
        height: 630,
        alt:    'Nirapod — Check before you pay',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Nirapod — Check before you pay',
    description: 'Community-verified trust scores for Facebook shops in Bangladesh.',
    images:      ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}