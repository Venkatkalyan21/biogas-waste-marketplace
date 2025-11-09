import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Settings,
  Leaf,
  Search,
  Bell
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/waste?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                BioWaste<span className="text-primary-600">Market</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePath('/') ? 'text-primary-600 bg-primary-50' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/waste"
              className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePath('/waste') ? 'text-primary-600 bg-primary-50' : ''
              }`}
            >
              Browse Waste
            </Link>
            <Link
              to="/businesses"
              className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePath('/businesses') ? 'text-primary-600 bg-primary-50' : ''
              }`}
            >
              Businesses
            </Link>
            <Link
              to="/about"
              className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePath('/about') ? 'text-primary-600 bg-primary-50' : ''
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePath('/contact') ? 'text-primary-600 bg-primary-50' : ''
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search waste listings..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-waste-listing"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  List Waste
                </Link>
                
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>{user?.firstName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      {user?.userType === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Admin</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-outline px-4 py-2 text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <form onSubmit={handleSearch} className="px-3 py-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search waste listings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-6 top-3.5 h-5 w-5 text-gray-400" />
            </form>
            
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/waste"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Waste
            </Link>
            <Link
              to="/businesses"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Businesses
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-waste-listing"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 bg-primary-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  List Waste
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {user?.userType === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 bg-primary-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
