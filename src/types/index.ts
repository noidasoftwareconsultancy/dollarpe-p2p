// Core Types for Binance P2P Operations Platform

export interface Operator {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'SUPERVISOR' | 'OPERATOR'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface P2POrder {
  id: string
  binanceOrderId: string
  orderType: 'BUY' | 'SELL'
  amount: number
  price: number
  currency: string
  paymentMethod: string
  counterpartyId: string
  counterpartyName: string
  status: OrderStatus
  operatorId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  orderId: string
  content: string
  timestamp: Date
  isFromUser: boolean
  isProcessed: boolean
  createdAt: Date
}

export interface Document {
  id: string
  orderId: string
  filename: string
  originalUrl: string
  localPath?: string
  fileType: string
  fileSize: number
  uploadedAt: Date
  processedAt?: Date
  ocrText?: string
  ocrConfidence?: number
  status: DocumentStatus
}

export interface KycVerification {
  id: string
  orderId: string
  status: KycStatus
  verificationData: Record<string, any>
  riskScore?: number
  notes?: string
  verifiedAt?: Date
  verifiedBy?: string
}

export interface RiskAssessment {
  id: string
  orderId: string
  overallScore: number
  riskFactors: Record<string, any>
  recommendation: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  autoApproved: boolean
  reviewRequired: boolean
  notes?: string
  assessedAt: Date
}

export interface ChatReply {
  id: string
  orderId: string
  messageId?: string
  suggestedText: string
  finalText?: string
  replyType: ReplyType
  confidence: number
  status: 'DRAFT' | 'REVIEWED' | 'SENT' | 'FAILED'
  operatorId: string
  sentAt?: Date
  createdAt: Date
}

export interface AuditLog {
  id: string
  orderId?: string
  operatorId?: string
  action: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// Enums
export type OrderStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'

export type DocumentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED'
  | 'VERIFIED'

export type KycStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'REQUIRES_REVIEW'

export type ReplyType = 
  | 'GREETING'
  | 'PAYMENT_INSTRUCTION'
  | 'DOCUMENT_REQUEST'
  | 'KYC_CLARIFICATION'
  | 'COMPLETION_CONFIRMATION'
  | 'DISPUTE_RESPONSE'
  | 'CUSTOM'

// Dashboard Types
export interface DashboardStats {
  activeOrders: number
  pendingReviews: number
  completedToday: number
  riskAlerts: number
  averageResponseTime: number
  operatorWorkload: Record<string, number>
}

export interface OrderWithDetails extends P2POrder {
  chatMessages: ChatMessage[]
  documents: Document[]
  kycVerification?: KycVerification
  riskAssessment?: RiskAssessment
  pendingReplies: ChatReply[]
  operator?: Operator
}

// Browser Automation Types
export interface BrowserSession {
  id: string
  operatorId: string
  rdpConnection: string
  status: 'ACTIVE' | 'IDLE' | 'DISCONNECTED'
  lastActivity: Date
}

export interface AutomationEvent {
  type: 'ORDER_DETECTED' | 'MESSAGE_RECEIVED' | 'DOCUMENT_UPLOADED' | 'PAYMENT_CONFIRMED'
  orderId: string
  data: Record<string, any>
  timestamp: Date
}