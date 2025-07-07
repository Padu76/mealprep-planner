import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meal Prep Planner',
  description: 'Rivoluziona la Tua Alimentazione con Meal Prep Planner. Generazione meal prep, Lista della Spesa Intelligente e Ricette Passo-Passo per una Vita più Sana e Semplice.',
  keywords: ['meal prep', 'ricette', 'pianificazione pasti', 'alimentazione sana', 'lista spesa'],
  authors: [{ name: 'Meal Prep Planner Team' }],
  creator: 'Meal Prep Planner',
  publisher: 'Meal Prep Planner',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/images/icon-192x192.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Meal Prep Planner',
    description: 'Rivoluziona la Tua Alimentazione con Meal Prep Planner',
    url: 'https://mealprep-planner.vercel.app',
    siteName: 'Meal Prep Planner',
    images: [
      {
        url: '/images/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Meal Prep Planner Logo',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meal Prep Planner',
    description: 'Rivoluziona la Tua Alimentazione con Meal Prep Planner',
    images: ['/images/icon-512x512.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" href="/images/icon-192x192.png" sizes="192x192" />
        <link rel="icon" href="/images/icon-512x512.png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
        <link rel="shortcut icon" href="/images/icon-192x192.png" />
        <meta name="theme-color" content="#8FBC8F" />
        <meta name="msapplication-TileColor" content="#8FBC8F" />
        <meta name="msapplication-TileImage" content="/images/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}