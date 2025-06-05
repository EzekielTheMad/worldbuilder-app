// src/app/api/user/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * Validation schema for notification preferences
 */
const updateNotificationsSchema = z.object({
  emailNotifications: z.boolean(),
  discordNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  platformAnnouncements: z.boolean(),
  notifySessionComplete: z.boolean(),
  notifySessionFailed: z.boolean(),
})

/**
 * PATCH /api/user/notifications
 * Update user notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateNotificationsSchema.parse(body)

    // Update the user's notification preferences
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
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

    console.log(`Updated notification preferences for user ${session.user.id}`)

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('Error updating notifications:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}