import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ManagePlayersClient from './ManagePlayersClient'

interface ManagePlayersPageProps {
  params: {
    id: string
  }
}

/**
 * Server component for manage players page
 * Handles authentication and data fetching
 */
export default async function ManagePlayersPage({ params }: ManagePlayersPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    notFound()
  }

  // Fetch campaign - owner only for player management
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      ownerId: session.user.id, // Only owner can manage players
    },
    select: {
      id: true,
      name: true,
      playerCharacterMapping: true,
      inviteCode: true,
    }
  })

  if (!campaign) {
    notFound()
  }

  // Pass data to client component
  return (
    <ManagePlayersClient 
      campaign={campaign}
      userId={session.user.id}
    />
  )
}

// Export metadata for the page
export async function generateMetadata({ params }: ManagePlayersPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return {
      title: 'Manage Players | Worldbuilder'
    }
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      ownerId: session.user.id,
    },
    select: {
      name: true,
    }
  })

  if (!campaign) {
    return {
      title: 'Campaign Not Found | Worldbuilder'
    }
  }

  return {
    title: `Manage Players - ${campaign.name} | Worldbuilder`,
    description: `Manage player-character mappings for ${campaign.name}`
  }
}