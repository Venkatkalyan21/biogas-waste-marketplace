import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Package,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageCircle,
  Star,
  ChevronLeft,
  Download,
  FileText
} from 'lucide-react';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock order data
      const mockOrder = {
        _id: orderId,
        orderNumber: `ORD-${orderId}`,
        status: 'processing',
        createdAt: '2024-01-15T10:30:00Z',
        totalAmount: 250.00,
        paymentMethod: 'stripe',
        paymentStatus: 'paid',
        wasteItem: {
          _id: '1',
          title: 'Fresh Vegetable Waste - 500kg',
          category: 'Vegetables',
          quantity: 500,
          unit: 'kg',
          price: 0.50,
          images: ['/waste1.jpg']
        },
        seller: {
          _id: 'seller1',
          businessName: 'Green Farms Co.',
          email: 'info@greenfarms.com',
          phone: '+1 234-567-8900',
          address: '123 Farm Road, Agricultural City'
        },
        buyer: {
          _id: 'buyer1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 234-567-8901'
        },
        deliveryAddress: {
          street: '456 Industrial Ave',
          city: 'Tech City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        tracking: {
          carrier: 'EcoLogistics',
          trackingNumber: 'ECO123456789',
          estimatedDelivery: '2024-01-17T14:00:00Z'
        },
        review: null
      };
      
      setOrder(mockOrder);
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrder(prev => ({ ...prev, status: newStatus }));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleSubmitReview = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrder(prev => ({ ...prev, review }));
      setShowReviewModal(false);
      toast.success('Review submitted successfully');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      confirmed: <CheckCircle className="h-4 w-4" />,
      processing: <Package className="h-4 w-4" />,
      shipped: <Truck className="h-4 w-4" />,
      delivered: <CheckCircle className="h-4 w-4" />,
      cancelled: <AlertCircle className="h-4 w-4" />
    };
    return icons[status] || <Package className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Orders
          </button>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Order #{order.orderNumber}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2 capitalize">{order.status}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button className="btn-outline flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Invoice
                </button>
                <button className="btn-outline flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waste Item Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h2>
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {order.wasteItem.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{order.wasteItem.category}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-600">Quantity: </span>
                      <span className="font-medium">{order.wasteItem.quantity} {order.wasteItem.unit}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        ₹{order.wasteItem.price}/{order.wasteItem.unit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Order Placed</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Payment Confirmed</h3>
                    <p className="text-sm text-gray-600">
                      Paid via {order.paymentMethod}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Processing</h3>
                    <p className="text-sm text-gray-600">
                      Seller is preparing your order
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start opacity-50">
                  <div className="bg-gray-100 rounded-full p-2 mr-3">
                    <Truck className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Shipped</h3>
                    <p className="text-sm text-gray-600">
                      Pending
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Delivery Address</h3>
                    <p className="text-gray-600">
                      {order.deliveryAddress.street}<br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}<br />
                      {order.deliveryAddress.country}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Shipping Carrier</h3>
                    <p className="text-gray-600">
                      {order.tracking.carrier}<br />
                      Tracking: {order.tracking.trackingNumber}<br />
                      Est. Delivery: {new Date(order.tracking.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">{order.seller.businessName}</h3>
                  <p className="text-sm text-gray-600">{order.seller.email}</p>
                  <p className="text-sm text-gray-600">{order.seller.phone}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    {order.seller.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h2>
              <div className="space-y-3">
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate('processing')}
                    className="w-full btn-primary"
                  >
                    Start Processing
                  </button>
                )}
                
                {order.status === 'processing' && (
                  <button
                    onClick={() => handleStatusUpdate('shipped')}
                    className="w-full btn-primary"
                  >
                    Mark as Shipped
                  </button>
                )}
                
                {order.status === 'delivered' && !order.review && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full btn-outline"
                  >
                    Leave Review
                  </button>
                )}
                
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    className="w-full btn-outline text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600 capitalize">{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Review</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="input"
                  rows={4}
                  placeholder="Share your experience..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 btn-primary"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
