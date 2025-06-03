import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   */
  value?: number
  /**
   * Whether to show the glow effect
   * @default true
   */
  showGlow?: boolean
}

/**
 * Progress bar component
 * Shows upload or processing progress with optional glow
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, showGlow = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-surface-elevated",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300",
            showGlow && "shadow-glow"
          )}
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }