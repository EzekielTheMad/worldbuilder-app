import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface CampaignCardProps {
  campaign: {
    id: string
    name: string
    description: string
    headerImagePath?: string | null
    status: string
    playerCount: number
    sessionCount: number
    setting: string
    createdAt: Date
    updatedAt: Date
    isOwner: boolean
  }
}

/**
 * Campaign card component for dashboard display
 * Shows campaign info with optional header image background
 */
export function CampaignCard({ campaign }: CampaignCardProps) {
  /**
   * Generate fallback gradient based on campaign name
   */
  const generateFallbackGradient = (name: string) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple-Blue
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Red
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue-Cyan
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Teal
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Teal-Pink
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Orange-Peach
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple Fantasy
    ]
    
    // Use campaign name to consistently pick the same gradient
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return gradients[hash % gradients.length]
  }

  return (
    <Card className="session-card group hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header Section with Image/Gradient */}
      <div 
        className="relative h-40 overflow-hidden"
        style={{
          background: campaign.headerImagePath 
            ? `url(${campaign.headerImagePath}) center/cover` 
            : generateFallbackGradient(campaign.name)
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={campaign.status === 'active' ? 'success' : 'default'}
            className="backdrop-blur-sm bg-white/10 text-white border-white/20"
          >
            {campaign.status}
          </Badge>
        </div>
        
        {/* Campaign Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-xl font-bold text-white mb-1 line-clamp-2 drop-shadow-lg">
            {campaign.name}
          </h3>
          {campaign.description && (
            <p className="text-white/90 text-sm line-clamp-2 drop-shadow">
              {campaign.description}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        {/* Campaign Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-display text-primary-400">
              {campaign.playerCount}
            </div>
            <div className="text-xs text-text-muted">
              {campaign.playerCount === 1 ? 'Player' : 'Players'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-display text-gold">
              {campaign.sessionCount}
            </div>
            <div className="text-xs text-text-muted">
              {campaign.sessionCount === 1 ? 'Session' : 'Sessions'}
            </div>
          </div>
        </div>

        {/* Setting Info */}
        <div className="mb-4">
          <p className="text-sm text-text-secondary line-clamp-2">
            {campaign.setting}
          </p>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-text-muted mb-4">
          Updated {new Date(campaign.updatedAt).toLocaleDateString()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild className="flex-1">
            <Link href={`/campaigns/${campaign.id}`}>
              <span className="mr-1">👁️</span>
              View Details
            </Link>
          </Button>
          
          {campaign.isOwner && (
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/campaigns/${campaign.id}/sessions/new`}>
                <span className="mr-1">🎙️</span>
                New Session
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton version of campaign card for loading states
 */
export function CampaignCardSkeleton() {
  return (
    <Card className="session-card overflow-hidden">
      {/* Header Skeleton */}
      <div className="h-40 bg-surface-elevated animate-pulse" />
      
      {/* Content Skeleton */}
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="h-8 w-8 bg-surface-elevated rounded mx-auto mb-1 animate-pulse" />
            <div className="h-3 w-12 bg-surface-elevated rounded mx-auto animate-pulse" />
          </div>
          <div className="text-center">
            <div className="h-8 w-8 bg-surface-elevated rounded mx-auto mb-1 animate-pulse" />
            <div className="h-3 w-12 bg-surface-elevated rounded mx-auto animate-pulse" />
          </div>
        </div>
        
        <div className="h-4 bg-surface-elevated rounded mb-2 animate-pulse" />
        <div className="h-4 bg-surface-elevated rounded mb-4 w-3/4 animate-pulse" />
        <div className="h-3 bg-surface-elevated rounded mb-4 w-1/2 animate-pulse" />
        
        <div className="flex gap-2">
          <div className="h-8 bg-surface-elevated rounded flex-1 animate-pulse" />
          <div className="h-8 bg-surface-elevated rounded flex-1 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}