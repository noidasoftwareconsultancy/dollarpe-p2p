/**
 * Risk Assessment Service
 * 
 * Evaluates risk factors for P2P orders and provides recommendations
 * for automated approval, manual review, or rejection.
 */

import { prisma } from '@/lib/prisma'

export interface RiskFactor {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  score: number
  description: string
  details?: any
}

export interface RiskAssessmentResult {
  orderId: string
  overallScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendation: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'REJECT'
  factors: RiskFactor[]
  autoApproved: boolean
  reviewRequired: boolean
  notes?: string
}

export class RiskService {
  private readonly RISK_THRESHOLDS = {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8,
    CRITICAL: 1.0
  }

  private readonly AUTO_APPROVE_THRESHOLD = 0.2
  private readonly MANUAL_REVIEW_THRESHOLD = 0.7

  /**
   * Perform comprehensive risk assessment for a P2P order
   */
  async assessOrder(orderId: string): Promise<RiskAssessmentResult> {
    const order = await prisma.p2POrder.findUnique({
      where: { id: orderId },
      include: {
        documents: true,
        chatMessages: true,
        kycVerification: true
      }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    const factors: RiskFactor[] = []

    // Assess various risk factors
    await this.assessOrderAmount(order, factors)
    await this.assessCounterpartyRisk(order, factors)
    await this.assessPaymentMethodRisk(order, factors)
    await this.assessDocumentRisk(order, factors)
    await this.assessCommunicationRisk(order, factors)
    await this.assessKYCRisk(order, factors)
    await this.assessBehavioralRisk(order, factors)

    // Calculate overall risk score
    const overallScore = this.calculateOverallScore(factors)
    const riskLevel = this.determineRiskLevel(overallScore)
    const recommendation = this.determineRecommendation(overallScore, factors)

    const result: RiskAssessmentResult = {
      orderId,
      overallScore,
      riskLevel,
      recommendation,
      factors,
      autoApproved: recommendation === 'AUTO_APPROVE',
      reviewRequired: recommendation === 'MANUAL_REVIEW',
      notes: this.generateRiskNotes(factors)
    }

    // Store assessment in database
    await this.storeAssessment(result)

    return result
  }

  /**
   * Assess risk based on order amount
   */
  private async assessOrderAmount(order: any, factors: RiskFactor[]): Promise<void> {
    const amount = parseFloat(order.amount.toString())
    
    if (amount > 10000) {
      factors.push({
        type: 'HIGH_VALUE_ORDER',
        severity: 'HIGH',
        score: 0.8,
        description: 'Order amount exceeds high-value threshold',
        details: { amount, threshold: 10000 }
      })
    } else if (amount > 5000) {
      factors.push({
        type: 'MEDIUM_VALUE_ORDER',
        severity: 'MEDIUM',
        score: 0.4,
        description: 'Order amount is in medium-value range',
        details: { amount, threshold: 5000 }
      })
    }

    // Check for unusual amount patterns
    const recentOrders = await this.getRecentOrdersByCounterparty(order.counterpartyId)
    if (recentOrders.length > 0) {
      const avgAmount = recentOrders.reduce((sum, o) => sum + parseFloat(o.amount.toString()), 0) / recentOrders.length
      const deviation = Math.abs(amount - avgAmount) / avgAmount

      if (deviation > 2.0) {
        factors.push({
          type: 'UNUSUAL_AMOUNT_PATTERN',
          severity: 'MEDIUM',
          score: 0.5,
          description: 'Order amount significantly deviates from historical pattern',
          details: { currentAmount: amount, averageAmount: avgAmount, deviation }
        })
      }
    }
  }

  /**
   * Assess counterparty-related risks
   */
  private async assessCounterpartyRisk(order: any, factors: RiskFactor[]): Promise<void> {
    // Check counterparty history
    const counterpartyOrders = await this.getCounterpartyOrderHistory(order.counterpartyId)
    
    if (counterpartyOrders.length === 0) {
      factors.push({
        type: 'NEW_COUNTERPARTY',
        severity: 'MEDIUM',
        score: 0.4,
        description: 'First-time counterparty with no transaction history',
        details: { counterpartyId: order.counterpartyId }
      })
    }

    // Check for recent disputes
    const recentDisputes = counterpartyOrders.filter(o => 
      o.status === 'DISPUTED' && 
      new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )

    if (recentDisputes.length > 0) {
      factors.push({
        type: 'RECENT_DISPUTES',
        severity: 'HIGH',
        score: 0.7,
        description: 'Counterparty has recent disputed transactions',
        details: { disputeCount: recentDisputes.length, period: '30 days' }
      })
    }

    // Check completion rate
    const completedOrders = counterpartyOrders.filter(o => o.status === 'COMPLETED')
    const completionRate = counterpartyOrders.length > 0 ? completedOrders.length / counterpartyOrders.length : 0

    if (completionRate < 0.8 && counterpartyOrders.length >= 5) {
      factors.push({
        type: 'LOW_COMPLETION_RATE',
        severity: 'MEDIUM',
        score: 0.5,
        description: 'Counterparty has low order completion rate',
        details: { completionRate, totalOrders: counterpartyOrders.length }
      })
    }
  }

  /**
   * Assess payment method risks
   */
  private async assessPaymentMethodRisk(order: any, factors: RiskFactor[]): Promise<void> {
    const highRiskMethods = ['CASH', 'GIFT_CARDS', 'PREPAID_CARDS']
    const mediumRiskMethods = ['PAYPAL', 'VENMO', 'CASHAPP']

    if (highRiskMethods.includes(order.paymentMethod)) {
      factors.push({
        type: 'HIGH_RISK_PAYMENT_METHOD',
        severity: 'HIGH',
        score: 0.6,
        description: 'Payment method has high fraud risk',
        details: { paymentMethod: order.paymentMethod }
      })
    } else if (mediumRiskMethods.includes(order.paymentMethod)) {
      factors.push({
        type: 'MEDIUM_RISK_PAYMENT_METHOD',
        severity: 'MEDIUM',
        score: 0.3,
        description: 'Payment method has moderate fraud risk',
        details: { paymentMethod: order.paymentMethod }
      })
    }
  }

  /**
   * Assess document-related risks
   */
  private async assessDocumentRisk(order: any, factors: RiskFactor[]): Promise<void> {
    if (order.documents.length === 0) {
      factors.push({
        type: 'NO_DOCUMENTS',
        severity: 'HIGH',
        score: 0.8,
        description: 'No identity documents provided',
        details: { documentCount: 0 }
      })
      return
    }

    // Check document quality and OCR confidence
    const lowConfidenceDocs = order.documents.filter((doc: any) => 
      doc.ocrConfidence && doc.ocrConfidence < 0.7
    )

    if (lowConfidenceDocs.length > 0) {
      factors.push({
        type: 'LOW_DOCUMENT_QUALITY',
        severity: 'MEDIUM',
        score: 0.4,
        description: 'Some documents have low OCR confidence',
        details: { 
          lowConfidenceCount: lowConfidenceDocs.length,
          totalDocuments: order.documents.length 
        }
      })
    }

    // Check for document processing failures
    const failedDocs = order.documents.filter((doc: any) => doc.status === 'FAILED')
    if (failedDocs.length > 0) {
      factors.push({
        type: 'DOCUMENT_PROCESSING_FAILED',
        severity: 'HIGH',
        score: 0.7,
        description: 'Some documents failed to process',
        details: { failedCount: failedDocs.length }
      })
    }
  }

  /**
   * Assess communication pattern risks
   */
  private async assessCommunicationRisk(order: any, factors: RiskFactor[]): Promise<void> {
    if (order.chatMessages.length === 0) {
      factors.push({
        type: 'NO_COMMUNICATION',
        severity: 'MEDIUM',
        score: 0.3,
        description: 'No communication from counterparty',
        details: { messageCount: 0 }
      })
      return
    }

    // Check for suspicious communication patterns
    const userMessages = order.chatMessages.filter((msg: any) => msg.isFromUser)
    const suspiciousKeywords = ['urgent', 'hurry', 'quick', 'fast', 'emergency', 'problem']
    
    const suspiciousMessages = userMessages.filter((msg: any) =>
      suspiciousKeywords.some(keyword => 
        msg.content.toLowerCase().includes(keyword)
      )
    )

    if (suspiciousMessages.length > 0) {
      factors.push({
        type: 'SUSPICIOUS_COMMUNICATION',
        severity: 'MEDIUM',
        score: 0.4,
        description: 'Communication contains urgency indicators',
        details: { 
          suspiciousCount: suspiciousMessages.length,
          totalMessages: userMessages.length 
        }
      })
    }

    // Check message frequency
    if (userMessages.length > 20) {
      factors.push({
        type: 'EXCESSIVE_MESSAGING',
        severity: 'LOW',
        score: 0.2,
        description: 'Unusually high number of messages',
        details: { messageCount: userMessages.length }
      })
    }
  }

  /**
   * Assess KYC-related risks
   */
  private async assessKYCRisk(order: any, factors: RiskFactor[]): Promise<void> {
    if (!order.kycVerification) {
      factors.push({
        type: 'NO_KYC_VERIFICATION',
        severity: 'HIGH',
        score: 0.9,
        description: 'KYC verification not completed',
        details: { kycStatus: 'NOT_STARTED' }
      })
      return
    }

    const kyc = order.kycVerification
    
    if (kyc.status === 'REJECTED') {
      factors.push({
        type: 'KYC_REJECTED',
        severity: 'CRITICAL',
        score: 1.0,
        description: 'KYC verification was rejected',
        details: { kycStatus: kyc.status }
      })
    } else if (kyc.status === 'REQUIRES_REVIEW') {
      factors.push({
        type: 'KYC_REQUIRES_REVIEW',
        severity: 'HIGH',
        score: 0.7,
        description: 'KYC verification requires manual review',
        details: { kycStatus: kyc.status }
      })
    } else if (kyc.riskScore && kyc.riskScore < 0.6) {
      factors.push({
        type: 'LOW_KYC_SCORE',
        severity: 'MEDIUM',
        score: 0.5,
        description: 'KYC verification score is below threshold',
        details: { kycScore: kyc.riskScore, threshold: 0.6 }
      })
    }
  }

  /**
   * Assess behavioral risk patterns
   */
  private async assessBehavioralRisk(order: any, factors: RiskFactor[]): Promise<void> {
    // Check order timing patterns
    const orderHour = new Date(order.createdAt).getHours()
    if (orderHour < 6 || orderHour > 22) {
      factors.push({
        type: 'UNUSUAL_TIMING',
        severity: 'LOW',
        score: 0.1,
        description: 'Order created during unusual hours',
        details: { orderHour, timeZone: 'UTC' }
      })
    }

    // Check for rapid successive orders
    const recentOrders = await this.getRecentOrdersByCounterparty(order.counterpartyId, 24)
    if (recentOrders.length > 3) {
      factors.push({
        type: 'RAPID_ORDERS',
        severity: 'MEDIUM',
        score: 0.4,
        description: 'Multiple orders in short time period',
        details: { orderCount: recentOrders.length, period: '24 hours' }
      })
    }
  }

  /**
   * Calculate overall risk score from individual factors
   */
  private calculateOverallScore(factors: RiskFactor[]): number {
    if (factors.length === 0) return 0

    // Weight factors by severity
    const weights = { LOW: 0.1, MEDIUM: 0.3, HIGH: 0.6, CRITICAL: 1.0 }
    
    let totalWeightedScore = 0
    let totalWeight = 0

    factors.forEach(factor => {
      const weight = weights[factor.severity]
      totalWeightedScore += factor.score * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= this.RISK_THRESHOLDS.CRITICAL) return 'CRITICAL'
    if (score >= this.RISK_THRESHOLDS.HIGH) return 'HIGH'
    if (score >= this.RISK_THRESHOLDS.MEDIUM) return 'MEDIUM'
    return 'LOW'
  }

  /**
   * Determine recommendation based on score and factors
   */
  private determineRecommendation(
    score: number, 
    factors: RiskFactor[]
  ): 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'REJECT' {
    // Check for critical factors that require immediate rejection
    const criticalFactors = factors.filter(f => f.severity === 'CRITICAL')
    if (criticalFactors.length > 0) {
      return 'REJECT'
    }

    // Check for factors that require manual review
    const highRiskFactors = factors.filter(f => f.severity === 'HIGH')
    if (highRiskFactors.length > 0 || score >= this.MANUAL_REVIEW_THRESHOLD) {
      return 'MANUAL_REVIEW'
    }

    // Auto-approve low-risk orders
    if (score <= this.AUTO_APPROVE_THRESHOLD) {
      return 'AUTO_APPROVE'
    }

    // Default to manual review for medium risk
    return 'MANUAL_REVIEW'
  }

  /**
   * Generate risk assessment notes
   */
  private generateRiskNotes(factors: RiskFactor[]): string {
    if (factors.length === 0) {
      return 'No significant risk factors identified.'
    }

    const criticalFactors = factors.filter(f => f.severity === 'CRITICAL')
    const highFactors = factors.filter(f => f.severity === 'HIGH')

    let notes = `Risk assessment identified ${factors.length} factor(s). `

    if (criticalFactors.length > 0) {
      notes += `Critical issues: ${criticalFactors.map(f => f.description).join(', ')}. `
    }

    if (highFactors.length > 0) {
      notes += `High-risk factors: ${highFactors.map(f => f.description).join(', ')}. `
    }

    return notes
  }

  /**
   * Store risk assessment in database
   */
  private async storeAssessment(result: RiskAssessmentResult): Promise<void> {
    await prisma.riskAssessment.upsert({
      where: { orderId: result.orderId },
      update: {
        overallScore: result.overallScore,
        riskFactors: result.factors,
        recommendation: result.riskLevel,
        autoApproved: result.autoApproved,
        reviewRequired: result.reviewRequired,
        notes: result.notes,
        updatedAt: new Date()
      },
      create: {
        orderId: result.orderId,
        overallScore: result.overallScore,
        riskFactors: result.factors,
        recommendation: result.riskLevel,
        autoApproved: result.autoApproved,
        reviewRequired: result.reviewRequired,
        notes: result.notes
      }
    })
  }

  // Helper methods for data retrieval
  private async getRecentOrdersByCounterparty(counterpartyId: string, hours: number = 720): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    return await prisma.p2POrder.findMany({
      where: {
        counterpartyId,
        createdAt: { gte: since }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  private async getCounterpartyOrderHistory(counterpartyId: string): Promise<any[]> {
    return await prisma.p2POrder.findMany({
      where: { counterpartyId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50 orders
    })
  }
}

export const riskService = new RiskService()