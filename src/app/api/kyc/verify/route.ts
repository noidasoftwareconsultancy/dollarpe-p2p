import { NextRequest, NextResponse } from 'next/server'
import { kycService } from '@/services/kycService'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    const verification = await kycService.verifyIdentity(orderId)
    
    return NextResponse.json(verification)
  } catch (error) {
    console.error('KYC verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify identity' },
      { status: 500 }
    )
  }
}