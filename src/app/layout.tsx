import type { Metadata } from 'next'
import { Inter, Cinzel, Fira_Code } from 'next/font/google'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { SessionProvider } from '@/components/providers/SessionProvider'
import '@/styles/globals.css'

/**
 * Font configurations for the fantasy theme
 */
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body'
})

const cinzel = Cinzel({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700']
})

const firaCode = Fira_Code({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500']
})

export const metadata: Metadata = {
  title: 'Worldbuilder - D&D Session AI',
  description: 'Transform your D&D sessions into epic narratives with AI-powered transcription and summarization',
  keywords: ['D&D', 'Dungeons and Dragons', 'AI', 'Session Notes', 'Campaign Management'],
  authors: [{ name: 'Worldbuilder Team' }],
  openGraph: {
    title: 'Worldbuilder - D&D Session AI',
    description: 'Transform your D&D sessions into epic narratives',
    type: 'website',
    url: 'https://worldbuilder.app',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${cinzel.variable} ${firaCode.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <SessionProvider session={session}>
          {/* Main app wrapper with subtle bg pattern */}
          <div className="relative min-h-screen">
            {/* Subtle magical background effect */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-600/10 blur-3xl" />
              <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-800/10 blur-3xl" />
            </div>
            
            {/* Main content */}
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}