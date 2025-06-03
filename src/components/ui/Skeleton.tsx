import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the shimmer animation
   * @default true
   */
  animate?: boolean
}

/**
 * Skeleton component for loading states
 * Shows a pulsing placeholder while content loads
 */
function Skeleton({ 
  className, 
  animate = true,
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-elevated rounded-md",
        animate && "skeleton",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }