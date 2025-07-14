// Neighbourhood Detail Page - Local Community Hub
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Star, 
  MessageCircle,
  TrendingUp,
  Heart,
  Share2,
  Bell,
  Settings,
  Plus,
  Filter,
  Clock,
  Eye,
  ChevronDown,
  Home,
  ChevronRight,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import neighbourhoodService, { NEIGHBOURHOOD_ACTIVITIES } from '../../lib/neighbourhoodSystem';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import ItemCard from '../ui/ItemCard';

const NeighbourhoodDetailPage = () => {
    const { neighbourhoodId } = useParams();
    const navigate = useNavigate();
    const { onWatchToggle, watchedItems = [], onAddToCart, cartItems = [], currentUser } = useAppContext() || {};
    
    const handleItemClick = (item) => {
        navigate(`/item/${item.id}`);
    };
  const { getText } = useTeReo();
  const [neighbourhood, setNeighbourhood] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [localListings, setLocalListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Load neighbourhood data
  const loadNeighbourhood = useCallback(async () => {
    if (!neighbourhoodId) return;
    
    setLoading(true);
    try {
      // Mock neighbourhood data based on ID
      const mockNeighbourhood = {
        id: neighbourhoodId,
        name: 'Ponsonby & Grey Lynn',
        maoriName: 'Poneke me Kereipini',
        description: 'Vibrant inner-city neighbourhood known for its cafes, galleries, and community spirit',
        type: 'urban-central',
        region: 'Auckland',
        suburbs: ['Ponsonby', 'Grey Lynn', 'Freemans Bay'],
        features: ['cafes', 'galleries', 'markets', 'parks'],
        memberCount: 847,
        guidelines: {
          title: 'Ponsonby Community Guidelines',
          rules: [
            'Be respectful to all neighbours',
            'Support local businesses when possible', 
            'Keep community spaces clean and welcoming',
            'Share local knowledge and recommendations'
          ]
        },
        moderators: ['user1', 'user2'],
        stats: {
          totalListings: 156,
          totalEvents: 23,
          totalMembers: 847,
          activityScore: 92
        }
      };

      setNeighbourhood(mockNeighbourhood);

      // Load neighbourhood feed
      const feed = await neighbourhoodService.getNeighbourhoodFeed(neighbourhoodId);
      setActivities(feed);

      // Mock local listings
      const mockListings = [
        {
          id: 'local1',
          title: 'Vintage Cafe Chair',
          price: 45,
          photos: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300'],
          seller: 'Emma K.',
          location: 'Ponsonby',
          distance: '0.2km',
          pickup: 'Local pickup available'
        },
        {
          id: 'local2', 
          title: 'Kids Bicycle - Perfect Condition',
          price: 120,
          photos: ['https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=300'],
          seller: 'David M.',
          location: 'Grey Lynn',
          distance: '0.5km',
          pickup: 'Can deliver within neighbourhood'
        }
      ];
      setLocalListings(mockListings);

      // Check if user is member
      setIsMember(currentUser && mockNeighbourhood.moderators.includes(currentUser.uid));

    } catch (error) {
      console.error('Error loading neighbourhood:', error);
    } finally {
      setLoading(false);
    }
  }, [neighbourhoodId, currentUser]);

  useEffect(() => {
    loadNeighbourhood();
  }, [loadNeighbourhood]);

  // Tab content components
  const renderFeedContent = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Plus className="text-green-600 mb-2" size={24} />
            <span className="text-sm font-medium">List Item</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Calendar className="text-blue-600 mb-2" size={24} />
            <span className="text-sm font-medium">Create Event</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <MessageCircle className="text-purple-600 mb-2" size={24} />
            <span className="text-sm font-medium">Ask Question</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <Heart className="text-orange-600 mb-2" size={24} />
            <span className="text-sm font-medium">Recommend</span>
          </button>
        </div>
      </div>

      {/* Activity Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Filter size={16} className="text-gray-500" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Activity</option>
            <option value="listings">Local Listings</option>
            <option value="events">Events</option>
            <option value="discussions">Discussions</option>
            <option value="recommendations">Recommendations</option>
          </select>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                {activity.author?.charAt(0) || 'A'}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{activity.author || 'Anonymous'}</span>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-sm">2 hours ago</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {activity.type === 'listing' ? 'Listed Item' : 'Community Post'}
                  </span>
                </div>
                <p className="text-gray-800 mb-3">
                  {activity.type === 'listing' 
                    ? `Listed "${activity.title}" for $${activity.price}`
                    : 'Shared a community update'
                  }
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button className="flex items-center space-x-1 hover:text-green-600">
                    <Heart size={16} />
                    <span>{Math.floor(Math.random() * 20) + 5}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <MessageCircle size={16} />
                    <span>{Math.floor(Math.random() * 10) + 2}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-purple-600">
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderListingsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Local Marketplace</h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
          Post Item
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {localListings.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
          >
            <div className="aspect-square overflow-hidden">
              <img 
                src={item.photos[0]} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-green-600 font-bold text-lg mb-2">${item.price}</p>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center">
                  <Users size={14} className="mr-1" />
                  <span>{item.seller}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  <span>{item.location} • {item.distance}</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle size={14} className="mr-1" />
                  <span>{item.pickup}</span>
                </div>
              </div>
              <button 
                onClick={() => handleItemClick(item)}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderEventsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Community Events</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Create Event
        </button>
      </div>

      <div className="space-y-4">
        {[
          {
            title: 'Ponsonby Community Market',
            date: 'Saturday, Dec 16',
            time: '9:00 AM - 3:00 PM',
            location: 'Ponsonby Central',
            attendees: 45,
            type: 'market'
          },
          {
            title: 'Grey Lynn Park Cleanup',
            date: 'Sunday, Dec 17', 
            time: '10:00 AM - 12:00 PM',
            location: 'Grey Lynn Park',
            attendees: 23,
            type: 'community-service'
          }
        ].map((event, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Join Event
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading neighbourhood...</p>
        </div>
      </div>
    );
  }

  if (!neighbourhood) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Neighbourhood not found</h2>
          <p className="text-gray-500 mb-4">The neighbourhood you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/neighbourhoods')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Neighbourhoods
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <button onClick={() => navigate('/')} className="hover:text-green-600 flex items-center">
              <Home size={16} className="mr-2" />
              Home
            </button>
            <ChevronRight size={16} className="mx-2" />
            <button onClick={() => navigate('/neighbourhoods')} className="hover:text-green-600">
              Neighbourhoods
            </button>
            <ChevronRight size={16} className="mx-2" />
            <span className="font-semibold text-gray-700">{neighbourhood.name}</span>
          </div>

          {/* Neighbourhood Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">🏘️</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{neighbourhood.name}</h1>
                  <p className="text-green-600 text-lg">{neighbourhood.maoriName}</p>
                  <p className="text-gray-600">{neighbourhood.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  <span>{neighbourhood.suburbs.join(', ')}</span>
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{neighbourhood.memberCount} members</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp size={16} className="mr-1" />
                  <span>Activity Score: {neighbourhood.stats.activityScore}/100</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {neighbourhood.features.map((feature) => (
                  <span key={feature} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                {!isMember ? (
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    Join Neighbourhood
                  </button>
                ) : (
                  <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <Award size={16} className="mr-2" />
                    <span className="font-medium">Member</span>
                  </div>
                )}
                <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center">
                  <Bell size={16} className="mr-2" />
                  Follow
                </button>
                <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center">
                  <Share2 size={16} className="mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {[
                { id: 'feed', label: 'Community Feed', icon: MessageCircle },
                { id: 'listings', label: 'Local Marketplace', icon: Star },
                { id: 'events', label: 'Events', icon: Calendar },
                { id: 'members', label: 'Members', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'feed' && renderFeedContent()}
            {activeTab === 'listings' && renderListingsContent()}
            {activeTab === 'events' && renderEventsContent()}
            {activeTab === 'members' && (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Members page coming soon</h3>
                <p className="text-gray-500">Connect with your neighbours and see who's in your community</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NeighbourhoodDetailPage;