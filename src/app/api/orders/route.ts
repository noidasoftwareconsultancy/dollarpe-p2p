import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const operatorId = searchParams.get('operatorId')
    
    const where: any = {}
    if (status) where.status = status
    if (operatorId) where.operatorId = operatorId
    
    const orders = await prisma.p2POrder.findMany({
      where,
      include: {
        operator: {
          select: { id: true, name: true, email: true }
        },
        chatMessages: {
          orderBy: { timestamp: 'desc' },
          take: 5
        },
        documents: {
          select: { id: true, filename: true, status: true, fileType: true }
        },
        kycVerification: true,
        riskAssessment: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const order = await prisma.p2POrder.create({
      data: {
        binanceOrderId: data.binanceOrderId,
        orderType: data.orderType,
        amount: data.amount,
        price: data.price,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        counterpartyId: data.counterpartyId,
        counterpartyName: data.counterpartyName,
        operatorId: data.operatorId,
        status: 'PENDING'
      },
      include: {
        operator: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}