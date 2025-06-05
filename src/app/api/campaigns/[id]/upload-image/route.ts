import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

/**
 * POST /api/campaigns/[id]/upload-image
 * Upload and process campaign header image
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: id,
        ownerId: session.user.id,
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or you do not have permission to edit it' },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' },
        { status: 400 }
      )
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Please upload an image smaller than 2MB.' },
        { status: 400 }
      )
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'campaigns', id)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate filename with timestamp
    const timestamp = Date.now()
    const bannerPath = path.join(uploadDir, `header-${timestamp}.webp`)
    const thumbnailPath = path.join(uploadDir, `thumb-${timestamp}.webp`)

    // Process images with Sharp
    try {
      // Create banner image (1200x400)
      await sharp(buffer)
        .resize(1200, 400, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(bannerPath)

      // Create thumbnail (400x200)  
      await sharp(buffer)
        .resize(400, 200, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 80 })
        .toFile(thumbnailPath)

    } catch (imageError) {
      console.error('Image processing error:', imageError)
      return NextResponse.json(
        { error: 'Failed to process image. Please try a different image.' },
        { status: 500 }
      )
    }

    // Store relative paths (for URL generation)
    const bannerUrl = `/uploads/campaigns/${id}/header-${timestamp}.webp`
    const thumbnailUrl = `/uploads/campaigns/${id}/thumb-${timestamp}.webp`

    // Update campaign with new image path
    const updatedCampaign = await prisma.campaign.update({
      where: { id: id },
      data: { 
        headerImagePath: bannerUrl,
        updatedAt: new Date()
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
        _count: {
          select: {
            sessions: true,
            members: true,
          }
        }
      }
    })

    console.log(`Image uploaded successfully for campaign ${id}`)

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      images: {
        banner: bannerUrl,
        thumbnail: thumbnailUrl
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/campaigns/[id]/upload-image
 * Remove campaign header image
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: id,
        ownerId: session.user.id,
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or you do not have permission to edit it' },
        { status: 404 }
      )
    }

    // Update campaign to remove image
    const updatedCampaign = await prisma.campaign.update({
      where: { id: id },
      data: { 
        headerImagePath: null,
        updatedAt: new Date()
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
        _count: {
          select: {
            sessions: true,
            members: true,
          }
        }
      }
    })

    console.log(`Image removed for campaign ${id}`)

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign
    })

  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to remove image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}