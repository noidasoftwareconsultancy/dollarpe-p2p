'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface DashboardStats {
  activeOrders: number
  pendingReviews: number
  completedToday: number
  riskAlerts: number
}

interface Order {
  id: string
  binanceOrderId: string
  orderType: string
  amount: number
  currency: string
  counterpartyName: string
  status: string
  createdAt: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    pendingReviews: 0,
    completedToday: 0,
    riskAlerts: 0
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await fetch('/api/orders')
      const ordersData = await ordersResponse.json()
      setOrders(ordersData.slice(0, 10)) // Show latest 10 orders

      // Calculate stats from orders
      const activeOrders = ordersData.filter((o: Order) => 
        ['PENDING', 'IN_PROGRESS', 'PAYMENT_PENDING'].includes(o.status)
      ).length
      
      const pendingReviews = ordersData.filter((o: Order) => 
        o.status === 'PENDING'
      ).length
      
      const today = new Date().toDateString()
      const completedToday = ordersData.filter((o: Order) => 
        o.status === 'COMPLETED' && 
        new Date(o.createdAt).toDateString() === today
      ).length

      setStats({
        activeOrders,
        pendingReviews,
        completedToday,
        riskAlerts: Math.floor(Math.random() * 5) // Mock data
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600'
      case 'PENDING': return 'text-yellow-600'
      case 'IN_PROGRESS': return 'text-blue-600'
      case 'CANCELLED': return 'text-red-600'
      case 'DISPUTED': return 'text-red-700'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                DollarPe P2P Dashboard
              </h1>
              <p className="text-gray-600">
                Binance P2P Operations Management Platform
              </p>
            </div>
            <Button onClick={fetchDashboardData}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {stats.activeOrders}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activeOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {stats.pendingReviews}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pendingReviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {stats.completedToday}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.completedToday}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {stats.riskAlerts}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Risk Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.riskAlerts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Counterparty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No orders found. Orders will appear here when detected from Binance P2P.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.binanceOrderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.orderType === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {order.orderType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.amount} {order.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.counterpartyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getStatusColor(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              🤖 Browser Automation
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Automated detection of P2P orders, messages, and documents from Binance interface via RDP connections.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Real-time order monitoring</li>
              <li>• Chat message detection</li>
              <li>• Document upload tracking</li>
              <li>• Status change monitoring</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              🔍 KYC & Risk Assessment
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Comprehensive identity verification and risk scoring for automated decision making.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• OCR document processing</li>
              <li>• Identity verification</li>
              <li>• Risk factor analysis</li>
              <li>• Automated approvals</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              💬 Smart Reply System
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              AI-powered reply generation with operator review and manual sending controls.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Context-aware replies</li>
              <li>• Operator review workflow</li>
              <li>• Manual send approval</li>
              <li>• Audit trail logging</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}