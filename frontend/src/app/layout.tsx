import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'src/lib/theme-provider'
import { AuthProvider } from 'src/lib/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pathwise AI™ - Your Personalized STEM Career Navigator',
  description: 'Discover STEM careers, access learning resources, and get AI-powered guidance to build your dream career path.',
  keywords: 'STEM careers, career guidance, AI assistant, learning resources, education, technology, engineering, mathematics',
  authors: [{ name: 'Pathwise AI Team' }],
  openGraph: {
    title: 'Pathwise AI™ - Your Personalized STEM Career Navigator',
    description: 'Discover STEM careers, access learning resources, and get AI-powered guidance to build your dream career path.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathwise AI™ - Your Personalized STEM Career Navigator',
    description: 'Discover STEM careers, access learning resources, and get AI-powered guidance to build your dream career path.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            {children}
            <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <div className="max-w-7xl mx-auto px-4">
                <p>© {new Date().getFullYear()} Pathwise AI™. Trademark owned by Ria Bhaumik.</p>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 