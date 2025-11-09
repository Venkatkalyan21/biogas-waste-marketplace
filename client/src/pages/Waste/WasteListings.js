import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { wasteAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import {
  Search,
  Filter,
  MapPin,
  Package,
  Eye,
  Heart,
  Star,
  ChevronDown,
  Map,
  List,
  X
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const WasteListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    wasteType: searchParams.get('wasteType') || '',
    condition: searchParams.get('condition') || '',
    targetMarket: searchParams.get('targetMarket') || 'b2c',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India center

  // Build query params from URL search params
  const queryParams = new URLSearchParams(searchParams);
  const page = searchParams.get('page') || '1';
  queryParams.set('page', page);

  const { data: wasteData, isLoading, refetch } = useQuery(
    ['wasteListings', searchParams.toString()],
    async () => {
      console.log('📡 Fetching waste listings with params:', Object.fromEntries(queryParams));
      const response = await wasteAPI.getWasteListings(Object.fromEntries(queryParams));
      // Axios returns { data: {...}, status: 200 }
      // Extract the data property which contains our API response
      console.log('📡 Raw axios response:', response);
      console.log('📡 Response data:', response.data);
      return response.data; // Return just the API response body
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true, // Always refetch when component mounts
      staleTime: 5000, // Consider data stale after 5 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        // Now data is the API response body: { data: { wasteItems: [...], pagination: {...} } }
        const count = data?.data?.wasteItems?.length || 0;
        console.log('✅ Waste listings fetched successfully. Count:', count);
      },
      onError: (error) => {
        console.error('❌ Failed to fetch waste listings:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch waste listings');
      },
    }
  );

  // Extract waste items from response
  // wasteData is now the API response body: { data: { wasteItems: [...], pagination: {...} } }
  const wasteItems = useMemo(() => {
    if (!wasteData) {
      console.log('📦 No wasteData available yet');
      return [];
    }

    console.log('📦 Raw wasteData (API response body):', wasteData);
    console.log('📦 wasteData.data:', wasteData.data);
    console.log('📦 wasteData.data.wasteItems:', wasteData.data?.wasteItems);

    // API response structure: { data: { wasteItems: [...], pagination: {...} } }
    const items = wasteData.data?.wasteItems || [];

    console.log(`📦 Extracted ${items.length} waste items for display`);
    return items;
  }, [wasteData]);

  // No longer needed - react-query now handles refetch automatically on mount

  // Update map center when items with coordinates are loaded
  useEffect(() => {
    if (wasteItems.length > 0 && viewMode === 'map') {
      const itemsWithCoords = wasteItems.filter(
        item => item.location?.coordinates?.latitude && item.location?.coordinates?.longitude
      );
      if (itemsWithCoords.length > 0) {
        const avgLat = itemsWithCoords.reduce((sum, item) => sum + item.location.coordinates.latitude, 0) / itemsWithCoords.length;
        const avgLng = itemsWithCoords.reduce((sum, item) => sum + item.location.coordinates.longitude, 0) / itemsWithCoords.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      }
    }
  }, [wasteItems, viewMode]);

  const categories = [
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'other', label: 'Other' }
  ];

  const wasteTypes = [
    { value: 'organic_waste', label: 'Organic Waste' },
    { value: 'peels', label: 'Peels' },
    { value: 'seeds', label: 'Seeds' },
    { value: 'stems', label: 'Stems' },
    { value: 'leaves', label: 'Leaves' },
    { value: 'spoiled_produce', label: 'Spoiled Produce' },
    { value: 'excess_inventory', label: 'Excess Inventory' },
    { value: 'processing_byproducts', label: 'Processing Byproducts' }
  ];

  const conditions = [
    { value: 'fresh', label: 'Fresh' },
    { value: 'slightly_damaged', label: 'Slightly Damaged' },
    { value: 'spoiled', label: 'Spoiled' },
    { value: 'processed', label: 'Processed' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      subcategory: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      wasteType: '',
      condition: '',
      targetMarket: 'b2c',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchParams({});
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Waste Listings</h1>
            <p className="text-gray-600 text-lg">
              Find fruit and vegetable waste for biogas production
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <List className="h-5 w-5 inline mr-2" />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Map className="h-5 w-5 inline mr-2" />
              Map
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg mb-6 border border-gray-100">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        applyFilters();
                      }
                    }}
                    placeholder="Search waste listings by title, description, or category..."
                    className="input pl-12 pr-4 w-full h-12 text-base border-2 border-gray-200 focus:border-primary-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort */}
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                  applyFilters();
                }}
                className="input"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="views-desc">Most Viewed</option>
              </select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="input"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Type
                    </label>
                    <select
                      value={filters.wasteType}
                      onChange={(e) => handleFilterChange('wasteType', e.target.value)}
                      className="input"
                    >
                      <option value="">All Types</option>
                      {wasteTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={filters.condition}
                      onChange={(e) => handleFilterChange('condition', e.target.value)}
                      className="input"
                    >
                      <option value="">All Conditions</option>
                      {conditions.map(cond => (
                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      placeholder="Enter city"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="0"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price (₹)
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="1000"
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={clearFilters}
                    className="btn-outline"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={applyFilters}
                    className="btn-primary"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading listings...</p>
            </div>
          ) : wasteItems.length > 0 ? (
            <>
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{wasteItems.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">
                    {wasteData?.data?.pagination?.totalItems || wasteItems.length}
                  </span>{' '}
                  results
                </div>
                <button
                  onClick={() => refetch()}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Refresh
                </button>
              </div>

              {/* Map View */}
              {viewMode === 'map' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6" style={{ height: '600px' }}>
                  {GOOGLE_MAPS_API_KEY ? (
                    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={mapCenter}
                        zoom={wasteItems.length === 1 ? 12 : 6}
                      >
                        {wasteItems
                          .filter(item => item.location?.coordinates?.latitude && item.location?.coordinates?.longitude)
                          .map((item) => (
                            <Marker
                              key={item._id}
                              position={{
                                lat: item.location.coordinates.latitude,
                                lng: item.location.coordinates.longitude
                              }}
                              onClick={() => setSelectedMarker(item)}
                            />
                          ))}
                        {selectedMarker && (
                          <InfoWindow
                            position={{
                              lat: selectedMarker.location.coordinates.latitude,
                              lng: selectedMarker.location.coordinates.longitude
                            }}
                            onCloseClick={() => setSelectedMarker(null)}
                          >
                            <div className="p-2 max-w-xs">
                              <h3 className="font-semibold text-gray-900 mb-1">{selectedMarker.title}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{selectedMarker.description}</p>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-bold text-primary-600">
                                  ₹{selectedMarker.price?.perUnit || 0}/{selectedMarker.quantity?.unit || 'kg'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {selectedMarker.quantity?.amount || 0} {selectedMarker.quantity?.unit || 'kg'}
                                </span>
                              </div>
                              <Link
                                to={`/waste/${selectedMarker._id}`}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                View Details →
                              </Link>
                            </div>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    </LoadScript>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center p-6">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Map view requires Google Maps API key</p>
                        <p className="text-sm text-gray-500">Set REACT_APP_GOOGLE_MAPS_API_KEY in your environment</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wasteItems.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                            <Package className="h-16 w-16 text-primary-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.quality?.condition)}`}>
                            {item.quality?.condition ? item.quality.condition.replace(/_/g, ' ').toUpperCase() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1 text-primary-500" />
                            <span className="font-medium">{item.location?.address?.city || 'Location not specified'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Eye className="h-4 w-4 mr-1" />
                            {item.views || 0}
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-primary-600">
                                ₹{item.price?.perUnit || 0}
                              </span>
                              <span className="text-sm text-gray-600">/{item.quantity?.unit || 'kg'}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-700">
                                {item.quantity?.amount || 0} {item.quantity?.unit || 'kg'}
                              </p>
                              <p className="text-xs text-gray-500">Available</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mr-2 flex items-center justify-center text-white font-semibold">
                              {(item.seller?.firstName?.[0] || item.seller?.lastName?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.seller?.firstName || ''} {item.seller?.lastName || 'Seller'}
                              </p>
                              <div className="flex items-center text-yellow-500">
                                <Star className="h-3 w-3 fill-current mr-1" />
                                <span className="text-xs">{item.seller?.ratings?.average || '0.0'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            to={`/waste/${item._id}`}
                            className="flex-1 btn-primary text-center py-2.5 text-sm font-semibold hover:shadow-md transition-shadow"
                          >
                            View Details
                          </Link>
                          <button className="p-2.5 border-2 border-gray-300 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors">
                            <Heart className="h-4 w-4 text-gray-400 hover:text-primary-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {wasteData?.data?.pagination && wasteData.data.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', (wasteData.data.pagination.currentPage - 1).toString());
                        setSearchParams(params);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={wasteData.data.pagination.currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600 text-sm">
                      Page {wasteData.data.pagination.currentPage} of {wasteData.data.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', (wasteData.data.pagination.currentPage + 1).toString());
                        setSearchParams(params);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={wasteData.data.pagination.currentPage === wasteData.data.pagination.totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-lg">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find what you're looking for
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={clearFilters}
                    className="btn-primary px-6 py-3"
                  >
                    Clear Filters
                  </button>
                  <Link
                    to="/create-waste-listing"
                    className="btn-outline px-6 py-3"
                  >
                    Create Listing
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteListings;
