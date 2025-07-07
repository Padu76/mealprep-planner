import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Meal Prep Planner',
  description: 'Pianifica i tuoi pasti settimanali con intelligenza artificiale',
  manifest: '/manifest.json',
  themeColor: '#8FBC8F',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Meal Prep Planner',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: '/icon-192x192.png',
    apple: [
      { url: '/icon-192x192.png' },
      { url: '/icon-512x512.png', sizes: '512x512' },
    ],
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
        <meta name="application-name" content="Meal Prep Planner" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Meal Prep Planner" />
        <meta name="description" content="Pianifica i tuoi pasti settimanali con intelligenza artificiale" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#8FBC8F" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#8FBC8F" />

        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}