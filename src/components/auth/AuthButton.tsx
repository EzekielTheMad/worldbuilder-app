/**
 * Authentication Button Components
 * 
 * Reusable components for sign in/out functionality with Discord branding.
 * Handles loading states and proper authentication flow.
 */

'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

/**
 * Sign In Button Component
 * 
 * Shows Discord-branded sign in button with loading state.
 * Automatically handles the OAuth redirect flow.
 */
export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      // Redirect to Discord OAuth with callback URL
      await signIn('discord', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200 min-w-[200px]"
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <DiscordIcon className="w-5 h-5" />
          <span>Sign in with Discord</span>
        </>
      )}
    </button>
  )
}

/**
 * Sign Out Button Component
 * 
 * Simple sign out button that clears the session and redirects to home.
 */
export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-md transition-colors duration-200 w-full"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span>Signing out...</span>
        </>
      ) : (
        <span>Sign out</span>
      )}
    </button>
  )
}

/**
 * User Menu Component
 * 
 * Shows user avatar and name with dropdown menu for account actions.
 * Displays sign in button if user is not authenticated.
 */
export function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
        <div className="w-20 h-4 bg-slate-700 rounded animate-pulse" />
      </div>
    )
  }

  // Show sign in button if not authenticated
  if (!session?.user) {
    return <SignInButton />
  }

  const user = session.user

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
      >
        <img
          src={user.image || '/default-avatar.png'}
          alt={`${user.username}'s avatar`}
          className="w-8 h-8 rounded-full border-2 border-slate-600"
        />
        <div className="text-left hidden sm:block">
          <div className="font-medium text-sm text-white">
            {user.username}
          </div>
          <div className="text-xs text-slate-300">
            {user.email}
          </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-20">
            <div className="px-4 py-2 border-b border-slate-700">
              <div className="font-medium text-sm text-white">
                {user.username}
              </div>
              <div className="text-xs text-slate-300">
                {user.email}
              </div>
            </div>
            
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors duration-200">
                Account Settings
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors duration-200">
                Help & Support
              </button>
            </div>
            
            <div className="border-t border-slate-700 py-1">
              <div className="px-4 py-2">
                <SignOutButton />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Auth Guard Component
 * 
 * Protects components/pages that require authentication.
 * Shows loading state while checking auth, sign in prompt if not authenticated.
 */
interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession()

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show sign in prompt if not authenticated
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          {fallback || (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sign in Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please sign in with your Discord account to access this feature.
              </p>
              <SignInButton />
            </>
          )}
        </div>
      </div>
    )
  }

  // User is authenticated, show protected content
  return <>{children}</>
}

/**
 * Discord Icon Component
 */
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.174.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

/**
 * Chevron Down Icon Component
 */
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}