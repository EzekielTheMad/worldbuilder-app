/**
 * Individual Campaign API Routes
 * Path: /api/campaigns/[id]/route.ts
 * 
 * Handles operations for specific campaigns:
 * - GET /api/campaigns/[id] - Get campaign details
 * - PATCH /api/campaigns/[id] - Update campaign
 * - DELETE /api/campaigns/[id] - Delete campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * Validation schema for campaign updates
 */
const updateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  worldPrimer: z.string().max(5000).optional(),
  settingNotes: z.string().max(2000).nullable().optional(),
  playerCharacterMapping: z.record(z.string(), z.string()).optional(),
  isPublic: z.boolean().optional(),
})

/**
 * GET /api/campaigns/[id]
 * Retrieve a specific campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
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
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            image: true,
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
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: campaign
    })

  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch campaign' } },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update a campaign (owner only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Check if user is the owner
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only campaign owners can edit campaigns' } },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateCampaignSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid campaign data',
            details: validationResult.error.errors
          } 
        },
        { status: 400 }
      )
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: validationResult.data,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            image: true,
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

    return NextResponse.json({
      success: true,
      data: updatedCampaign
    })

  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update campaign' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a campaign and all related data (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Check if user is the owner
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only campaign owners can delete campaigns' } },
        { status: 403 }
      )
    }

    // Delete campaign (cascade will handle related records)
    await prisma.campaign.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete campaign' } },
      { status: 500 }
    )
  }
}