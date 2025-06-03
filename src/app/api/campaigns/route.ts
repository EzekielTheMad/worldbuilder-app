/**
 * Campaigns API Routes
 * 
 * Handles CRUD operations for campaigns including:
 * - GET /api/campaigns - List user's campaigns
 * - POST /api/campaigns - Create new campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * Validation schema for campaign creation
 */
const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name too long'),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  worldPrimer: z.string().max(5000, 'World primer too long').optional(),
  settingNotes: z.string().max(2000, 'Setting notes too long').optional().nullable(),
  playerCharacterMapping: z.record(z.string(), z.string()).optional(),
  isPublic: z.boolean().optional(),
})

/**
 * GET /api/campaigns
 * Retrieve all campaigns for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)
    const role = searchParams.get('role') // 'owner', 'dm', 'player'

    // Build where clause based on role filter
    let whereClause: any = {
      OR: [
        { ownerId: session.user.id }, // Campaigns owned by user
        { 
          members: {
            some: {
              userId: session.user.id,
              role: { in: ['DM'] } // User is a DM
            }
          }
        }
      ]
    }

    // Apply role filter if specified
    if (role === 'owner') {
      whereClause = { ownerId: session.user.id }
    } else if (role === 'dm') {
      whereClause = {
        members: {
          some: {
            userId: session.user.id,
            role: 'DM'
          }
        }
      }
    } else if (role === 'player') {
      whereClause = {
        members: {
          some: {
            userId: session.user.id,
            role: 'PLAYER'
          }
        }
      }
    }

    // Fetch campaigns with related data
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where: whereClause,
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
          sessions: {
            select: {
              id: true,
              createdAt: true,
              status: true,
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1 // Just the latest session for preview
          },
          _count: {
            select: {
              sessions: true,
              members: true,
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: limit,
        skip: offset,
      }),
      
      prisma.campaign.count({
        where: whereClause,
      })
    ])

    // Transform campaigns for response
    const transformedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      worldPrimer: campaign.worldPrimer,
      settingNotes: campaign.settingNotes,
      playerCharacterMapping: campaign.playerCharacterMapping,
      isPublic: campaign.isPublic,
      inviteCode: campaign.inviteCode,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
      owner: campaign.owner,
      memberCount: campaign._count.members,
      sessionCount: campaign._count.sessions,
      lastSessionAt: campaign.sessions[0]?.createdAt?.toISOString() || null,
      // User's role in this campaign
      userRole: campaign.ownerId === session.user.id 
        ? 'OWNER' 
        : campaign.members.find(m => m.userId === session.user.id)?.role || 'MEMBER'
    }))

    return NextResponse.json({
      success: true,
      data: {
        campaigns: transformedCampaigns,
        total,
        hasMore: offset + campaigns.length < total,
      }
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch campaigns' 
        } 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createCampaignSchema.safeParse(body)
    
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

    const {
      name,
      description,
      worldPrimer,
      settingNotes,
      playerCharacterMapping,
      isPublic = false
    } = validationResult.data

    // Create campaign in database
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        worldPrimer: worldPrimer || '',
        settingNotes,
        playerCharacterMapping: playerCharacterMapping || {},
        isPublic,
        ownerId: session.user.id,
        // Create campaign membership for owner
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
            characterName: null, // Owner doesn't need a character mapping by default
          }
        }
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

    // Transform campaign for response
    const transformedCampaign = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      worldPrimer: campaign.worldPrimer,
      settingNotes: campaign.settingNotes,
      playerCharacterMapping: campaign.playerCharacterMapping,
      isPublic: campaign.isPublic,
      inviteCode: campaign.inviteCode,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
      owner: campaign.owner,
      memberCount: campaign._count.members,
      sessionCount: campaign._count.sessions,
      lastSessionAt: null,
      userRole: 'OWNER'
    }

    return NextResponse.json({
      success: true,
      data: {
        campaign: transformedCampaign,
        inviteCode: campaign.inviteCode
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating campaign:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'DUPLICATE_ERROR', 
              message: 'A campaign with this name already exists' 
            } 
          },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to create campaign' 
        } 
      },
      { status: 500 }
    )
  }
}