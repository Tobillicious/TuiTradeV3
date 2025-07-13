// Neighbourhoods Page - Discover and Join Local Communities in Aotearoa
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Star, 
  Search, 
  Filter,
  Home,
  ChevronRight,
  TrendingUp,
  Heart,
  MessageCircle,
  Plus,
  Globe,
  Award,
  Map
} from 'lucide-react';
import neighbourhoodService, { NZ_NEIGHBOURHOODS, NEIGHBOURHOOD_TYPES, NEIGHBOURHOOD_ACTIVITIES } from '../../lib/neighbourhoodSystem';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';

const NeighbourhoodsPage = ({ onNavigate, currentUser }) => {
  const { getText } = useTeReo();
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [userNeighbourhood, setUserNeighbourhood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);
  const [joinedNeighbourhoods, setJoinedNeighbourhoods] = useState([]);

  // Load user's current neighbourhood and nearby options
  const loadNeighbourhoods = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Get user's current neighbourhood
      const userLocation = currentUser.location || { city: 'Auckland', suburb: 'CBD' };
      const currentNeighbourhood = await neighbourhoodService.getUserNeighbourhood(currentUser.uid, userLocation);
      setUserNeighbourhood(currentNeighbourhood);

      // Get nearby neighbourhoods
      const nearby = await neighbourhoodService.getNearbyNeighbourhoods(userLocation);
      setNeighbourhoods(nearby);

      // Get user's joined neighbourhoods
      setJoinedNeighbourhoods(currentUser.neighbourhoods || []);
    } catch (error) {
      console.error('Error loading neighbourhoods:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadNeighbourhoods();
  }, [loadNeighbourhoods]);

  // Filter neighbourhoods based on search and region
  const filteredNeighbourhoods = neighbourhoods.filter(neighbourhood => {
    const matchesSearch = neighbourhood.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         neighbourhood.maoriName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         neighbourhood.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || neighbourhood.region.toLowerCase() === selectedRegion.toLowerCase();
    
    return matchesSearch && matchesRegion;
  });

  // Join neighbourhood handler
  const handleJoinNeighbourhood = async (neighbourhoodId) => {
    try {
      const success = await neighbourhoodService.joinNeighbourhood(neighbourhoodId, currentUser.uid);
      if (success) {
        setJoinedNeighbourhoods(prev => [...prev, neighbourhoodId]);
        // Show success message
      }
    } catch (error) {
      console.error('Error joining neighbourhood:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Discovering your local community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
              <Home size={16} className="mr-2" />
              Home
            </button>
            <ChevronRight size={16} className="mx-2" />
            <button onClick={() => onNavigate('community-landing')} className="hover:text-green-600">
              Community
            </button>
            <ChevronRight size={16} className="mx-2" />
            <span className="font-semibold text-gray-700">Neighbourhoods</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <TeReoText english="Local Neighbourhoods" teReoKey="neighbourhoods" />
              </h1>
              <p className="text-gray-600">
                Kia ora! Connect with your local community across Aotearoa
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button
                onClick={() => onNavigate('create-neighbourhood')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="mr-2" size={16} />
                Start a Neighbourhood
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your Current Neighbourhood */}
        {userNeighbourhood && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-8 text-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{NEIGHBOURHOOD_TYPES[userNeighbourhood.type]?.icon || '🏘️'}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{userNeighbourhood.name}</h2>
                    <p className="text-green-100">{userNeighbourhood.maoriName}</p>
                  </div>
                </div>
                <p className="text-green-100 mb-4">{userNeighbourhood.description}</p>
                <div className="flex flex-wrap gap-2">
                  {userNeighbourhood.features?.map((feature) => (
                    <span key={feature} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onNavigate('neighbourhood-detail', { id: userNeighbourhood.id })}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                View Community
              </button>
            </div>
          </motion.div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search neighbourhoods, suburbs, or regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="all">All Regions</option>
                {Object.values(NZ_NEIGHBOURHOODS).map((region) => (
                  <option key={region.region} value={region.region}>
                    {region.region} ({region.maoriName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Neighbourhood Activity Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Can Do in Your Neighbourhood</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(NEIGHBOURHOOD_ACTIVITIES).map(([key, activity]) => (
              <motion.div
                key={key}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-4">{activity.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h3>
                <p className="text-sm text-green-600 mb-2">{activity.maoriName}</p>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                <div className="flex flex-wrap gap-2">
                  {activity.features.map((feature) => (
                    <span key={feature} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Neighbourhoods Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Discover Neighbourhoods Near You
            </h2>
            <button
              onClick={() => onNavigate('neighbourhood-map')}
              className="text-green-600 hover:text-green-700 font-semibold flex items-center"
            >
              <Map className="mr-2" size={16} />
              View on Map
            </button>
          </div>

          {filteredNeighbourhoods.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <Globe className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No neighbourhoods found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or explore different regions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNeighbourhoods.map((neighbourhood) => (
                <motion.div
                  key={neighbourhood.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">
                          {NEIGHBOURHOOD_TYPES[neighbourhood.type]?.icon || '🏘️'}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{neighbourhood.name}</h3>
                          <p className="text-sm text-green-600">{neighbourhood.maoriName}</p>
                          <p className="text-xs text-gray-500">{neighbourhood.region}</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {neighbourhood.distance?.toFixed(1)} km
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{neighbourhood.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {neighbourhood.features?.slice(0, 3).map((feature) => (
                        <span key={feature} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                          {feature}
                        </span>
                      ))}
                      {neighbourhood.features?.length > 3 && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                          +{neighbourhood.features.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users size={14} className="mr-1" />
                        <span>{Math.floor(Math.random() * 500) + 100} members</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        <span>{Math.floor(Math.random() * 50) + 10} active today</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onNavigate('neighbourhood-detail', { id: neighbourhood.id })}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Explore
                      </button>
                      {!joinedNeighbourhoods.includes(neighbourhood.id) ? (
                        <button
                          onClick={() => handleJoinNeighbourhood(neighbourhood.id)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Join
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center justify-center"
                        >
                          <Award size={14} className="mr-1" />
                          Joined
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Can't Find Your Neighbourhood?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Be the first to start a community in your area! Connect with your neighbours, 
            share local knowledge, and build the community spirit that makes Aotearoa special.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('create-neighbourhood')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Your Neighbourhood
            </button>
            <button
              onClick={() => onNavigate('neighbourhood-request')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Request New Area
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeighbourhoodsPage;