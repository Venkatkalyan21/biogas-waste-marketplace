import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Leaf, 
  TrendingUp, 
  Users, 
  Globe, 
  Recycle,
  Search,
  Plus,
  Star,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/waste?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const features = [
    {
      icon: <Leaf className="h-8 w-8 text-primary-600" />,
      title: 'Sustainable Waste Management',
      description: 'Transform fruit and vegetable waste into valuable biogas resources, reducing environmental impact.'
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: 'B2B & B2C Marketplace',
      description: 'Connect businesses and individuals in a comprehensive platform for waste trading.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: 'Economic Benefits',
      description: 'Monetize waste products and create new revenue streams for your business.'
    },
    {
      icon: <Globe className="h-8 w-8 text-primary-600" />,
      title: 'Environmental Impact',
      description: 'Reduce landfill waste and contribute to a cleaner, more sustainable future.'
    },
    {
      icon: <Recycle className="h-8 w-8 text-primary-600" />,
      title: 'Circular Economy',
      description: 'Support the circular economy by turning waste into renewable energy resources.'
    },
    {
      icon: <Search className="h-8 w-8 text-primary-600" />,
      title: 'Easy Discovery',
      description: 'Find the perfect waste suppliers or buyers with our advanced search and filtering system.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Active Users' },
    { number: '500+', label: 'Waste Listings' },
    { number: '50+', label: 'Business Partners' },
    { number: '100%', label: 'Sustainable Impact' }
  ];

  const testimonials = [
    {
      name: 'John Smith',
      role: 'Restaurant Owner',
      company: 'Green Kitchen',
      content: 'BioWaste Market has transformed how we handle our food waste. We now earn revenue while being environmentally responsible.',
      rating: 5
    },
    {
      name: 'Sarah Johnson',
      role: 'Biogas Plant Manager',
      company: 'EcoEnergy Solutions',
      content: 'The platform connects us with reliable waste suppliers. Our biogas production has increased by 40% since joining.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Farm Owner',
      company: 'Organic Harvest Farms',
      content: 'Finally, a marketplace that understands the value of agricultural waste. Great platform with excellent support.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Waste into
              <span className="text-secondary-400"> Renewable Energy</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Connect with businesses and individuals to buy and sell fruit and vegetable waste for biogas production. 
              Join the sustainable revolution today.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for waste listings..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-secondary px-8 py-3 rounded-lg font-semibold"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/waste"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold"
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BioWaste Market?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides comprehensive solutions for waste management and biogas production.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to start your waste trading journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sign Up
              </h3>
              <p className="text-gray-600">
                Create your account as an individual or business user
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                List or Browse
              </h3>
              <p className="text-gray-600">
                List your waste or browse available listings
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Connect & Trade
              </h3>
              <p className="text-gray-600">
                Connect with buyers/sellers and complete transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users transforming waste into value
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join the Sustainable Revolution?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Start transforming waste into renewable energy today. 
            Join our community of environmentally conscious businesses and individuals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
            >
              Get Started Now
              <Plus className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
