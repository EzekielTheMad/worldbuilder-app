'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'

/**
 * Magic-themed Discord sign-in button
 * Features particle effects and fantasy styling
 */
export function SignInButtonMagic({ 
  className,
  callbackUrl = '/dashboard'
}: {
  className?: string
  callbackUrl?: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn('discord', { callbackUrl })
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative inline-flex items-center justify-center",
        "px-8 py-4 text-lg font-display font-semibold",
        "bg-gradient-to-r from-primary-600 to-[#5865F2]",
        "text-white rounded-xl overflow-hidden",
        "transform transition-all duration-300",
        "hover:scale-105 active:scale-100",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "shadow-lg hover:shadow-xl hover:shadow-primary-600/25",
        className
      )}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-[#4752C4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Sparkle effects */}
      {isHovered && (
        <>
          <span className="absolute top-2 left-4 text-xs animate-sparkle">✨</span>
          <span className="absolute bottom-3 right-6 text-xs animate-sparkle animation-delay-200">✨</span>
          <span className="absolute top-3 right-8 text-xs animate-sparkle animation-delay-400">✨</span>
        </>
      )}
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-[-2px] bg-gradient-to-r from-primary-400 to-[#5865F2] rounded-xl blur-md" />
      </div>
      
      {/* Content */}
      <div className="relative flex items-center space-x-3">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
        <span className="relative">
          {isLoading ? 'Summoning Portal...' : 'Enter with Discord'}
        </span>
        <span className={cn(
          "text-2xl transition-transform duration-300",
          isHovered ? "translate-x-1" : ""
        )}>
          ⚔️
        </span>
      </div>
    </button>
  )
}