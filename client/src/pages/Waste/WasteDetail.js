import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { wasteAPI, ordersAPI, paymentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import toast from 'react-hot-toast';
import {
  MapPin,
  DollarSign,
  Package,
  Calendar,
  User,
  Star,
  Heart,
  Share2,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Shield
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const WasteDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: { amount: '', unit: '' },
    delivery: { method: 'pickup', address: {} },
    paymentMethod: 'razorpay',
    notes: ''
  });

  const { data: wasteData, isLoading, error } = useQuery(
    ['wasteItem', id],
    () => wasteAPI.getWasteItem(id),
    {
      enabled: !!id,
      onError: (error) => {
        toast.error('Failed to fetch waste item details');
      },
      onSuccess: (data) => {
        // Initialize orderData with waste item details
        if (data?.data?.wasteItem) {
          setOrderData(prev => ({
            ...prev,
            quantity: {
              amount: Math.min(1, data.data.wasteItem.quantity.amount),
              unit: data.data.wasteItem.quantity.unit
            }
          }));
        }
      },
    }
  );

  const formatEnum = (value) => {
    if (!value || typeof value !== 'string') return 'N/A';
    return value.replace(/_/g, ' ');
  };

  const expressInterestMutation = useMutation(
    () => wasteAPI.expressInterest(id),
    {
      onSuccess: () => {
        toast.success('Interest expressed successfully!');
        queryClient.invalidateQueries(['wasteItem', id]);
      },
      onError: (error) => {
        toast.error('Failed to express interest');
      },
    }
  );

  const createOrderMutation = useMutation(
    (orderData) => ordersAPI.createOrder(orderData),
    {
      onSuccess: (response) => {
        toast.success('Order created successfully!');
        setShowOrderModal(false);
        const newOrderId = response.data.order._id;
        if (orderData.paymentMethod === 'razorpay') {
          initiateRazorpayPayment(newOrderId);
        } else {
          // Redirect to order details
          window.location.href = `/orders/${newOrderId}`;
        }
      },
      onError: (error) => {
        toast.error('Failed to create order');
      },
    }
  );

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiateRazorpayPayment = async (orderId) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }
    try {
      const { data } = await paymentsAPI.createRazorpayOrder(orderId);
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.id,
        handler: async function (response) {
          try {
            await paymentsAPI.verifyRazorpayPayment({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment successful');
            window.location.href = `/orders/${orderId}`;
          } catch (e) {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#15803d' }
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (e) {
      toast.error('Unable to initiate Razorpay payment');
    }
  };

  const handleExpressInterest = () => {
    if (!isAuthenticated) {
      toast.error('Please login to express interest');
      return;
    }
    expressInterestMutation.mutate();
  };

  const handleCreateOrder = () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      return;
    }

    const orderPayload = {
      wasteItem: id,
      quantity: orderData.quantity,
      delivery: orderData.delivery,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes
    };

    createOrderMutation.mutate(orderPayload);
  };

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

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'fresh':
        return 'text-green-600 bg-green-100';
      case 'slightly_damaged':
        return 'text-yellow-600 bg-yellow-100';
      case 'spoiled':
        return 'text-red-600 bg-red-100';
      case 'processed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !wasteData?.data?.wasteItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Waste item not found</h2>
          <p className="text-gray-600 mb-4">The waste item you're looking for doesn't exist or has been removed.</p>
          <Link to="/waste" className="btn-primary">
            Browse Other Listings
          </Link>
        </div>
      </div>
    );
  }

  const wasteItem = wasteData.data.wasteItem;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link to="/waste" className="hover:text-primary-600">Browse Waste</Link></li>
            <li>/</li>
            <li className="text-gray-900">{wasteItem.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                {wasteItem.images && wasteItem.images.length > 0 ? (
                  <img
                    src={wasteItem.images[0].url}
                    alt={wasteItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(wasteItem.status)}`}>
                    {wasteItem.status}
                  </span>
                </div>
              </div>
              
              {/* Image Gallery */}
              {wasteItem.images && wasteItem.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {wasteItem.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`${wasteItem.title} ${index + 2}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{wasteItem.title}</h1>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getConditionColor(wasteItem.quality?.condition)}`}>
                    {formatEnum(wasteItem.quality?.condition)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Category: {wasteItem.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    Type: {formatEnum(wasteItem.wasteType)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Heart className="h-4 w-4 text-gray-400" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Share2 className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600">{wasteItem.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity & Price</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available Quantity:</span>
                      <span className="font-medium">
                        {wasteItem.quantity.amount} {wasteItem.quantity.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price per Unit:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ₹{wasteItem.price.perUnit}/{wasteItem.quantity.unit}
                      </span>
                      <span className="text-lg text-gray-600 ml-2">
                        Total: ₹{(wasteItem.quantity.amount * wasteItem.price.perUnit).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Negotiable:</span>
                      <span className={`font-medium ${wasteItem.price.negotiable ? 'text-green-600' : 'text-gray-500'}`}>
                        {wasteItem.price.negotiable ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">
                        {new Date(wasteItem.availability.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">
                        {new Date(wasteItem.availability.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="font-medium capitalize">
                        {formatEnum(wasteItem.availability?.frequency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quality Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Condition</p>
                    <p className="font-medium capitalize">{formatEnum(wasteItem.quality?.condition)}</p>
                  </div>
                  {wasteItem.quality.moistureContent && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Moisture Content</p>
                      <p className="font-medium">{wasteItem.quality.moistureContent}%</p>
                    </div>
                  )}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Contamination Level</p>
                    <p className="font-medium capitalize">{wasteItem.quality.contaminationLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
              <div className="flex items-start mb-4">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-gray-900">
                    {wasteItem.location.address.street && `${wasteItem.location.address.street}, `}
                    {wasteItem.location.address.city || 'Location not specified'}
                    {wasteItem.location.address.state && `, ${wasteItem.location.address.state}`}
                    {wasteItem.location.address.zipCode && ` ${wasteItem.location.address.zipCode}`}
                  </p>
                  <p className="text-gray-600">{wasteItem.location.address.country || 'USA'}</p>
                </div>
              </div>
              {wasteItem.location.coordinates?.latitude && wasteItem.location.coordinates?.longitude ? (
                <div className="h-80 w-full rounded-lg overflow-hidden relative">
                  {GOOGLE_MAPS_API_KEY ? (
                    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={{
                          lat: wasteItem.location.coordinates.latitude,
                          lng: wasteItem.location.coordinates.longitude
                        }}
                        zoom={12}
                      >
                        <Marker
                          position={{
                            lat: wasteItem.location.coordinates.latitude,
                            lng: wasteItem.location.coordinates.longitude
                          }}
                        />
                      </GoogleMap>
                    </LoadScript>
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-lg text-gray-600 text-center">
                      Map not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY
                    </div>
                  )}
                </div>
              ) : null}
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">
                    {wasteItem.seller?.firstName} {wasteItem.seller?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{wasteItem.seller?.role}</p>
                  {wasteItem.seller?.businessInfo?.companyName && (
                    <p className="text-sm text-gray-600">{wasteItem.seller.businessInfo.companyName}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-yellow-500">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  <span>{wasteItem.seller?.ratings?.average || '0.0'}</span>
                </div>
                <span className="text-sm text-gray-500">
                  ({wasteItem.seller?.ratings?.count || 0} reviews)
                </span>
              </div>

              {user?.role === 'buyer' && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{wasteItem.seller?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{wasteItem.seller?.phone}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                {user?.role === 'buyer' && (
                  <button className="flex-1 btn-outline text-sm py-2">
                    Contact Seller
                  </button>
                )}
                <Link
                  to={`/users/${wasteItem.seller?._id}`}
                  className="flex-1 btn-primary text-sm py-2 text-center"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <Link to="/login" className="w-full btn-primary py-3 block text-center">
                    Login to Buy
                  </Link>
                  <p className="text-sm text-gray-600 text-center">
                    Please login as a buyer to place orders
                  </p>
                </div>
              ) : user?.role !== 'buyer' ? (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800 text-center">
                    Only buyers can place orders. Please login with a buyer account.
                  </p>
                </div>
              ) : user?._id?.toString() === wasteItem.seller?._id?.toString() ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    You cannot buy your own listing
                  </p>
                </div>
              ) : wasteItem.status !== 'active' ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    This listing is currently {wasteItem.status} and not available for order.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="w-full btn-primary py-3 text-lg font-semibold"
                  >
                    Buy Now
                  </button>
                  
                  {wasteItem.price?.priceType === 'bids' && (
                    <Link
                      to={`/bids/listing/${wasteItem._id}`}
                      className="w-full btn-outline py-3 text-center block"
                    >
                      Place Bid
                    </Link>
                  )}
                  
                  <button
                    onClick={handleExpressInterest}
                    className="w-full btn-outline py-3"
                    disabled={expressInterestMutation.isLoading}
                  >
                    {expressInterestMutation.isLoading ? 'Expressing...' : 'Express Interest'}
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Listing Stats</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span>{wasteItem.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interested Buyers:</span>
                    <span>{wasteItem.interestedBuyers?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Listed:</span>
                    <span>{new Date(wasteItem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Modal */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={orderData.quantity.amount}
                      onChange={(e) => setOrderData(prev => ({
                        ...prev,
                        quantity: { ...prev.quantity, amount: e.target.value }
                      }))}
                      placeholder="Amount"
                      className="input flex-1"
                      max={wasteItem.quantity.amount}
                    />
                    <select
                      value={orderData.quantity.unit}
                      onChange={(e) => setOrderData(prev => ({
                        ...prev,
                        quantity: { ...prev.quantity, unit: e.target.value }
                      }))}
                      className="input"
                    >
                      <option value={wasteItem.quantity.unit}>{wasteItem.quantity.unit}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Method
                  </label>
                  <select
                    value={orderData.delivery.method}
                    onChange={(e) => setOrderData(prev => ({
                      ...prev,
                      delivery: { ...prev.delivery, method: e.target.value }
                    }))}
                    className="input"
                  >
                    <option value="pickup">Pickup</option>
                    {wasteItem.logistics.deliveryAvailable && (
                      <option value="delivery">Delivery</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={orderData.paymentMethod}
                    onChange={(e) => setOrderData(prev => ({
                      ...prev,
                      paymentMethod: e.target.value
                    }))}
                    className="input"
                  >
                    <option value="razorpay">💳 Razorpay (UPI/Card/Netbanking)</option>
                    <option value="stripe">💳 Stripe (International Cards)</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="cash_on_delivery">💰 Cash on Delivery</option>
                  </select>
                  {orderData.paymentMethod === 'razorpay' && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Secure payment via Razorpay - UPI, Cards, Netbanking supported
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={orderData.notes}
                    onChange={(e) => setOrderData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    placeholder="Any special requirements or notes..."
                    className="input"
                    rows={3}
                  />
                </div>

                {/* Price Calculation */}
                {orderData.quantity.amount && parseFloat(orderData.quantity.amount) > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">
                          {orderData.quantity.amount} {orderData.quantity.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per {wasteItem.quantity.unit}:</span>
                        <span className="font-medium">₹{wasteItem.price.perUnit}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-lg text-primary-600">
                          ₹{(parseFloat(orderData.quantity.amount || 0) * wasteItem.price.perUnit).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={createOrderMutation.isLoading || !orderData.quantity.amount}
                  className="flex-1 btn-primary"
                >
                  {createOrderMutation.isLoading ? 'Creating...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteDetail;
