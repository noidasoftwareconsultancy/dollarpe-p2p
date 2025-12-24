import { NextRequest, NextResponse } from 'next/server'
import { riskService } from '@/services/riskService'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    const assessment = await riskService.assessOrder(orderId)
    
    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Risk assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to assess risk' },
      { status: 500 }
    )
  }
}