import type { Metadata } from 'next'
import { Inter, Cairo, Tajawal } from 'next/font/google'
import './globals.css'

// Providers
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { LanguageProvider } from '@/components/providers/language-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { SocketProvider } from '@/components/providers/socket-provider'

// Fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cairo = Cairo({ 
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
})

const tajawal = Tajawal({ 
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'YYO Agent AI - النظام الإداري المؤسسي الذكي',
    template: '%s | YYO Agent AI'
  },
  description: 'نظام إداري مؤسسي ذكي شامل مع تكامل 8 أنظمة ذكاء اصطناعي لإدارة جميع أقسام المؤسسة بكفاءة عالية',
  keywords: [
    'YYO Agent AI',
    'نظام إداري',
    'ذكاء اصطناعي',
    'إدارة مؤسسية',
    'Enterprise Management',
    'AI System',
    'Business Intelligence',
    'Workflow Management'
  ],
  authors: [{ name: 'YYO Agent AI Team' }],
  creator: 'YYO Agent AI',
  publisher: 'YYO Agent AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yyo-ai.com'),
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
    url: 'https://yyo-ai.com',
    siteName: 'YYO Agent AI',
    title: 'YYO Agent AI - النظام الإداري المؤسسي الذكي',
    description: 'نظام إداري مؤسسي ذكي شامل مع تكامل 8 أنظمة ذكاء اصطناعي',
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
    title: 'YYO Agent AI - النظام الإداري المؤسسي الذكي',
    description: 'نظام إداري مؤسسي ذكي شامل مع تكامل 8 أنظمة ذكاء اصطناعي',
    images: ['/twitter-image.png'],
    creator: '@yyo_agent_ai',
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
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
  classification: 'Business Software',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#5bbad5' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="msapplication-TileColor" content="#2b5797" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body 
        className={`${inter.variable} ${cairo.variable} ${tajawal.variable} font-cairo antialiased rtl`}
        suppressHydrationWarning
      >
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
                  <div className="relative flex min-h-screen flex-col bg-background">
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

