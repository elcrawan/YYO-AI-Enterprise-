import type { Metadata } from 'next'
import { Inter, Cairo } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { LanguageProvider } from '@/components/providers/language-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { SocketProvider } from '@/components/providers/socket-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'YYO Agent AI - نظام إداري مؤسسي ذكي',
    template: '%s | YYO Agent AI'
  },
  description: 'نظام إداري مؤسسي ذكي شامل يعمل كمساعد متكامل لجميع إدارات المؤسسة',
  keywords: [
    'YYO Agent AI',
    'نظام إداري',
    'ذكاء اصطناعي',
    'إدارة مؤسسية',
    'تحليل البيانات',
    'Enterprise Management',
    'AI Assistant',
    'Business Intelligence'
  ],
  authors: [{ name: 'YYO AI Team' }],
  creator: 'YYO AI',
  publisher: 'YYO AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/ar',
      'en': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
    url: '/',
    title: 'YYO Agent AI - نظام إداري مؤسسي ذكي',
    description: 'نظام إداري مؤسسي ذكي شامل يعمل كمساعد متكامل لجميع إدارات المؤسسة',
    siteName: 'YYO Agent AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YYO Agent AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YYO Agent AI - نظام إداري مؤسسي ذكي',
    description: 'نظام إداري مؤسسي ذكي شامل يعمل كمساعد متكامل لجميع إدارات المؤسسة',
    images: ['/og-image.png'],
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
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="YYO Agent AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.variable} ${cairo.variable} font-arabic antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              <LanguageProvider>
                <SocketProvider>
                  <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1">
                      {children}
                    </div>
                  </div>
                  <ToastProvider />
                </SocketProvider>
              </LanguageProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

