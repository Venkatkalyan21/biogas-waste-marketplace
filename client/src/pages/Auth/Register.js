import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Leaf, Mail, Lock, User, Phone, Building } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('supplier'); // Default to supplier
  const { register: registerUser, googleLogin, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      if (!credentialResponse?.credential) {
        toast.error('No credential received from Google');
        return;
      }
      console.log('Google sign-in attempt for role:', role);
      await googleLogin(credentialResponse.credential, role);
      toast.success('Registration successful!');
    } catch (error) {
      console.error('Google registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Google authentication failed. Please check your configuration.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in failed. Please try again.');
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role, // Use new role field
        businessInfo: data.role === 'supplier' ? {
          companyName: data.companyName,
          businessType: data.businessType,
          registrationNumber: data.registrationNumber,
          taxId: data.taxId,
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country || 'USA'
          }
        } : undefined
      };

      await registerUser(userData);
      toast.success('Registration successful!');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Leaf className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* User Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('supplier')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  role === 'supplier'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <User className="h-6 w-6 text-primary-600 mb-2" />
                <div className="font-medium">Supplier (Farmer/Vendor)</div>
                <div className="text-sm text-gray-600">List waste materials</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  role === 'buyer'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Building className="h-6 w-6 text-primary-600 mb-2" />
                <div className="font-medium">Buyer (Industry)</div>
                <div className="text-sm text-gray-600">Purchase waste materials</div>
              </button>
            </div>
            <input
              type="hidden"
              {...register('role', { required: 'Account role is required' })}
              value={role}
            />
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
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
                autoComplete="given-name"
                className="input mt-1"
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
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
                autoComplete="family-name"
                className="input mt-1"
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[+]?[\d\s-()]+$/,
                      message: 'Invalid phone number',
                    },
                  })}
                  type="tel"
                  autoComplete="tel"
                  className="input pl-10"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Business Information (conditional) */}
          {role === 'supplier' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    {...register('companyName', {
                      required: 'Company name is required for supplier accounts',
                    })}
                    type="text"
                    className="input mt-1"
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                    Business Type
                  </label>
                  <select
                    {...register('businessType', {
                      required: 'Business type is required',
                    })}
                    className="input mt-1"
                  >
                    <option value="">Select business type</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="grocery">Grocery Store</option>
                    <option value="farm">Farm</option>
                    <option value="food_processor">Food Processor</option>
                    <option value="biogas_plant">Biogas Plant</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.businessType && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <input
                    {...register('registrationNumber')}
                    type="text"
                    className="input mt-1"
                    placeholder="Business registration number"
                  />
                </div>

                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                    Tax ID
                  </label>
                  <input
                    {...register('taxId')}
                    type="text"
                    className="input mt-1"
                    placeholder="Tax identification number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    {...register('street')}
                    type="text"
                    className="input mt-1"
                    placeholder="Street address"
                  />
                  <input
                    {...register('city', { required: 'City is required' })}
                    type="text"
                    className="input mt-1"
                    placeholder="City"
                  />
                  <input
                    {...register('state')}
                    type="text"
                    className="input mt-1"
                    placeholder="State"
                  />
                  <input
                    {...register('zipCode')}
                    type="text"
                    className="input mt-1"
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input pl-10 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="agree-terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full btn-primary py-3 text-sm font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            {process.env.REACT_APP_GOOGLE_CLIENT_ID && (
              <div className="mt-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
