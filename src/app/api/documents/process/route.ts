import { NextRequest, NextResponse } from 'next/server'
import { ocrService } from '@/services/ocrService'

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    const result = await ocrService.processDocument(documentId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Document processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}