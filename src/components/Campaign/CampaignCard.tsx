import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

// Define the props interface
interface CampaignCardProps {
  campaign: {
    id: string
    name: string
    description: string
    status: 'active' | 'private' | 'paused' | 'completed'
    playerCount: number
    sessionCount: number
    setting: string
    createdAt: Date
    updatedAt: Date
    isOwner?: boolean
  }
  variant?: 'default' | 'featured' | 'minimal'
  className?: string
}

/**
 * Campaign card component for displaying campaign information
 * Features hover effects and status indicators
 */
export function CampaignCard({ 
  campaign, 
  variant = 'default', 
  className 
}: CampaignCardProps) {
  return (
    <article 
      className={cn(
        // Base styles - session-card is defined in utilities.css
        'session-card group',
        // Variant-specific styles
        variant === 'featured' && [
          'border-primary-600 bg-gradient-to-br from-surface to-surface-elevated',
          'relative overflow-hidden'
        ],
        variant === 'minimal' && 'p-4 border-dashed',
        className
      )}
    >
      {/* Featured star decoration */}
      {variant === 'featured' && (
        <div className="absolute top-3 right-3 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
          ⭐
        </div>
      )}

      {/* Campaign header */}
      <header className="flex items-start justify-between mb-4">
        <h3 className="heading-3 group-hover:text-gradient transition-all">
          {campaign.name}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {campaign.isOwner && (
            <Badge variant="outline" className="text-xs">
              <span className="text-gold mr-1">👑</span>
              Owner
            </Badge>
          )}
          <Badge 
            variant={
              campaign.status === 'active' ? 'success' : 
              campaign.status === 'private' ? 'secondary' :
              campaign.status === 'paused' ? 'warning' : 
              'default'
            }
          >
            {campaign.status}
          </Badge>
        </div>
      </header>
      
      {/* Campaign details */}
      <div className="space-y-3 flex-grow">
        {campaign.description && (
          <p className="body-text line-clamp-2">
            {campaign.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="stat-text flex items-center gap-1">
            <span className="text-primary-400">👥</span>
            {campaign.playerCount} Players
          </span>
          <span className="stat-text flex items-center gap-1">
            <span className="text-gold">📜</span>
            {campaign.sessionCount} Sessions
          </span>
          {campaign.setting && (
            <span className="text-text-secondary text-xs">
              {campaign.setting}
            </span>
          )}
        </div>
      </div>
      
      {/* Quick actions */}
      <footer className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <Link 
            href={`/campaigns/${campaign.id}`}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors group/link flex items-center gap-1"
          >
            View Details 
            <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
          </Link>
          <Link 
            href={`/campaigns/${campaign.id}/sessions/new`}
            className="text-sm text-emerald hover:text-emerald/80 transition-colors flex items-center gap-1"
          >
            <span className="text-base">🎙️</span>
            New Session
          </Link>
        </div>
      </footer>

      {/* Hover glow effect overlay */}
      <div 
        className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 via-primary-600/10 to-primary-600/5 blur-xl" />
      </div>
    </article>
  )
}