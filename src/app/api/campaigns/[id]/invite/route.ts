import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInviteCode } from '@/lib/utils' // You'll need to create this utility

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      ownerId: session.user.id,
    }
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Generate new invite code
  const inviteCode = generateInviteCode() // Create this function
  
  await prisma.campaign.update({
    where: { id: params.id },
    data: { inviteCode }
  })

  return NextResponse.json({ inviteCode })
}