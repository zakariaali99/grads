import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/i18n'
import QueryProvider from '@/components/QueryProvider'

export const metadata: Metadata = {
  title: 'خريجون - منصة توظيف الخريجين',
  description: 'المنصة الرقمية الرائدة لربط الخريجين التقنيين بسوق العمل',
  keywords: ['توظيف', 'خريجين', 'كليات تقنية', 'فرص عمل', 'خريجون'],
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-navy-900">
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var l=localStorage.getItem('locale');if(l==='en'){document.documentElement.lang='en';document.documentElement.dir='ltr'}var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})()`
        }} />
        <QueryProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
