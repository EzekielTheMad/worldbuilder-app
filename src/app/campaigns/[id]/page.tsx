import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'

interface CampaignPageProps {
  params: {
    id: string
  }
}

/**
 * Campaign detail page showing campaign info and sessions
 */
export default async function CampaignPage({ params }: CampaignPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    notFound()
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      sessions: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }
    }
  })

  if (!campaign) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <nav className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="font-display text-2xl text-primary-400">⚔️</span>
                <span className="font-display text-xl">Worldbuilder</span>
              </Link>
              <span className="text-text-muted">/</span>
              <Link href="/dashboard" className="text-text-secondary hover:text-primary-400">
                Campaigns
              </Link>
              <span className="text-text-muted">/</span>
              <span className="text-text-primary">{campaign.name}</span>
            </nav>
            
            <Button variant="primary" magic asChild>
              <Link href={`/campaigns/${campaign.id}/sessions/new`}>
                <span className="mr-2">🎙️</span>
                New Session
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Campaign Info */}
      <section className="container py-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="heading-1 mb-2">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-text-secondary max-w-3xl">
                  {campaign.description}
                </p>
              )}
            </div>
            <Badge 
              variant={
                campaign.status === 'ACTIVE' ? 'success' : 
                campaign.status === 'PAUSED' ? 'warning' : 
                'default'
              }
            >
              {campaign.status.toLowerCase()}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Setting:</span>
              <span className="stat-text">{campaign.setting.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Created:</span>
              <span className="text-text-secondary">
                {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Sessions:</span>
              <span className="text-gold font-mono">{campaign.sessions.length}</span>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <section>
          <h2 className="heading-2 mb-6">Recent Sessions</h2>
          
          {campaign.sessions.length === 0 ? (
            <Alert className="animate-fade-in">
              <AlertDescription>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📜</div>
                  <h3 className="font-display text-xl mb-2">No sessions yet</h3>
                  <p className="text-text-secondary mb-4">
                    Upload your first session recording to get started
                  </p>
                  <Button variant="primary" asChild>
                    <Link href={`/campaigns/${campaign.id}/sessions/new`}>
                      Upload Session
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="session-list">
              {campaign.sessions.map((session, index) => (
                <Card 
                  key={session.id} 
                  className="session-card animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Session {session.sessionNumber || index + 1}
                        </CardTitle>
                        <CardDescription>
                          {new Date(session.sessionDate || session.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {session.status.toLowerCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {session.summary ? (
                      <p className="body-text line-clamp-3">
                        {session.summary}
                      </p>
                    ) : (
                      <p className="text-text-muted italic">
                        Processing session recording...
                      </p>
                    )}
                    <div className="mt-4">
                      <Button variant="link" asChild className="p-0">
                        <Link href={`/sessions/${session.id}`}>
                          View Full Summary →
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Campaign Actions */}
        <section className="mt-12">
          <h2 className="heading-2 mb-6">Campaign Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" asChild>
              <Link href={`/campaigns/${campaign.id}/edit`}>
                ⚙️ Edit Campaign
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/campaigns/${campaign.id}/players`}>
                👥 Manage Players
              </Link>
            </Button>
            <Button variant="secondary" disabled>
              💬 Discord Settings
              <Badge variant="warning" className="ml-2">Soon</Badge>
            </Button>
          </div>
        </section>
      </section>
    </div>
  )
}