import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('buyer');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: buyerOrders, isLoading: isLoadingBuyerOrders } = useQuery(
    'buyerOrders',
    () => ordersAPI.getBuyerOrders({ status: statusFilter }),
    {
      onError: (error) => {
        toast.error('Failed to fetch buyer orders');
      },
    }
  );

  const { data: sellerOrders, isLoading: isLoadingSellerOrders } = useQuery(
    'sellerOrders',
    () => ordersAPI.getSellerOrders({ status: statusFilter }),
    {
      onError: (error) => {
        toast.error('Failed to fetch seller orders');
      },
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-purple-600 bg-purple-100';
      case 'shipped':
        return 'text-indigo-600 bg-indigo-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const orders = activeTab === 'buyer' ? buyerOrders?.data?.orders : sellerOrders?.data?.orders;
  const isLoading = activeTab === 'buyer' ? isLoadingBuyerOrders : isLoadingSellerOrders;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your waste marketplace orders
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('buyer')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'buyer'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCart className="h-4 w-4 inline mr-2" />
                Orders as Buyer
              </button>
              <button
                onClick={() => setActiveTab('seller')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'seller'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Orders as Seller
              </button>
            </nav>
          </div>

          {/* Filter */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading orders...</p>
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Product</p>
                            <p className="font-medium text-gray-900">{order.wasteItem?.title}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium text-gray-900">
                              {order.quantity.amount} {order.quantity.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Price</p>
                            <span className="font-semibold text-lg">
                              ₹{order.totalPrice.amount} {order.totalPrice.currency}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {order.paymentMethod.replace('_', ' ')}
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              order.paymentStatus === 'paid' 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-yellow-600 bg-yellow-100'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>

                        {/* Timeline */}
                        {order.timeline && order.timeline.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Recent Activity:</p>
                            <div className="space-y-1">
                              {order.timeline.slice(-2).map((event, index) => (
                                <div key={index} className="text-xs text-gray-500">
                                  {new Date(event.timestamp).toLocaleDateString()} - {event.status}
                                  {event.note && `: ${event.note}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <Link
                          to={`/orders/${order._id}`}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600 mb-4">
                  {statusFilter 
                    ? 'No orders with the selected status'
                    : `You haven't placed any orders as a ${activeTab} yet`
                  }
                </p>
                {!statusFilter && (
                  <Link to="/waste" className="btn-primary">
                    Browse Listings
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders?.filter(order => order.status === 'pending').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders?.filter(order => order.status === 'processing').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders?.filter(order => order.status === 'delivered').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${orders?.reduce((sum, order) => sum + order.totalPrice.amount, 0).toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
