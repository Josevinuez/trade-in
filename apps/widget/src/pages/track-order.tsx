import { useState } from 'react';
import { Header } from '../components/Header';
import { Search, Mail, Hash, Clock, CheckCircle, AlertCircle, XCircle, Package, DollarSign } from 'lucide-react';

interface OrderStatus {
  id: number;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'AWAITING_APPROVAL' | 'REJECTED';
  quotedAmount: number;
  finalAmount?: number;
  submittedAt: string;
  processedAt?: string;
  completedAt?: string;
  customerName: string;
  deviceModel: string;
  deviceCondition: string;
  notes?: string;
}

export default function TrackOrder() {
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch('/api/trade-in/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          orderNumber,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to find order');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'PROCESSING':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'AWAITING_APPROVAL':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'AWAITING_APPROVAL':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-xl text-gray-600">
              Enter your email and order number to check the status of your trade-in
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your order number"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track Order
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Order Status */}
          {order && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Status</h2>
                <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-2 font-medium capitalize">{order.status.toLowerCase()}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{order.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium">{order.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Device:</span>
                        <span className="font-medium">{order.deviceModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Condition:</span>
                        <span className="font-medium capitalize">{order.deviceCondition.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quoted Amount:</span>
                        <span className="font-medium text-green-600">${order.quotedAmount.toFixed(2)}</span>
                      </div>
                      {order.finalAmount !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Final Amount:</span>
                          <span className="font-medium text-green-600">${order.finalAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                    <div>
                      <div className="font-medium">Order Submitted</div>
                      <div className="text-sm text-gray-600">{formatDate(order.submittedAt)}</div>
                    </div>
                  </div>
                  
                  {order.processedAt && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                      <div>
                        <div className="font-medium">Processing Started</div>
                        <div className="text-sm text-gray-600">{formatDate(order.processedAt)}</div>
                      </div>
                    </div>
                  )}
                  
                  {order.completedAt && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                      <div>
                        <div className="font-medium">Order Completed</div>
                        <div className="text-sm text-gray-600">{formatDate(order.completedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Approval Actions for Customers */}
          {order && order.status === 'AWAITING_APPROVAL' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Revised Offer</h3>
              <p className="text-sm text-gray-600 mb-4">We reviewed your device and updated the offer. Please approve or decline.</p>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-4">
                <span className="text-gray-700">Proposed Final Amount</span>
                <span className="font-semibold text-green-700">${(order.finalAmount ?? order.quotedAmount).toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  disabled={actionLoading}
                  onClick={async () => {
                    setActionLoading(true);
                    setError('');
                    try {
                      const res = await fetch('/api/trade-in/respond', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, orderNumber, decision: 'approve' })
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data.error || 'Failed to approve');
                      }
                      const data = await res.json();
                      setOrder(data);
                    } catch (e: any) {
                      setError(e.message || 'Failed to approve');
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Approve Offer'}
                </button>
                <button
                  disabled={actionLoading}
                  onClick={async () => {
                    setActionLoading(true);
                    setError('');
                    try {
                      const res = await fetch('/api/trade-in/respond', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, orderNumber, decision: 'decline' })
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data.error || 'Failed to decline');
                      }
                      const data = await res.json();
                      setOrder(data);
                    } catch (e: any) {
                      setError(e.message || 'Failed to decline');
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Decline Offer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 