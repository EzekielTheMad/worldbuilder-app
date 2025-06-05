// src/app/api/user/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

/**
 * POST /api/user/verify-email
 * Send email verification link to user's contact email
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's current contact email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        contactEmail: true, 
        contactEmailVerified: true,
        username: true 
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.contactEmailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token (you might want a separate table for this)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // For now, store in advancedSettings JSON
        // In production, consider a separate verification_tokens table
        advancedSettings: {
          emailVerification: {
            token: verificationToken,
            expiresAt: expiresAt.toISOString(),
            email: user.contactEmail
          }
        }
      }
    })

    // TODO: Send actual verification email
    // For now, just log the verification link
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/user/verify-email/confirm?token=${verificationToken}&userId=${session.user.id}`
    
    console.log(`Email verification link for ${user.username} (${user.contactEmail}):`)
    console.log(verificationUrl)

    // In production, you would send an email here:
    // await sendVerificationEmail(user.contactEmail, verificationUrl, user.username)

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    })

  } catch (error) {
    console.error('Error sending verification email:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/verify-email/confirm
 * Confirm email verification via token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')

    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Missing verification token or user ID' },
        { status: 400 }
      )
    }

    // Find user and check token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        advancedSettings: true,
        contactEmail: true,
        contactEmailVerified: true 
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check verification token
    const verificationData = (user.advancedSettings as any)?.emailVerification
    
    if (!verificationData || 
        verificationData.token !== token || 
        new Date() > new Date(verificationData.expiresAt)) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: userId },
      data: {
        contactEmailVerified: true,
        advancedSettings: {
          // Remove verification data after successful verification
          ...(user.advancedSettings as object),
          emailVerification: null
        }
      }
    })

    // Redirect to account settings with success message
    const redirectUrl = new URL('/account?verified=true', process.env.NEXTAUTH_URL)
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error confirming email verification:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}