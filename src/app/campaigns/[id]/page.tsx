import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CampaignDetailClient from './CampaignDetailClient'

interface CampaignPageProps {
  params: {
    id: string
  }
}

/**
 * Server component for campaign detail page
 * Handles authentication and data fetching
 */
export default async function CampaignPage({ params }: CampaignPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    notFound()
  }

  // Fetch campaign with all related data - using correct GameSession fields
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      OR: [
        { ownerId: session.user.id },
        { 
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      ]
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          image: true,
        }
      },
      sessions: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        select: {
          id: true,
          title: true,
          createdAt: true,
          status: true,
          summaryJson: true,
          notes: true,
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              image: true,
            }
          }
        }
      },
      _count: {
        select: {
          sessions: true,
          members: true,
        }
      }
    }
  })

  if (!campaign) {
    notFound()
  }

  // Determine if user is owner
  const isOwner = campaign.ownerId === session.user.id

  // Pass data to client component
  return (
    <CampaignDetailClient 
      campaign={campaign}
      isOwner={isOwner}
      userId={session.user.id}
    />
  )
}

// Export metadata for the page
export async function generateMetadata({ params }: CampaignPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return {
      title: 'Campaign Not Found | Worldbuilder'
    }
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      OR: [
        { ownerId: session.user.id },
        { 
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      ]
    },
    select: {
      name: true,
      description: true,
    }
  })

  if (!campaign) {
    return {
      title: 'Campaign Not Found | Worldbuilder'
    }
  }

  return {
    title: `${campaign.name} | Worldbuilder`,
    description: campaign.description || `Manage your ${campaign.name} D&D campaign`
  }
}