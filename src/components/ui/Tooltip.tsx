/**
 * Tooltip Component
 * Path: src/components/ui/Tooltip.tsx
 * 
 * Provides hover tooltips with customizable content
 */

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: React.ReactNode
  className?: string
}

export function Tooltip({ children, className }: TooltipProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      {children}
    </div>
  )
}

interface TooltipTriggerProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export function TooltipTrigger({ children, className, asChild }: TooltipTriggerProps) {
  return (
    <div className={cn('cursor-help', className)}>
      {children}
    </div>
  )
}

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
}

export function TooltipContent({ 
  children, 
  className,
  side = 'top',
  align = 'center' 
}: TooltipContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const trigger = contentRef.current?.parentElement?.querySelector(':first-child')
    if (trigger) {
      triggerRef.current = trigger as HTMLDivElement

      const handleMouseEnter = () => setIsVisible(true)
      const handleMouseLeave = () => setIsVisible(false)

      trigger.addEventListener('mouseenter', handleMouseEnter)
      trigger.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        trigger.removeEventListener('mouseenter', handleMouseEnter)
        trigger.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  // Position classes based on side
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }

  // Alignment classes
  const alignmentClasses = {
    start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
    center: side === 'top' || side === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
  }

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 px-3 py-2 text-sm bg-surface-elevated border border-border rounded-lg shadow-lg',
        'transition-all duration-200',
        isVisible ? 'opacity-100 visible' : 'opacity-0 invisible',
        positionClasses[side],
        alignmentClasses[align],
        className
      )}
    >
      {children}
      {/* Arrow */}
      <div
        className={cn(
          'absolute w-2 h-2 bg-surface-elevated border border-border transform rotate-45',
          side === 'top' && 'top-full -mt-1 left-1/2 -translate-x-1/2 border-t-0 border-l-0',
          side === 'bottom' && 'bottom-full -mb-1 left-1/2 -translate-x-1/2 border-b-0 border-r-0',
          side === 'left' && 'left-full -ml-1 top-1/2 -translate-y-1/2 border-l-0 border-b-0',
          side === 'right' && 'right-full -mr-1 top-1/2 -translate-y-1/2 border-r-0 border-t-0'
        )}
      />
    </div>
  )
}

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

export function TooltipProvider({ 
  children, 
  delayDuration = 0 
}: TooltipProviderProps) {
  // Could add context for delay duration if needed
  return <>{children}</>
}