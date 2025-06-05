// src/components/ui/Toggle.tsx
import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

/**
 * Toggle switch component with clear on/off visual states
 * Uses inline styles to avoid Tailwind conflicts
 */
export function Toggle({ 
  checked, 
  onChange, 
  disabled = false, 
  className,
  id 
}: ToggleProps) {
  // Debug logging
  console.log(`Toggle ${id}: checked=${checked}, disabled=${disabled}`)
  
  return (
    <label 
      className={cn(
        "relative inline-flex items-center",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div 
        className={cn(
          "w-11 h-6 rounded-full relative transition-all duration-200",
          disabled && "opacity-50"
        )}
        style={{
          backgroundColor: checked ? '#9333ea' : '#374151', // primary-600 : gray-700
          boxShadow: checked ? '0 0 20px rgba(147, 51, 234, 0.3)' : 'none',
          border: `2px solid ${checked ? '#7c3aed' : '#4b5563'}` // primary-700 : gray-600
        }}
      >
        <div 
          className="absolute bg-white rounded-full h-4 w-4 transition-transform duration-200 shadow-sm"
          style={{
            top: '2px',
            left: '2px',
            transform: checked ? 'translateX(20px)' : 'translateX(0px)'
          }}
        />
      </div>
    </label>
  )
}