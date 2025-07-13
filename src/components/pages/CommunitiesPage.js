// Communities Browse Page - Discover Neighborhoods
// Browse and explore different community pages across New Zealand

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, Filter, MapPin, Users, MessageSquare, 
    Calendar, Star, ChevronRight, Home, Award,
    Zap, Compass, Heart, Map
} from 'lucide-react';
import { 
    collection, query, orderBy, limit, getDocs, 
    where, startAfter 
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { getBilingualText } from '../../lib/nzLocalizationEnhanced';

const CommunitiesPage = ({ onNavigate }) => {
    const { user } = useAuth();
    
    const [communities, setCommunities] = useState([]);
    const [filteredCommunities, setFilteredCommunities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [sortBy, setSortBy] = useState('members'); // members, activity, newest
    const [viewMode, setViewMode] = useState('grid'); // grid, list, map
    const [userCommunity, setUserCommunity] = useState(null);

    const nzRegions = [
        'Auckland', 'Wellington', 'Canterbury', 'Waikato', 
        'Bay of Plenty', 'Otago', 'Manawatu-Wanganui', 
        'Northland', 'Taranaki', 'Hawke\'s Bay', 'Nelson',
        'Southland', 'Gisborne', 'Marlborough', 'Tasman',
        'West Coast'
    ];

    const loadCommunities = useCallback(async () => {
        setIsLoading(true);
        try {
            // Load all communities with basic stats
            const communitiesQuery = query(
                collection(db, 'communities'),
                orderBy('memberCount', 'desc'),
                limit(50)
            );
            
            const snapshot = await getDocs(communitiesQuery);
            const communitiesData = await Promise.all(
                snapshot.docs.map(async (doc) => {
                    const data = { id: doc.id, ...doc.data() };
                    
                    // Get member count and recent activity
                    try {
                        const membersSnapshot = await getDocs(
                            query(collection(db, 'communities', doc.id, 'members'), limit(1))
                        );
                        const discussionsSnapshot = await getDocs(
                            query(
                                collection(db, 'communities', doc.id, 'discussions'),
                                orderBy('createdAt', 'desc'),
                                limit(5)
                            )
                        );
                        
                        return {
                            ...data,
                            actualMemberCount: membersSnapshot.size,
                            recentActivity: discussionsSnapshot.size,
                            lastActive: discussionsSnapshot.docs[0]?.data()?.createdAt?.toDate()
                        };
                    } catch (error) {
                        console.warn('Error loading community stats:', error);
                        return data;
                    }
                })
            );

            setCommunities(communitiesData);
            setFilteredCommunities(communitiesData);

            // Load user's community if they have one
            if (user) {
                try {
                    const userDoc = await getDocs(
                        query(collection(db, 'users'), where('email', '==', user.email))
                    );
                    if (!userDoc.empty) {
                        const userData = userDoc.docs[0].data();
                        if (userData.community) {
                            setUserCommunity(userData.community);
                        }
                    }
                } catch (error) {
                    console.warn('Error loading user community:', error);
                }
            }

        } catch (error) {
            console.error('Error loading communities:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadCommunities();
    }, [loadCommunities]);

    // Filter and sort communities
    useEffect(() => {
        let filtered = [...communities];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(community =>
                community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                community.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                community.region?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply region filter
        if (selectedRegion !== 'all') {
            filtered = filtered.filter(community =>
                community.region === selectedRegion
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'members':
                    return (b.memberCount || 0) - (a.memberCount || 0);
                case 'activity':
                    return (b.recentActivity || 0) - (a.recentActivity || 0);
                case 'newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                default:
                    return 0;
            }
        });

        setFilteredCommunities(filtered);
    }, [communities, searchTerm, selectedRegion, sortBy]);

    const getCommunityStats = (community) => {
        const members = community.memberCount || community.actualMemberCount || 0;
        const activity = community.recentActivity || 0;
        const rating = 4.2 + Math.random() * 0.6; // Simulated rating
        
        return { members, activity, rating };
    };

    const formatTimeAgo = (date) => {
        if (!date) return 'No recent activity';
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Active now';
        if (diffInHours < 24) return `Active ${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Active ${diffInDays}d ago`;
        return 'Quiet this week';
    };

    const CommunityCard = ({ community, featured = false }) => {
        const stats = getCommunityStats(community);
        
        return (
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                    featured ? 'ring-2 ring-green-500 ring-opacity-20' : ''
                }`}
                onClick={() => onNavigate('community', { communityId: community.id })}
            >
                {featured && (
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-t-2xl">
                        <div className="flex items-center text-sm font-medium">
                            <Award className="w-4 h-4 mr-2" />
                            Your Community
                        </div>
                    </div>
                )}

                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                    {community.name}
                                </h3>
                                <p className="text-gray-500 text-sm flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {community.region}
                                </p>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <div className="flex items-center text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                <span className="font-medium">{stats.rating.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{stats.members}</div>
                            <div className="text-xs text-gray-500">Members</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{stats.activity}</div>
                            <div className="text-xs text-gray-500">Posts</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    stats.activity > 3 ? 'bg-green-400' : 
                                    stats.activity > 1 ? 'bg-yellow-400' : 'bg-gray-300'
                                }`}></div>
                                <div className="text-xs text-gray-500">
                                    {stats.activity > 3 ? 'Very Active' : 
                                     stats.activity > 1 ? 'Active' : 'Quiet'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                            {formatTimeAgo(community.lastActive)}
                        </span>
                        <div className="flex items-center text-green-600 group-hover:text-green-700 font-medium">
                            Explore
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-32 bg-gray-200 rounded-2xl"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            {getBilingualText('Discover Communities', 'communities')}
                        </h1>
                        <p className="text-xl text-green-100 mb-2 italic">
                            Kia ora whānau - Find your neighborhood
                        </p>
                        <p className="text-lg md:text-xl mb-8 text-green-100">
                            Connect with neighbors, join local discussions, and discover what's happening in communities across Aotearoa
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <div className="flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                <span>{communities.reduce((sum, c) => sum + (c.memberCount || 0), 0)}+ members</span>
                            </div>
                            <div className="flex items-center">
                                <Home className="w-5 h-5 mr-2" />
                                <span>{communities.length} communities</span>
                            </div>
                            <div className="flex items-center">
                                <Map className="w-5 h-5 mr-2" />
                                <span>All 16 regions</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search communities, cities, or regions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-4">
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="all">All Regions</option>
                                {nzRegions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="members">Most Members</option>
                                <option value="activity">Most Active</option>
                                <option value="newest">Newest</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredCommunities.length} of {communities.length} communities
                        {searchTerm && ` for "${searchTerm}"`}
                        {selectedRegion !== 'all' && ` in ${selectedRegion}`}
                    </div>
                </div>
            </div>

            {/* Communities Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User's Community (if any) */}
                {userCommunity && (
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <Home className="w-6 h-6 mr-2 text-green-600" />
                            Your Community
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <CommunityCard 
                                community={communities.find(c => c.id === userCommunity.id) || userCommunity} 
                                featured={true} 
                            />
                        </div>
                    </motion.div>
                )}

                {/* Featured Communities */}
                {filteredCommunities.length > 0 && (
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                            Most Active Communities
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCommunities
                                .filter(c => c.id !== userCommunity?.id)
                                .slice(0, 3)
                                .map((community) => (
                                    <CommunityCard key={community.id} community={community} />
                                ))
                            }
                        </div>
                    </motion.div>
                )}

                {/* All Communities */}
                {filteredCommunities.length > 3 && (
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <Compass className="w-6 h-6 mr-2 text-blue-500" />
                            All Communities
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCommunities
                                .filter(c => c.id !== userCommunity?.id)
                                .slice(3)
                                .map((community) => (
                                    <CommunityCard key={community.id} community={community} />
                                ))
                            }
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {filteredCommunities.length === 0 && (
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center py-16"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md mx-auto">
                            <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No communities found</h3>
                            <p className="text-gray-500 mb-6">
                                Try adjusting your search or filters to find communities near you.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedRegion('all');
                                    setSortBy('members');
                                }}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Don't see your community?
                        </h2>
                        <p className="text-xl text-green-100 mb-8 italic">
                            Tēnā koe - Be the first to start your neighborhood community!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => onNavigate('create-community')}
                                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
                            >
                                <Plus className="inline w-5 h-5 mr-2" />
                                Start a Community
                            </button>
                            <button
                                onClick={() => onNavigate('home')}
                                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                            >
                                Browse Marketplace
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CommunitiesPage;