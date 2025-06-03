/**
 * Root Layout Component
 * 
 * This is the main layout that wraps all pages in the Next.js app.
 * It provides global styles, session context, and common UI elements.
 */

import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/SessionProvider'
import './globals.css'

// Configure Inter font for optimal performance
const inter = Inter({ subsets: ['latin'] })

// Metadata for SEO and social sharing
export const metadata = {
  title: 'Worldbuilder - D&D Session Processing Platform',
  description: 'Transform your D&D sessions into epic stories with AI-powered summaries',
  keywords: ['D&D', 'Dungeons & Dragons', 'AI', 'Session Processing', 'Campaign Management'],
  authors: [{ name: 'Worldbuilder Team' }],
  openGraph: {
    title: 'Worldbuilder - D&D Session Processing Platform',
    description: 'Transform your D&D sessions into epic stories with AI-powered summaries',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Worldbuilder - D&D Session Processing Platform',
    description: 'Transform your D&D sessions into epic stories with AI-powered summaries',
  }
}

/**
 * Root layout component that wraps all pages
 * 
 * Provides:
 * - Global font configuration
 * - Session authentication context
 * - Base HTML structure
 * - Global CSS imports
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-slate-900`}>
        {/* 
          SessionProvider makes NextAuth.js session available throughout the app
          This allows any component to access user authentication state
        */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}