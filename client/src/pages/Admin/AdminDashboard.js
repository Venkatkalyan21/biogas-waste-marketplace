import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter,
  Search,
  Truck
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWasteListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0,
    recentActivity: []
  });
  
  const [users, setUsers] = useState([]);
  const [wasteListings, setWasteListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        totalUsers: 1247,
        totalWasteListings: 523,
        totalOrders: 892,
        totalRevenue: 45678.50,
        activeUsers: 342,
        pendingOrders: 23,
        recentActivity: [
          { id: 1, type: 'user', action: 'New user registered', user: 'John Doe', time: '2 minutes ago' },
          { id: 2, type: 'order', action: 'Order placed', user: 'Sarah Smith', time: '5 minutes ago' },
          { id: 3, type: 'waste', action: 'New waste listing', user: 'Green Farms', time: '10 minutes ago' },
          { id: 4, type: 'payment', action: 'Payment completed', user: 'BioEnergy Co', time: '15 minutes ago' }
        ]
      });

      setUsers([
        { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'individual', status: 'active', joinedAt: '2024-01-10' },
        { _id: '2', name: 'Green Farms', email: 'info@greenfarms.com', role: 'business', status: 'active', joinedAt: '2024-01-08' },
        { _id: '3', name: 'Sarah Smith', email: 'sarah@example.com', role: 'individual', status: 'pending', joinedAt: '2024-01-15' }
      ]);

      setWasteListings([
        { _id: '1', title: 'Fresh Vegetable Waste', seller: 'Green Farms', category: 'Vegetables', quantity: 500, status: 'active', price: 0.50 },
        { _id: '2', title: 'Fruit Peels Mixed', seller: 'Orchard Co', category: 'Fruits', quantity: 300, status: 'pending', price: 0.45 },
        { _id: '3', title: 'Organic Waste Bundle', seller: 'BioFarm', category: 'Mixed', quantity: 1000, status: 'active', price: 0.40 }
      ]);

      setOrders([
        { _id: '1', orderNumber: 'ORD-001', buyer: 'John Doe', seller: 'Green Farms', amount: 250.00, status: 'processing', date: '2024-01-15' },
        { _id: '2', orderNumber: 'ORD-002', buyer: 'Sarah Smith', seller: 'Orchard Co', amount: 135.00, status: 'shipped', date: '2024-01-14' },
        { _id: '3', orderNumber: 'ORD-003', buyer: 'BioEnergy Co', seller: 'BioFarm', amount: 400.00, status: 'delivered', date: '2024-01-13' }
      ]);

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleWasteStatusUpdate = async (wasteId, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setWasteListings(prev => prev.map(item => 
        item._id === wasteId ? { ...item, status: newStatus } : item
      ));
      toast.success(`Waste listing status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update waste listing status');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWasteListings = wasteListings.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.seller.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.buyer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your BioWaste Marketplace platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['dashboard', 'users', 'waste', 'orders'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">12%</span>
                      <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Waste Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalWasteListings}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">8%</span>
                      <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">15%</span>
                      <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-3">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">22%</span>
                      <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-full p-2 mr-3">
                          {activity.type === 'user' && <Users className="h-4 w-4 text-gray-600" />}
                          {activity.type === 'order' && <ShoppingCart className="h-4 w-4 text-gray-600" />}
                          {activity.type === 'waste' && <Package className="h-4 w-4 text-gray-600" />}
                          {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button className="btn-outline flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-gray-600 hover:text-gray-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          {user.status === 'pending' && (
                            <button
                              onClick={() => handleUserStatusUpdate(user._id, 'active')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleUserStatusUpdate(user._id, 'inactive')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Waste Listings Tab */}
        {activeTab === 'waste' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Waste Listings Management</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search listings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button className="btn-outline flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
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
                  {filteredWasteListings.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.seller}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.price}/kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-gray-600 hover:text-gray-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handleWasteStatusUpdate(item._id, 'active')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {item.status === 'active' && (
                            <button
                              onClick={() => handleWasteStatusUpdate(item._id, 'inactive')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button className="btn-outline flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
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
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.buyer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.seller}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-gray-600 hover:text-gray-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          {order.status === 'processing' && (
                            <button
                              onClick={() => handleOrderStatusUpdate(order._id, 'shipped')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Truck className="h-4 w-4" />
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => handleOrderStatusUpdate(order._id, 'delivered')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
