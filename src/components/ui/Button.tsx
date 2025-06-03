import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Button variants using class-variance-authority
 * Provides consistent button styles across the app
 */
const buttonVariants = cva(
  // Base styles applied to all buttons
  'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
        secondary: 'bg-surface-elevated text-primary-400 border border-primary-600 hover:bg-primary-600/20',
        danger: 'bg-crimson text-white hover:bg-red-700 focus-visible:ring-crimson',
        ghost: 'hover:bg-surface-elevated hover:text-primary-400',
        link: 'text-primary-400 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
      magic: {
        true: 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      magic: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button component with multiple variants
 * Supports primary, secondary, danger, ghost, and link styles
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, magic, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, magic }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }