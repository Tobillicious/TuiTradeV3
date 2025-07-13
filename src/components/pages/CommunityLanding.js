import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Heart, 
  Star,
  Home,
  Globe,
  Award,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

const CommunityLanding = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Community
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-2"
          >
            Kia ora! Connect with other members of the TuiTrade community
          </motion.p>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-green-100 mb-8 italic"
          >
            Whakatōhea - Building community spirit across Aotearoa
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={() => onNavigate('neighbourhoods')}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Explore Neighbourhoods
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Join Discussions
            </button>
          </motion.div>
        </div>
      </div>

      {/* Community Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect with Your Community</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From local neighbourhoods to special interest groups, find your place in the TuiTrade whānau
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Neighbourhoods Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onNavigate('neighbourhoods')}
          >
            <div className="text-4xl mb-4">🏘️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Local Neighbourhoods</h3>
            <p className="text-sm text-green-600 mb-3">Taiao - Your Local Area</p>
            <p className="text-gray-600 mb-4">
              Connect with people in your area. Share local knowledge, organize events, and build community spirit.
            </p>
            <div className="flex items-center text-green-600 font-medium">
              <span>Explore Neighbourhoods</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </motion.div>

          {/* Interest Groups */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Interest Groups</h3>
            <p className="text-sm text-purple-600 mb-3">Rōpū Taonga - Special Interests</p>
            <p className="text-gray-600 mb-4">
              Join groups based on your hobbies, interests, and passions. From vintage collecting to sustainable living.
            </p>
            <div className="flex items-center text-purple-600 font-medium">
              <span>Browse Groups</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </motion.div>

          {/* Community Events */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Events</h3>
            <p className="text-sm text-blue-600 mb-3">Kaupapa Hapori - Local Events</p>
            <p className="text-gray-600 mb-4">
              Discover local markets, meetups, and community gatherings happening near you.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>View Events</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Community at a Glance</h3>
            <p className="text-green-100">Growing stronger together across Aotearoa</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-green-100 text-sm">Active Neighbourhoods</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">2.5k+</div>
              <div className="text-green-100 text-sm">Community Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">150+</div>
              <div className="text-green-100 text-sm">Monthly Events</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-green-100 text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Values</h3>
            <p className="text-gray-600">Our principles for building a strong, inclusive community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-green-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Manaakitanga</h4>
              <p className="text-sm text-gray-600">Hospitality and care for others</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Whakatōhea</h4>
              <p className="text-sm text-gray-600">Building community spirit</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-purple-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Rangatiratanga</h4>
              <p className="text-sm text-gray-600">Leadership and responsibility</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-orange-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Kaitiakitanga</h4>
              <p className="text-sm text-gray-600">Guardianship of our environment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start by exploring neighbourhoods near you or joining community discussions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate('neighbourhoods')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Find Your Neighbourhood
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Browse Discussions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLanding;