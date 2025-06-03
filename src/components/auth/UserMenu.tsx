'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

interface UserMenuProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

/**
 * UserMenu component - Dropdown menu for authenticated users
 * Shows user info, navigation links, and sign out option
 */
export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  /**
   * Handle sign out with loading state
   */
  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut({ callbackUrl: '/' })
  }

  /**
   * Get user initials for avatar fallback
   */
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2 rounded-lg p-2",
          "hover:bg-surface-elevated transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background",
          isOpen && "bg-surface-elevated"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary-600/20 border border-primary-600/50">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User avatar'}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-600/30 text-xs font-medium text-primary-300">
              {getInitials(user.name)}
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald border-2 border-background" />
        </div>

        {/* User name (hidden on mobile) */}
        <span className="hidden md:block text-sm font-medium text-text-primary max-w-[150px] truncate">
          {user.name || 'Adventurer'}
        </span>

        {/* Dropdown arrow */}
        <svg
          className={cn(
            "h-4 w-4 text-text-secondary transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-72 origin-top-right",
          "animate-slide-up"
        )}>
          <div className={cn(
            "rounded-lg border border-border bg-surface shadow-xl",
            "ring-1 ring-black ring-opacity-5",
            "divide-y divide-border"
          )}>
            {/* User Info Section */}
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-primary-600/20 border-2 border-primary-600/50">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User avatar'}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-600/30 text-sm font-medium text-primary-300">
                      {getInitials(user.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user.name || 'Adventurer'}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {user.email || 'No email'}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-primary-400">
                      Connected via Discord
                    </span>
                    <svg className="ml-1 h-3 w-3 text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="py-2" role="menu">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center px-4 py-2 text-sm text-text-primary",
                  "hover:bg-surface-elevated transition-colors",
                  "focus:outline-none focus:bg-surface-elevated"
                )}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3">🏰</span>
                Dashboard
              </Link>
              <Link
                href="/campaigns"
                className={cn(
                  "flex items-center px-4 py-2 text-sm text-text-primary",
                  "hover:bg-surface-elevated transition-colors",
                  "focus:outline-none focus:bg-surface-elevated"
                )}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3">⚔️</span>
                My Campaigns
              </Link>
              <Link
                href="/sessions"
                className={cn(
                  "flex items-center px-4 py-2 text-sm text-text-primary",
                  "hover:bg-surface-elevated transition-colors",
                  "focus:outline-none focus:bg-surface-elevated"
                )}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3">📜</span>
                Recent Sessions
              </Link>
              <Link
                href="/account"
                className={cn(
                  "flex items-center px-4 py-2 text-sm text-text-primary",
                  "hover:bg-surface-elevated transition-colors",
                  "focus:outline-none focus:bg-surface-elevated"
                )}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3">⚙️</span>
                Account Settings
              </Link>
            </nav>

            {/* Help & Support */}
            <div className="py-2">
              <Link
                href="/docs"
                className={cn(
                  "flex items-center px-4 py-2 text-sm text-text-primary",
                  "hover:bg-surface-elevated transition-colors",
                  "focus:outline-none focus:bg-surface-elevated"
                )}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3">📚</span>
                Documentation
              </Link>
              <Link
                href="/support"
                className={cn(
                  "flex items-center px-4 py-2 text-sm text-text-primary",
                  "hover:bg-surface-elevated transition-colors",
                  "focus:outline-none focus:bg-surface-elevated"
                )}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3">💬</span>
                Support
              </Link>
            </div>

            {/* Sign Out */}
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-crimson hover:text-crimson hover:bg-crimson/10"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <Spinner size="sm" className="mr-3" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <span className="mr-3">🚪</span>
                    Sign Out
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}