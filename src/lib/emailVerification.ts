// src/lib/emailVerification.ts
import { prisma } from '@/lib/prisma'

/**
 * Check if a user's email is verified and they can upload sessions
 */
export async function canUserUploadSessions(userId: string): Promise<{
  canUpload: boolean
  reason?: string
  contactEmail?: string
  isVerified?: boolean
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        contactEmail: true,
        contactEmailVerified: true,
      }
    })

    if (!user) {
      return {
        canUpload: false,
        reason: 'User not found'
      }
    }

    if (!user.contactEmail) {
      return {
        canUpload: false,
        reason: 'No contact email set',
        contactEmail: user.contactEmail,
        isVerified: user.contactEmailVerified
      }
    }

    if (!user.contactEmailVerified) {
      return {
        canUpload: false,
        reason: 'Email not verified',
        contactEmail: user.contactEmail,
        isVerified: user.contactEmailVerified
      }
    }

    return {
      canUpload: true,
      contactEmail: user.contactEmail,
      isVerified: user.contactEmailVerified
    }

  } catch (error) {
    console.error('Error checking email verification:', error)
    return {
      canUpload: false,
      reason: 'Database error'
    }
  }
}

/**
 * Populate contactEmail from OAuth email for existing users
 * This should be run as a migration for existing users
 */
export async function migrateExistingUsersContactEmail() {
  try {
    const usersWithoutContactEmail = await prisma.user.findMany({
      where: {
        OR: [
          { contactEmail: null },
          { contactEmail: '' }
        ]
      },
      select: {
        id: true,
        email: true, // OAuth email
      }
    })

    console.log(`Migrating ${usersWithoutContactEmail.length} users...`)

    for (const user of usersWithoutContactEmail) {
      if (user.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            contactEmail: user.email,
            contactEmailVerified: true, // Trust OAuth emails
          }
        })
      }
    }

    console.log('Migration completed successfully')
    return { success: true, migratedUsers: usersWithoutContactEmail.length }

  } catch (error) {
    console.error('Migration error:', error)
    return { success: false, error: error.message }
  }
}