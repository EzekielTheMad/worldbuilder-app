'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

interface SignInButtonProps {
  /**
   * Button variant style
   * @default "default"
   */
  variant?: 'default' | 'hero' | 'compact' | 'outline'
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Callback URL after successful sign in
   * @default "/dashboard"
   */
  callbackUrl?: string
  /**
   * Button text
   * @default "Sign in with Discord"
   */
  text?: string
}

/**
 * Discord OAuth sign-in button
 * Handles loading state and redirects to Discord for authentication
 */
export function SignInButton({ 
  variant = 'default',
  className,
  callbackUrl = '/dashboard',
  text = 'Sign in with Discord'
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handle sign in with loading state
   */
  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('discord', { callbackUrl })
    } catch (error) {
      // SignIn will redirect, so we only get here if something goes wrong
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  /**
   * Discord brand color
   */
  const discordColor = '#5865F2'

  /**
   * Discord logo SVG
   */
  const DiscordLogo = ({ className: svgClassName }: { className?: string }) => (
    <svg 
      className={svgClassName} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )

  // Variant-specific styles
  if (variant === 'hero') {
    return (
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className={cn(
          "group relative inline-flex items-center justify-center",
          "px-8 py-4 text-lg font-medium text-white",
          "bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A5]",
          "rounded-xl shadow-lg hover:shadow-xl",
          "transform transition-all duration-200",
          "hover:-translate-y-0.5 active:translate-y-0",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
          "focus:outline-none focus:ring-4 focus:ring-[#5865F2]/50",
          className
        )}
        style={{ backgroundColor: isLoading ? undefined : discordColor }}
      >
        {/* Background shimmer effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        
        {/* Content */}
        <div className="relative flex items-center space-x-3">
          {isLoading ? (
            <Spinner size="md" className="text-white" />
          ) : (
            <DiscordLogo className="h-6 w-6" />
          )}
          <span>{isLoading ? 'Connecting...' : text}</span>
          {!isLoading && (
            <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </div>
      </button>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className={cn(
          "inline-flex items-center justify-center",
          "h-10 w-10 rounded-full",
          "bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A5]",
          "text-white shadow-md hover:shadow-lg",
          "transform transition-all duration-200",
          "hover:scale-110 active:scale-100",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          "focus:outline-none focus:ring-2 focus:ring-[#5865F2]/50 focus:ring-offset-2 focus:ring-offset-background",
          className
        )}
        style={{ backgroundColor: isLoading ? undefined : discordColor }}
        aria-label="Sign in with Discord"
      >
        {isLoading ? (
          <Spinner size="sm" className="text-white" />
        ) : (
          <DiscordLogo className="h-5 w-5" />
        )}
      </button>
    )
  }

  if (variant === 'outline') {
    return (
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className={cn(
          "inline-flex items-center justify-center",
          "px-6 py-2.5 text-sm font-medium",
          "text-[#5865F2] bg-transparent",
          "border-2 border-[#5865F2] rounded-lg",
          "hover:bg-[#5865F2] hover:text-white",
          "transform transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-[#5865F2]/50 focus:ring-offset-2 focus:ring-offset-background",
          className
        )}
      >
        {isLoading ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <DiscordLogo className="h-4 w-4 mr-2" />
        )}
        <span>{isLoading ? 'Connecting...' : text}</span>
      </button>
    )
  }

  // Default variant
  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className={cn(
        "bg-[#5865F2] hover:bg-[#4752C4] text-white",
        "focus:ring-[#5865F2]/50",
        className
      )}
      style={{ backgroundColor: isLoading ? undefined : discordColor }}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <DiscordLogo className="h-4 w-4 mr-2" />
          {text}
        </>
      )}
    </Button>
  )
}