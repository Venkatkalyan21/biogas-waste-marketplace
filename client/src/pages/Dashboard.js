import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { wasteAPI, ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Leaf,
  Users,
  BarChart3,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's waste listings (only for suppliers)
  const { data: wasteListings, isLoading: isLoadingWaste } = useQuery(
    'myWasteListings',
    () => wasteAPI.getMyListings({ limit: 5 }),
    {
      enabled: user?.role === 'supplier',
      onError: (error) => {
        toast.error('Failed to fetch waste listings');
      },
    }
  );

  // Fetch user's orders (as buyer) (only for buyers)
  const { data: buyerOrders, isLoading: isLoadingBuyerOrders } = useQuery(
    'buyerOrders',
    () => ordersAPI.getBuyerOrders({ limit: 5 }),
    {
      enabled: user?.role === 'buyer',
      onError: (error) => {
        toast.error('Failed to fetch buyer orders');
      },
    }
  );

  // Fetch user's orders (as seller) (only for suppliers)
  const { data: sellerOrders, isLoading: isLoadingSellerOrders } = useQuery(
    'sellerOrders',
    () => ordersAPI.getSellerOrders({ limit: 5 }),
    {
      enabled: user?.role === 'supplier',
      onError: (error) => {
        toast.error('Failed to fetch seller orders');
      },
    }
  );

  const stats = [
    {
      title: 'Active Listings',
      value: wasteListings?.data?.wasteItems?.filter(item => item.status === 'active').length || 0,
      icon: <Package className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      visibleFor: ['supplier'],
    },
    {
      title: 'Total Orders',
      value: (
        (user?.role === 'buyer' ? (buyerOrders?.data?.orders?.length || 0) : 0) +
        (user?.role === 'supplier' ? (sellerOrders?.data?.orders?.length || 0) : 0)
      ),
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      visibleFor: ['supplier', 'buyer'],
    },
    {
      title: 'Pending Orders',
      value: (
        (user?.role === 'buyer' ? (buyerOrders?.data?.orders || []).filter(order => order.status === 'pending').length : 0) +
        (user?.role === 'supplier' ? (sellerOrders?.data?.orders || []).filter(order => order.status === 'pending').length : 0)
      ),
      icon: <Clock className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      visibleFor: ['supplier', 'buyer'],
    },
    {
      title: 'Completed Orders',
      value: (
        (user?.role === 'buyer' ? (buyerOrders?.data?.orders || []).filter(order => order.status === 'delivered').length : 0) +
        (user?.role === 'supplier' ? (sellerOrders?.data?.orders || []).filter(order => order.status === 'delivered').length : 0)
      ),
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      visibleFor: ['supplier', 'buyer'],
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'sold':
        return 'text-blue-600 bg-blue-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getOrderStatusColor = (status) => {
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
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your waste marketplace account.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} rounded-lg p-3 mr-4`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user?.role === 'supplier' && (
                <Link
                  to="/create-waste-listing"
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <Plus className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-primary-600 font-medium">Create New Listing</span>
                </Link>
              )}
              <Link
                to="/waste"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Eye className="h-6 w-6 text-primary-600 mr-2" />
                <span className="text-primary-600 font-medium">Browse Listings</span>
              </Link>
              <Link
                to="/businesses"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Users className="h-6 w-6 text-primary-600 mr-2" />
                <span className="text-primary-600 font-medium">Find Businesses</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              {user?.role === 'supplier' && (
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'listings'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Listings
                </button>
              )}
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {/* Recent Listings */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Listings</h4>
                      {wasteListings?.data?.wasteItems?.slice(0, 3).map((item) => (
                        <div key={item._id} className="flex items-center justify-between py-2 border-b">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity.amount} {item.quantity.unit} • ${item.price.perUnit}/{item.quantity.unit}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                      {wasteListings?.data?.wasteItems?.length === 0 && (
                        <p className="text-sm text-gray-500">No listings yet</p>
                      )}
                    </div>

                    {/* Recent Orders */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Orders</h4>
                      {[...(buyerOrders?.data?.orders || []), ...(sellerOrders?.data?.orders || [])]
                        .slice(0, 3)
                        .map((order) => (
                          <div key={order._id} className="flex items-center justify-between py-2 border-b">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                              <p className="text-xs text-gray-500">
                                ${order.totalPrice.amount} • {order.wasteItem?.title}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        ))}
                      {[...(buyerOrders?.data?.orders || []), ...(sellerOrders?.data?.orders || [])].length === 0 && (
                        <p className="text-sm text-gray-500">No orders yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Listings Tab (only for suppliers) */}
            {activeTab === 'listings' && user?.role === 'supplier' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">My Waste Listings</h3>
                  <Link
                    to="/create-waste-listing"
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Create New Listing
                  </Link>
                </div>

                {isLoadingWaste ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading listings...</p>
                  </div>
                ) : wasteListings?.data?.wasteItems?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {wasteListings.data.wasteItems.map((item) => (
                          <tr key={item._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500">{item.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.quantity.amount} {item.quantity.unit}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                ${item.price.perUnit}/{item.quantity.unit}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                to={`/waste/${item._id}`}
                                className="text-primary-600 hover:text-primary-900 mr-3"
                              >
                                View
                              </Link>
                              <button className="text-indigo-600 hover:text-indigo-900">
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">You haven't created any listings yet</p>
                    <Link
                      to="/create-waste-listing"
                      className="btn-primary mt-4"
                    >
                      Create Your First Listing
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">My Orders</h3>
                  <Link
                    to="/orders"
                    className="btn-primary text-sm px-4 py-2"
                  >
                    View All Orders
                  </Link>
                </div>

                {(isLoadingBuyerOrders || isLoadingSellerOrders) ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading orders...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(user?.role === 'buyer' ? buyerOrders?.data?.orders : sellerOrders?.data?.orders || [])
                      .map((order) => (
                      <div key={order._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{order.orderNumber}</h4>
                            <p className="text-sm text-gray-600">{order.wasteItem?.title}</p>
                            <p className="text-sm text-gray-500">
                              {order.quantity.amount} {order.quantity.unit} • ${order.totalPrice.amount}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Link
                            to={`/orders/${order._id}`}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                    {(user?.role === 'buyer' ? buyerOrders?.data?.orders : sellerOrders?.data?.orders || []).length === 0 && (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {user?.role === 'buyer' ? "You haven't placed any orders yet" : "You haven't received any orders yet"}
                        </p>
                        <Link
                          to="/waste"
                          className="btn-primary mt-4"
                        >
                          Browse Listings
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
