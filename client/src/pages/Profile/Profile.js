import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Edit,
  Save,
  X,
  Shield,
  Star
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      bio: user?.profile?.bio || '',
      website: user?.profile?.website || '',
      businessInfo: {
        companyName: user?.businessInfo?.companyName || '',
        businessType: user?.businessInfo?.businessType || '',
        registrationNumber: user?.businessInfo?.registrationNumber || '',
        taxId: user?.businessInfo?.taxId || '',
        address: {
          street: user?.businessInfo?.address?.street || '',
          city: user?.businessInfo?.address?.city || '',
          state: user?.businessInfo?.address?.state || '',
          zipCode: user?.businessInfo?.address?.zipCode || '',
          country: user?.businessInfo?.address?.country || 'USA'
        }
      }
    }
  });

  const updateProfileMutation = useMutation(
    (profileData) => authAPI.updateProfile(profileData),
    {
      onSuccess: (response) => {
        toast.success('Profile updated successfully!');
        updateUser(response.data.user);
        setIsEditing(false);
        queryClient.invalidateQueries('user');
      },
      onError: (error) => {
        toast.error('Failed to update profile');
      },
    }
  );

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'grocery', label: 'Grocery Store' },
    { value: 'farm', label: 'Farm' },
    { value: 'food_processor', label: 'Food Processor' },
    { value: 'biogas_plant', label: 'Biogas Plant' },
    { value: 'other', label: 'Other' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-gray-600 capitalize">{user.userType}</p>
                  {user.verification?.isVerified && (
                    <div className="flex items-center text-sm text-green-600 mt-1">
                      <Shield className="h-4 w-4 mr-1" />
                      Verified Account
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center text-sm text-yellow-500">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span>{user.ratings?.average || '0.0'}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    ({user.ratings?.count || 0} reviews)
                  </p>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="btn-outline flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={updateProfileMutation.isLoading}
                      className="btn-primary flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'personal'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Personal Information
                </button>
                {user.userType === 'business' && (
                  <button
                    onClick={() => setActiveTab('business')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'business'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Business Information
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'settings'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Account Settings
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        {...register('firstName', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters',
                          },
                        })}
                        type="text"
                        className="input"
                        disabled={!isEditing}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        {...register('lastName', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters',
                          },
                        })}
                        type="text"
                        className="input"
                        disabled={!isEditing}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="email"
                          value={user.email}
                          className="input"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          {...register('phone', {
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[+]?[\d\s-()]+$/,
                              message: 'Invalid phone number',
                            },
                          })}
                          type="tel"
                          className="input"
                          disabled={!isEditing}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register('bio', {
                        maxLength: {
                          value: 500,
                          message: 'Bio cannot exceed 500 characters',
                        },
                      })}
                      rows={3}
                      className="input"
                      placeholder="Tell us about yourself..."
                      disabled={!isEditing}
                    />
                    {errors.bio && (
                      <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      {...register('website')}
                      type="url"
                      className="input"
                      placeholder="https://yourwebsite.com"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}

              {/* Business Information Tab */}
              {activeTab === 'business' && user.userType === 'business' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          {...register('businessInfo.companyName')}
                          type="text"
                          className="input"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <select
                        {...register('businessInfo.businessType')}
                        className="input"
                        disabled={!isEditing}
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Number
                      </label>
                      <input
                        {...register('businessInfo.registrationNumber')}
                        type="text"
                        className="input"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax ID
                      </label>
                      <input
                        {...register('businessInfo.taxId')}
                        type="text"
                        className="input"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          {...register('businessInfo.address.street')}
                          type="text"
                          className="input"
                          placeholder="Street address"
                          disabled={!isEditing}
                        />
                        <input
                          {...register('businessInfo.address.city')}
                          type="text"
                          className="input"
                          placeholder="City"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          {...register('businessInfo.address.state')}
                          type="text"
                          className="input"
                          placeholder="State"
                          disabled={!isEditing}
                        />
                        <input
                          {...register('businessInfo.address.zipCode')}
                          type="text"
                          className="input"
                          placeholder="ZIP Code"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
                    <div className="space-y-4">
                      <button className="btn-outline w-full text-left">
                        Change Password
                      </button>
                      <button className="btn-outline w-full text-left">
                        Two-Factor Authentication
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Email notifications for new orders
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Email notifications for messages
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Marketing emails
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                    <button className="btn-outline text-red-600 border-red-300 hover:bg-red-100">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
