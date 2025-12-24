import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.p2POrder.findUnique({
      where: { id: params.id },
      include: {
        operator: {
          select: { id: true, name: true, email: true }
        },
        chatMessages: {
          orderBy: { timestamp: 'asc' }
        },
        documents: true,
        kycVerification: true,
        riskAssessment: true,
        replies: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const order = await prisma.p2POrder.update({
      where: { id: params.id },
      data: {
        status: data.status,
        operatorId: data.operatorId,
        updatedAt: new Date()
      },
      include: {
        operator: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}