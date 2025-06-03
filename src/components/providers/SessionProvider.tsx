/**
 * Session Provider Component
 * 
 * This component wraps the application with NextAuth.js session context,
 * making authentication state available throughout the app via React hooks.
 */

'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
  session?: any // Session object passed from server-side
}

/**
 * Wraps children with NextAuth.js SessionProvider
 * 
 * This should be used at the root level of your application (in layout.tsx)
 * to provide authentication context to all components.
 * 
 * @param children - React components to wrap
 * @param session - Optional session object from server-side rendering
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider 
      session={session}
      // Refetch session when window regains focus (optional)
      refetchOnWindowFocus={true}
      // Refetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
    >
      {children}
    </NextAuthSessionProvider>
  )
}