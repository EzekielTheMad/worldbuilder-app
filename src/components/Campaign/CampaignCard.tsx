import { Campaign } from '@/types/campaign'
import { cn } from '@/lib/utils'
import styles from './CampaignCard.module.css'

interface CampaignCardProps {
  campaign: Campaign
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
        // Base styles using utility classes
        'session-card group',
        // Custom module styles for complex effects
        styles.card,
        styles[variant],
        className
      )}
    >
      {/* Magical glow overlay on hover */}
      <div className={styles.glowOverlay} aria-hidden="true" />
      
      {/* Campaign header */}
      <header className="flex items-start justify-between mb-4">
        <h3 className="heading-3 group-hover:text-gradient transition-all">
          {campaign.name}
        </h3>
        <span 
          className={cn(
            campaign.status === 'active' && 'badge-active',
            campaign.status === 'paused' && 'badge-paused',
            campaign.status === 'completed' && 'badge-completed'
          )}
        >
          {campaign.status}
        </span>
      </header>
      
      {/* Campaign details */}
      <div className="space-y-2">
        <p className="body-text">
          {campaign.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span className="stat-text">
            {campaign.playerCount} Players
          </span>
          <span className="stat-text">
            {campaign.sessionCount} Sessions
          </span>
        </div>
      </div>
      
      {/* Quick actions */}
      <footer className="mt-4 pt-4 border-t border-border/50">
        <div className="flex gap-2">
          <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            View Details
          </button>
          <button className="text-sm text-emerald hover:text-emerald/80 transition-colors">
            New Session
          </button>
        </div>
      </footer>
    </article>
  )
}