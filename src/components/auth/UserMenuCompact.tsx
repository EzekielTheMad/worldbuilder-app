'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface UserMenuCompactProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

/**
 * Compact user menu for mobile or space-constrained layouts
 */
export function UserMenuCompact({ user }: UserMenuCompactProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 overflow-hidden rounded-full bg-primary-600/20 border-2 border-primary-600/50 transition-all hover:border-primary-400"
        aria-label="User menu"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-600/30 text-sm font-medium text-primary-300">
            {user.name?.slice(0, 2).toUpperCase() || '??'}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-surface border border-border shadow-lg animate-fade-in">
          <div className="py-1">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="block w-full px-4 py-2 text-left text-sm text-crimson hover:bg-crimson/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}