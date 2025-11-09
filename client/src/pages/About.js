import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Globe,
  Users,
  TrendingUp,
  Recycle,
  Target,
  Award,
  CheckCircle
} from 'lucide-react';

const About = () => {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/team/sarah.jpg',
      bio: 'Environmental engineer with 10+ years in waste management and renewable energy.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/team/michael.jpg',
      bio: 'Full-stack developer passionate about building sustainable technology solutions.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Operations',
      image: '/team/emily.jpg',
      bio: 'Supply chain expert focused on circular economy and waste reduction.'
    }
  ];

  const values = [
    {
      icon: <Leaf className="h-8 w-8 text-primary-600" />,
      title: 'Sustainability',
      description: 'We are committed to reducing waste and promoting renewable energy sources.'
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: 'Community',
      description: 'Building a network of businesses and individuals focused on environmental impact.'
    },
    {
      icon: <Target className="h-8 w-8 text-primary-600" />,
      title: 'Innovation',
      description: 'Leveraging technology to create efficient waste management solutions.'
    },
    {
      icon: <Award className="h-8 w-8 text-primary-600" />,
      title: 'Quality',
      description: 'Ensuring high standards for all waste products and marketplace transactions.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Active Users' },
    { number: '500+', label: 'Waste Listings' },
    { number: '50+', label: 'Business Partners' },
    { number: '1000+', label: 'Tons of Waste Recycled' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About BioWaste Market
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
              Transforming waste into renewable energy, one connection at a time. 
              We're building a sustainable future through innovative waste management solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
              >
                Join Our Mission
              </Link>
              <Link
                to="/contact"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
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

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                BioWaste Market is dedicated to creating a sustainable circular economy by connecting 
                waste producers with biogas facilities and other users who can transform organic waste 
                into valuable resources.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe that what one considers waste, another sees as opportunity. By facilitating 
                these connections, we're reducing landfill waste, lowering greenhouse gas emissions, 
                and creating economic value from organic materials.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Environmental Impact</h3>
                    <p className="text-gray-600">Reducing carbon footprint through waste-to-energy conversion</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Economic Value</h3>
                    <p className="text-gray-600">Creating revenue streams from waste materials</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Community Building</h3>
                    <p className="text-gray-600">Connecting businesses in the sustainable economy</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <Globe className="h-32 w-32 text-primary-600 mx-auto mb-6" />
              <p className="text-center text-gray-600 italic">
                "We don't inherit the earth from our ancestors; we borrow it from our children."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to transform waste into value
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                List Your Waste
              </h3>
              <p className="text-gray-600">
                Businesses and individuals list their fruit and vegetable waste with detailed information about quantity, quality, and availability.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Connect & Negotiate
              </h3>
              <p className="text-gray-600">
                Buyers browse listings, express interest, and negotiate prices directly with sellers through our platform.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Transform & Reuse
              </h3>
              <p className="text-gray-600">
                Waste is collected and transformed into biogas, compost, or other valuable products, completing the circular economy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate individuals committed to sustainability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
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
            Become part of our community and start transforming waste into valuable resources today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
            >
              Get Started Now
            </Link>
            <Link
              to="/waste"
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
