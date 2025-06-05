// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * Validation schema for profile updates
 */
const updateProfileSchema = z.object({
  displayName: z.string()
    .max(100, 'Display name must be less than 100 characters')
    .trim()
    .optional()
    .nullable(),
  contactEmail: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim(),
})

/**
 * PATCH /api/user/profile
 * Update user profile information
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
    const validatedData = updateProfileSchema.parse(body)

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { contactEmail: true, contactEmailVerified: true }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Handle display name update
    if (validatedData.displayName !== undefined) {
      updateData.displayName = validatedData.displayName || null
    }

    // Handle contact email update
    if (validatedData.contactEmail !== currentUser.contactEmail) {
      updateData.contactEmail = validatedData.contactEmail
      // Reset verification status if email changed
      updateData.contactEmailVerified = false
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
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

    // If email changed, send verification email
    if (validatedData.contactEmail !== currentUser.contactEmail) {
      // TODO: Send verification email
      console.log(`Email verification needed for ${updatedUser.contactEmail}`)
    }

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('Error updating profile:', error)

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

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'This email is already in use by another account' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}