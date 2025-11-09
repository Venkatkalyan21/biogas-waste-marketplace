import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  Building,
  MapPin,
  Star,
  Phone,
  Mail,
  Search,
  Filter,
  CheckCircle
} from 'lucide-react';

const BusinessDirectory = () => {
  const [filters, setFilters] = useState({
    businessType: '',
    city: '',
    minRating: ''
  });

  const { data: businessesData, isLoading, error } = useQuery(
    ['businesses', filters],
    () => usersAPI.searchBusinesses(filters),
    {
      onError: (error) => {
        toast.error('Failed to fetch businesses');
      },
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'grocery', label: 'Grocery Store' },
    { value: 'farm', label: 'Farm' },
    { value: 'food_processor', label: 'Food Processor' },
    { value: 'biogas_plant', label: 'Biogas Plant' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Directory</h1>
          <p className="text-gray-600 mt-2">
            Connect with verified businesses in the waste marketplace
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                value={filters.businessType}
                onChange={(e) => handleFilterChange('businessType', e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                {businessTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="input"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading businesses...</p>
          </div>
        ) : businessesData?.data?.users?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessesData.data.users.map((business) => (
              <div key={business._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {business.businessInfo?.companyName || `${business.firstName} ${business.lastName}`}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {business.businessInfo?.businessType || business.userType}
                        </p>
                      </div>
                    </div>
                    {business.verification?.isVerified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {business.businessInfo?.address?.city || 'Location not specified'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{business.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {business.phone}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-yellow-500">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      <span>{business.ratings?.average || '0.0'}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({business.ratings?.count || 0} reviews)
                    </span>
                  </div>

                  {business.profile?.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {business.profile.bio}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      to={`/users/${business._id}`}
                      className="flex-1 btn-primary text-center py-2 text-sm"
                    >
                      View Profile
                    </Link>
                    <button className="flex-1 btn-outline py-2 text-sm">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => setFilters({ businessType: '', city: '', minRating: '' })}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;
