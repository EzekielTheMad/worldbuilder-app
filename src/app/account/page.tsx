// src/app/account/page.tsx
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AccountSettingsClient from './AccountSettingsClient'

/**
 * Server component for account settings page
 * Handles authentication and data fetching
 */
export default async function AccountSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch user with account settings
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true, // OAuth email
      image: true,
      contactEmail: true,
      contactEmailVerified: true,
      emailNotifications: true,
      discordNotifications: true,
      marketingEmails: true,
      platformAnnouncements: true,
      notifySessionComplete: true,
      notifySessionFailed: true,
      createdAt: true,
      lastLogin: true,
    }
  })

  if (!user) {
    notFound()
  }

  return (
    <AccountSettingsClient 
      user={user}
      oauthEmail={session.user.email}
    />
  )
}

// Export metadata for the page
export const metadata = {
  title: 'Account Settings | Worldbuilder',
  description: 'Manage your account preferences and notification settings'
}