import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { UserMenu } from '@/components/auth/UserMenu'
import { CampaignCard } from '@/components/campaign/CampaignCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert, AlertDescription } from '@/components/ui/Alert'


/**
 * Dashboard page showing user's campaigns and recent activity
 * Protected route - redirects to landing if not authenticated
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  // Fetch user's campaigns where they are the owner
  const campaigns = await prisma.campaign.findMany({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      headerImagePath: true, // Include header image path
      isPublic: true,
      worldPrimer: true,
      playerCharacterMapping: true,
      createdAt: true,
      updatedAt: true,
      ownerId: true,
      _count: {
        select: { sessions: true }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  // Also fetch campaigns where the user is a member (optional)
  const memberCampaigns = await prisma.campaign.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id
        }
      }
    },
    select: {
      id: true,
      name: true,
      description: true,
      headerImagePath: true, // Include header image path
      isPublic: true,
      worldPrimer: true,
      playerCharacterMapping: true,
      createdAt: true,
      updatedAt: true,
      ownerId: true,
      _count: {
        select: { sessions: true }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  // Combine owned and member campaigns (removing duplicates)
  const allCampaigns = [
    ...campaigns,
    ...memberCampaigns.filter(mc => !campaigns.find(c => c.id === mc.id))
  ]

  // Calculate stats
  const totalSessions = allCampaigns.reduce((acc, campaign) => acc + campaign._count.sessions, 0)
  const ownedCampaigns = campaigns.length
  const activeCampaigns = allCampaigns.filter(c => c.isPublic).length // Using isPublic as a proxy for active

  return (
    <div className="min-h-screen">
      {/* Dashboard Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="font-display text-2xl text-primary-400">⚔️</span>
                <span className="font-display text-xl">Worldbuilder</span>
              </Link>
              <Badge variant="outline" className="hidden md:inline-flex">
                Beta
              </Badge>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/docs">Docs</Link>
              </Button>
              <UserMenu user={session.user} />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="heading-1 mb-2">
            Welcome back, {session.user.name || 'Adventurer'}!
          </h1>
          <p className="text-text-secondary">
            Manage your campaigns and process new session recordings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="border-glow animate-slide-up">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Your Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-primary-400">
                {ownedCampaigns}
              </div>
              <p className="text-sm text-text-muted mt-1">
                {memberCampaigns.length > 0 && `+${memberCampaigns.length} as member`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-glow animate-slide-up animation-delay-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Total Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-emerald">
                {allCampaigns.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-glow animate-slide-up animation-delay-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-gold">
                {totalSessions}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-2">Your Campaigns</h2>
            <Button variant="primary" magic asChild>
              <Link href="/campaigns/new">
                <span className="mr-2">✨</span>
                New Campaign
              </Link>
            </Button>
          </div>

          {allCampaigns.length === 0 ? (
            <Alert className="animate-fade-in">
              <AlertDescription>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🏰</div>
                  <h3 className="font-display text-xl mb-2">No campaigns yet</h3>
                  <p className="text-text-secondary mb-4">
                    Start your epic journey by creating your first campaign
                  </p>
                  <Button variant="primary" asChild>
                    <Link href="/campaigns/new">Create Campaign</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="campaign-grid">
              {allCampaigns.map((campaign, index) => (
                <div 
                  key={campaign.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CampaignCard 
                    campaign={{
                      id: campaign.id,
                      name: campaign.name,
                      description: campaign.description || '',
                      headerImagePath: campaign.headerImagePath, // Pass header image path
                      status: campaign.isPublic ? 'active' : 'private',
                      playerCount: Object.keys(campaign.playerCharacterMapping as object || {}).length,
                      sessionCount: campaign._count.sessions,
                      setting: campaign.worldPrimer?.slice(0, 50) || 'Custom Setting',
                      createdAt: campaign.createdAt,
                      updatedAt: campaign.updatedAt,
                      isOwner: campaign.ownerId === session.user.id,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity Section (Optional) */}
        {totalSessions > 0 && (
          <section className="mt-12">
            <h2 className="heading-2 mb-6">Recent Sessions</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-text-secondary text-center py-8">
                  Session history coming soon...
                </p>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  )
}

/**
 * Loading state for dashboard
 * Shows skeleton placeholders while data loads
 */
export function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 h-16" />
      <main className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="campaign-grid">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </main>
    </div>
  )
}