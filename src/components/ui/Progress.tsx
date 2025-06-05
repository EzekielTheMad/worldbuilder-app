/**
 * Progress Component
 * Path: src/components/ui/Progress.tsx
 * 
 * Progress bar component for showing completion status
 */

import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number // 0-100
  className?: string
  showLabel?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function Progress({ 
  value, 
  className,
  showLabel = false,
  variant = 'default'
}: ProgressProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.max(0, Math.min(100, value))

  const variantClasses = {
    default: 'bg-primary-500',
    success: 'bg-emerald',
    warning: 'bg-gold',
    danger: 'bg-crimson',
  }

  return (
    <div className={cn('relative', className)}>
      {/* Background track */}
      <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
        {/* Progress fill */}
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${normalizedValue}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="h-full w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
      
      {/* Optional label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-text-primary">
            {normalizedValue}%
          </span>
        </div>
      )}
    </div>
  )
}