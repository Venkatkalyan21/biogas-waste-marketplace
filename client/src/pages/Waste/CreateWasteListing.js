import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { wasteAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  X
} from 'lucide-react';

const CreateWasteListing = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cameraInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm();

  const [isLocating, setIsLocating] = useState(false);
  const coords = watch('location.coordinates');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      setImages(prev => [...prev, ...acceptedFiles]);
    },
  });

  const createListingMutation = useMutation(
    (formData) => wasteAPI.createWasteListing(formData),
    {
      onSuccess: () => {
        image.png;
        console.log('✅ Waste listing created successfully!');
        toast.success('Waste listing created successfully!');

        // Invalidate all waste listing queries to force fresh data
        queryClient.invalidateQueries(['wasteListings']);
        
        // Small delay to ensure backend has finished processing
        setTimeout(() => {
          console.log('✅ Navigating to /waste');
          navigate('/waste');
        }, 500);
      },
      onError: (error) => {
        console.error('Create listing error:', error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.errors?.[0]?.message || 
                            error.message || 
                            'Failed to create waste listing';
        toast.error(errorMessage);
        setIsSubmitting(false);
      },
    }
  );

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Prefill availability with sensible defaults
    const today = new Date();
    const plusTwo = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    setValue('availability.startDate', today.toISOString().split('T')[0]);
    setValue('availability.endDate', plusTwo.toISOString().split('T')[0]);

    // Prefill currency and negotiable
    setValue('price.currency', 'INR');
    setValue('price.negotiable', true);

    // Prefill last location from localStorage if present
    try {
      const savedLoc = JSON.parse(localStorage.getItem('last_location') || 'null');
      if (savedLoc?.address) {
        setValue('location.address.city', savedLoc.address.city || '');
        setValue('location.address.state', savedLoc.address.state || '');
        setValue('location.address.country', savedLoc.address.country || 'USA');
      }
      if (savedLoc?.coordinates) {
        setValue('location.coordinates.latitude', savedLoc.coordinates.latitude || '');
        setValue('location.coordinates.longitude', savedLoc.coordinates.longitude || '');
      }
    } catch {}
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Build form data object - react-hook-form handles nested paths correctly
      const formDataObj = {
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        subcategory: data.subcategory || '',
        wasteType: data.wasteType || '',
        quantity: {
          amount: parseFloat(data['quantity.amount'] || data.quantity?.amount || 0),
          unit: data['quantity.unit'] || data.quantity?.unit || 'kg'
        },
        price: {
          perUnit: parseFloat(data['price.perUnit'] || data.price?.perUnit || 0),
          currency: data['price.currency'] || data.price?.currency || 'INR',
          negotiable: data['price.negotiable'] !== undefined ? data['price.negotiable'] : (data.price?.negotiable !== undefined ? data.price.negotiable : true)
        },
        location: {
          address: {
            street: data['location.address.street'] || data.location?.address?.street || '',
            city: data['location.address.city'] || data.location?.address?.city || '',
            state: data['location.address.state'] || data.location?.address?.state || '',
            zipCode: data['location.address.zipCode'] || data.location?.address?.zipCode || '',
            country: data['location.address.country'] || data.location?.address?.country || 'USA'
          },
          coordinates: {
            latitude: data['location.coordinates.latitude'] ? parseFloat(data['location.coordinates.latitude']) : (data.location?.coordinates?.latitude ? parseFloat(data.location.coordinates.latitude) : undefined),
            longitude: data['location.coordinates.longitude'] ? parseFloat(data['location.coordinates.longitude']) : (data.location?.coordinates?.longitude ? parseFloat(data.location.coordinates.longitude) : undefined)
          }
        },
        availability: {
          startDate: data['availability.startDate'] || data.availability?.startDate || new Date().toISOString().split('T')[0],
          endDate: data['availability.endDate'] || data.availability?.endDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          frequency: data['availability.frequency'] || data.availability?.frequency || 'one_time'
        },
        quality: {
          condition: data['quality.condition'] || data.quality?.condition || '',
          moistureContent: data['quality.moistureContent'] ? parseFloat(data['quality.moistureContent']) : (data.quality?.moistureContent ? parseFloat(data.quality.moistureContent) : undefined),
          contaminationLevel: data['quality.contaminationLevel'] || data.quality?.contaminationLevel || 'low'
        },
        targetMarket: data.targetMarket || 'both'
      };

      // Validation
      if (!formDataObj.title || formDataObj.title.trim().length < 5) {
        toast.error('Title must be at least 5 characters');
        setIsSubmitting(false);
        return;
      }
      if (!formDataObj.description || formDataObj.description.trim().length < 10) {
        toast.error('Description must be at least 10 characters');
        setIsSubmitting(false);
        return;
      }
      if (!formDataObj.quantity.amount || formDataObj.quantity.amount <= 0) {
        toast.error('Please enter a valid quantity greater than 0');
        setIsSubmitting(false);
        return;
      }
      if (!formDataObj.price.perUnit || formDataObj.price.perUnit <= 0) {
        toast.error('Please enter a valid price greater than 0');
        setIsSubmitting(false);
        return;
      }
      if (!formDataObj.location.address.city || formDataObj.location.address.city.trim().length === 0) {
        toast.error('City is required');
        setIsSubmitting(false);
        return;
      }
      if (!formDataObj.quality.condition) {
        toast.error('Please select a condition');
        setIsSubmitting(false);
        return;
      }

      // Save last used location
      try {
        localStorage.setItem('last_location', JSON.stringify({
          address: formDataObj.location.address,
          coordinates: formDataObj.location.coordinates
        }));
      } catch {}

      const formData = new FormData();
      formData.append('data', JSON.stringify(formDataObj));

      // Add images
      images.forEach((image) => {
        formData.append('images', image);
      });

      await createListingMutation.mutateAsync(formData);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setValue('location.coordinates.latitude', latitude);
        setValue('location.coordinates.longitude', longitude);
        toast.success('Location captured');
        setIsLocating(false);
      },
      () => {
        toast.error('Unable to retrieve your location');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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

  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'tons', label: 'Tons' },
    { value: 'pounds', label: 'Pounds (lbs)' },
    { value: 'cubic_meters', label: 'Cubic Meters' }
  ];

  const frequencies = [
    { value: 'one_time', label: 'One Time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Waste Listing</h1>
          <p className="text-gray-600 mt-2">
            List your fruit and vegetable waste for biogas production
          </p>
        </div>

        {/* Conditional rendering based on user role */}
        {!isAuthenticated || user?.role !== 'supplier' ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Access Denied!</strong>
            <span className="block sm:inline"> Only suppliers can create waste listings. Please register as a supplier or login with a supplier account to create listings.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 5,
                      message: 'Title must be at least 5 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Title cannot exceed 100 characters',
                    },
                  })}
                  type="text"
                  className="input"
                  placeholder="e.g., Fresh Vegetable Peels for Biogas"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters',
                    },
                    maxLength: {
                      value: 1000,
                      message: 'Description cannot exceed 1000 characters',
                    },
                  })}
                  rows={4}
                  className="input"
                  placeholder="Describe your waste product, including any relevant details about quality, source, etc."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="input"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <input
                    {...register('subcategory', { required: 'Subcategory is required' })}
                    type="text"
                    className="input"
                    placeholder="e.g., Apple peels, Carrot tops"
                  />
                  {errors.subcategory && (
                    <p className="mt-1 text-sm text-red-600">{errors.subcategory.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waste Type *
                </label>
                <select
                  {...register('wasteType', { required: 'Waste type is required' })}
                  className="input"
                >
                  <option value="">Select waste type</option>
                  {wasteTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.wasteType && (
                  <p className="mt-1 text-sm text-red-600">{errors.wasteType.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quantity and Price */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quantity & Price</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Amount *
                  </label>
                  <input
                    {...register('quantity.amount', {
                      required: 'Quantity amount is required',
                      min: {
                        value: 0,
                        message: 'Quantity must be positive',
                      },
                    })}
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="100"
                  />
                  {errors.quantity?.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity.amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    {...register('quantity.unit', { required: 'Unit is required' })}
                    className="input"
                  >
                    <option value="">Select unit</option>
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                  {errors.quantity?.unit && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity.unit.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      {...register('price.perUnit', {
                        required: 'Price is required',
                        min: {
                          value: 0,
                          message: 'Price must be positive',
                        },
                      })}
                      type="number"
                      step="0.01"
                      className="input pl-8"
                      placeholder="10.00"
                    />
                  </div>
                  {errors.price?.perUnit && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.perUnit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    {...register('price.currency')}
                    className="input"
                    defaultValue="INR"
                  >
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  {...register('price.negotiable')}
                  type="checkbox"
                  id="negotiable"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="negotiable" className="ml-2 block text-sm text-gray-900">
                  Price is negotiable
                </label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              <button
                type="button"
                onClick={useMyLocation}
                className="btn-outline px-4 py-2 text-sm"
                disabled={isLocating}
              >
                {isLocating ? 'Detecting…' : 'Use my location'}
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  {...register('location.address.city', { required: 'City is required' })}
                  type="text"
                  className="input"
                  placeholder="New York"
                />
                {errors.location?.address?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.address.city.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    {...register('location.address.street')}
                    type="text"
                    className="input"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    {...register('location.address.state')}
                    type="text"
                    className="input"
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    {...register('location.address.zipCode')}
                    type="text"
                    className="input"
                    placeholder="10001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    {...register('location.address.country')}
                    type="text"
                    className="input"
                    placeholder="USA"
                    defaultValue="USA"
                  />
                </div>
              </div>

              {/* Coordinates preview (read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude (auto)
                  </label>
                  <input
                    {...register('location.coordinates.latitude')}
                    type="number"
                    step="any"
                    className="input"
                    placeholder="e.g., 12.9716"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude (auto)
                  </label>
                  <input
                    {...register('location.coordinates.longitude')}
                    type="number"
                    step="any"
                    className="input"
                    placeholder="e.g., 77.5946"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Availability</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    {...register('availability.startDate', { required: 'Start date is required' })}
                    type="date"
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.availability?.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.availability.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    {...register('availability.endDate', { required: 'End date is required' })}
                    type="date"
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.availability?.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.availability.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  {...register('availability.frequency')}
                  className="input"
                  defaultValue="one_time"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quality */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quality Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  {...register('quality.condition', { required: 'Condition is required' })}
                  className="input"
                >
                  <option value="">Select condition</option>
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
                {errors.quality?.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.quality.condition.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moisture Content (%)
                  </label>
                  <input
                    {...register('quality.moistureContent', {
                      min: {
                        value: 0,
                        message: 'Moisture content must be between 0 and 100',
                      },
                      max: {
                        value: 100,
                        message: 'Moisture content must be between 0 and 100',
                      },
                    })}
                    type="number"
                    step="0.1"
                    className="input"
                    placeholder="75.5"
                  />
                  {errors.quality?.moistureContent && (
                    <p className="mt-1 text-sm text-red-600">{errors.quality.moistureContent.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contamination Level
                  </label>
                  <select
                    {...register('quality.contaminationLevel')}
                    className="input"
                    defaultValue="low"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Images</h2>
            
            <div className="space-y-4">
              <div className="flex justify-end">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImages(prev => [...prev, e.target.files[0]]);
                      toast.success('Photo added');
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-outline px-4 py-2 text-sm"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  Use camera
                </button>
              </div>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-colors"
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag & drop images here, or click to select files
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 5MB (max 5 files)
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-outline px-6 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-6 py-3"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Listing...
                </div>
              ) : (
                'Create Listing'
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default CreateWasteListing;
