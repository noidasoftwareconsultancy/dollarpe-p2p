import { OrderWithDetails } from '@/types'

interface OrderCardProps {
  order: OrderWithDetails
  onSelect?: (order: OrderWithDetails) => void
}

export function OrderCard({ order, onSelect }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'DISPUTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(order)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {order.binanceOrderId}
          </h3>
          <p className="text-sm text-gray-600">
            {order.counterpartyName}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          {order.riskAssessment && (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(order.riskAssessment.recommendation)}`}>
              {order.riskAssessment.recommendation} RISK
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p className="font-medium">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              order.orderType === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {order.orderType}
            </span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-medium">{order.amount} {order.currency}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Payment Method</p>
          <p className="font-medium">{order.paymentMethod}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Price</p>
          <p className="font-medium">{order.price}</p>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex space-x-4">
          <span>💬 {order.chatMessages?.length || 0} messages</span>
          <span>📄 {order.documents?.length || 0} documents</span>
        </div>
        <span>
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>

      {order.kycVerification && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">KYC Status:</span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              order.kycVerification.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              order.kycVerification.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {order.kycVerification.status}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}