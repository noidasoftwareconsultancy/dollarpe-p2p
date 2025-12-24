/**
 * OCR Service for Document Processing
 * 
 * Handles optical character recognition for uploaded documents
 * Integrates with multiple OCR providers for redundancy
 */

import { prisma } from '@/lib/prisma'

export interface OCRResult {
  text: string
  confidence: number
  boundingBoxes: Array<{
    text: string
    confidence: number
    x: number
    y: number
    width: number
    height: number
  }>
  metadata: {
    pageCount: number
    language: string
    orientation: number
  }
}

export class OCRService {
  private providers = ['tesseract', 'aws-textract', 'google-vision']

  /**
   * Process document with OCR
   */
  async processDocument(documentId: string): Promise<OCRResult> {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document || !document.localPath) {
      throw new Error('Document not found or not downloaded')
    }

    // Update status to processing
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' }
    })

    try {
      // Try primary OCR provider
      let result = await this.performOCR(document.localPath, 'primary')
      
      // If confidence is low, try backup provider
      if (result.confidence < 0.8) {
        const backupResult = await this.performOCR(document.localPath, 'backup')
        if (backupResult.confidence > result.confidence) {
          result = backupResult
        }
      }

      // Store OCR results
      await prisma.document.update({
        where: { id: documentId },
        data: {
          ocrText: result.text,
          ocrConfidence: result.confidence,
          status: 'PROCESSED',
          processedAt: new Date()
        }
      })

      return result

    } catch (error) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' }
      })
      throw error
    }
  }

  /**
   * Perform OCR using specified provider
   */
  private async performOCR(filePath: string, provider: 'primary' | 'backup'): Promise<OCRResult> {
    // Implementation would integrate with actual OCR services
    // For now, return mock data
    
    return {
      text: 'Sample OCR text from document',
      confidence: 0.95,
      boundingBoxes: [],
      metadata: {
        pageCount: 1,
        language: 'en',
        orientation: 0
      }
    }
  }

  /**
   * Extract specific data patterns from OCR text
   */
  async extractPatterns(text: string, documentType: string): Promise<Record<string, any>> {
    const patterns: Record<string, RegExp[]> = {
      ID_CARD: [
        /ID\s*(?:NO|NUMBER)?\s*:?\s*([A-Z0-9]+)/i,
        /NAME\s*:?\s*([A-Z\s]+)/i,
        /DOB\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
      ],
      PASSPORT: [
        /PASSPORT\s*(?:NO|NUMBER)?\s*:?\s*([A-Z0-9]+)/i,
        /SURNAME\s*:?\s*([A-Z\s]+)/i,
        /GIVEN\s*NAMES?\s*:?\s*([A-Z\s]+)/i
      ],
      BANK_STATEMENT: [
        /ACCOUNT\s*(?:NO|NUMBER)?\s*:?\s*([0-9\-]+)/i,
        /BALANCE\s*:?\s*([0-9,\.]+)/i
      ]
    }

    const extracted: Record<string, any> = {}
    const typePatterns = patterns[documentType] || []

    for (const pattern of typePatterns) {
      const match = text.match(pattern)
      if (match) {
        extracted[pattern.source] = match[1]
      }
    }

    return extracted
  }
}

export const ocrService = new OCRService()