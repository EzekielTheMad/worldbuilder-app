import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * Validation schema for campaign updates
 * All fields are optional for partial updates
 */
const updateCampaignSchema = z.object({
  name: z.string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional()
    .nullable(),
  worldPrimer: z.string()
    .max(10000, 'World primer must be less than 10000 characters')
    .trim()
    .optional(),
  settingNotes: z.string()
    .max(2000, 'Setting notes must be less than 2000 characters')
    .trim()
    .optional()
    .nullable(),
  playerCharacterMapping: z.record(z.string())
    .optional()
    .nullable(),
})

/**
 * GET /api/campaigns/[id]
 * Fetch a single campaign with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required by Next.js 15+
    const { id } = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: id,
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
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(campaign)

  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update campaign details with auto-save functionality
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    console.log('Received request body:', body) // Debug log
    
    const validatedData = updateCampaignSchema.parse(body)
    console.log('Validated data:', validatedData) // Debug log

    // Check if user owns the campaign
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id, // Only owner can edit
      }
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found or you do not have permission to edit it' },
        { status: 404 }
      )
    }

    console.log('Found existing campaign:', existingCampaign.name) // Debug log

    // Prepare update data, filtering out undefined values
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Only update fields that are provided
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name
    }

    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description || null
    }

    if (validatedData.worldPrimer !== undefined) {
      updateData.worldPrimer = validatedData.worldPrimer
    }

    if (validatedData.settingNotes !== undefined) {
      updateData.settingNotes = validatedData.settingNotes || null
    }

    if (validatedData.playerCharacterMapping !== undefined) {
      updateData.playerCharacterMapping = validatedData.playerCharacterMapping || {}
    }

    // Update the campaign
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: params.id,
      },
      data: updateData,
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
        _count: {
          select: {
            sessions: true,
            members: true,
          }
        }
      }
    })

    return NextResponse.json(updatedCampaign)

  } catch (error) {
    console.error('Error updating campaign:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors)
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
      console.error('Prisma error:', error)
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A campaign with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Handle any other errors
    console.error('Unexpected error type:', typeof error, error)
    return NextResponse.json(
      { 
        error: 'Failed to update campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a campaign (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required by Next.js 15+
    const { id } = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the campaign
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: id,
        ownerId: session.user.id,
      },
      include: {
        _count: {
          select: {
            sessions: true,
          }
        }
      }
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    // Optional: Prevent deletion if campaign has sessions
    // Uncomment if you want to protect campaigns with data
    /*
    if (existingCampaign._count.sessions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete campaign with existing sessions' },
        { status: 400 }
      )
    }
    */

    // Delete the campaign (cascade will handle related records)
    await prisma.campaign.delete({
      where: {
        id: id,
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}