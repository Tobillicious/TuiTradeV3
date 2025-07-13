// Community Page - Democratic Neighborhood System
// Local community hub with town hall features, events, and member listings

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Users, MapPin, Calendar, MessageSquare, Vote,
    Star, ChevronRight, Clock, Heart, Share2,
    Plus, Filter, Search, ExternalLink, Shield,
    Home, Briefcase, Award, Bell
} from 'lucide-react';
import {
    collection, query, where, orderBy, limit, getDocs,
    doc, getDoc, setDoc, updateDoc, increment, addDoc, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../lib/firebase';
import { getBilingualText } from '../../lib/nzLocalizationEnhanced';

// NewDiscussionForm Component
const NewDiscussionForm = ({ communityId, onDiscussionCreated }) => {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleCreateDiscussion = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Please enter a title for your discussion.');
            return;
        }
        if (!content.trim()) {
            setError('Please enter content for your discussion.');
            return;
        }
        if (!currentUser) {
            setError('You must be logged in to post a discussion.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const discussionData = {
                title: title.trim(),
                content: content.trim(),
                authorId: currentUser.uid,
                authorName: currentUser.displayName || currentUser.email.split('@')[0],
                communityId: communityId,
                createdAt: serverTimestamp(),
                upvotes: 0,
                downvotes: 0,
                replyCount: 0,
                upvotedBy: [],
                downvotedBy: [],
            };

            const discussionsRef = collection(db, 'communities', communityId, 'discussions');
            await addDoc(discussionsRef, discussionData);

            setTitle('');
            setContent('');
            if (onDiscussionCreated) {
                onDiscussionCreated();
            }
        } catch (err) {
            console.error("Error creating discussion:", err);
            setError('Failed to create discussion. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Start a New Discussion</h3>
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
                <div>
                    <label htmlFor="discussion-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        id="discussion-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <label htmlFor="discussion-content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                        id="discussion-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        placeholder="Share more details here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        disabled={isSubmitting}
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Discussion'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const CommunityPage = ({ communityId, onNavigate }) => {
    const { user } = useAuth();
    const { showNotification } = useNotification();

    const [community, setCommunity] = useState(null);
    const [members, setMembers] = useState([]);
    const [discussions, setDiscussions] = useState([]);
    const [events, setEvents] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [listings, setListings] = useState([]);
    const [moderators, setModerators] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [userRole, setUserRole] = useState('member');
    const [isMember, setIsMember] = useState(false);

    const loadCommunityData = useCallback(async () => {
        if (!communityId) return;

        setIsLoading(true);
        try {
            // Load community details
            const communityDoc = await getDoc(doc(db, 'communities', communityId));
            if (!communityDoc.exists()) {
                showNotification('Community not found', 'error');
                return;
            }

            const communityData = { id: communityDoc.id, ...communityDoc.data() };
            setCommunity(communityData);

            // Load members
            const membersQuery = query(
                collection(db, 'communities', communityId, 'members'),
                orderBy('joinedAt', 'desc'),
                limit(20)
            );
            const membersSnapshot = await getDocs(membersQuery);
            const membersData = membersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMembers(membersData);

            // Check if current user is a member
            if (user) {
                const userMember = membersData.find(member => member.id === user.uid);
                setIsMember(!!userMember);
                setUserRole(userMember?.role || 'member');
            }

            // Load moderators
            const moderatorsData = membersData.filter(member =>
                member.role === 'moderator' || member.role === 'admin'
            );
            setModerators(moderatorsData);

            // Load recent discussions
            const discussionsQuery = query(
                collection(db, 'communities', communityId, 'discussions'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            const discussionsSnapshot = await getDocs(discussionsQuery);
            const discussionsData = discussionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));
            setDiscussions(discussionsData);

            // Load upcoming events
            const eventsQuery = query(
                collection(db, 'communities', communityId, 'events'),
                where('date', '>=', new Date()),
                orderBy('date', 'asc'),
                limit(5)
            );
            const eventsSnapshot = await getDocs(eventsQuery);
            const eventsData = eventsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate()
            }));
            setEvents(eventsData);

            // Load local businesses
            const businessesQuery = query(
                collection(db, 'communities', communityId, 'businesses'),
                where('verified', '==', true),
                orderBy('rating', 'desc'),
                limit(8)
            );
            const businessesSnapshot = await getDocs(businessesQuery);
            const businessesData = businessesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBusinesses(businessesData);

            // Load community listings
            const listingsQuery = query(
                collection(db, 'listings'),
                where('community', '==', communityId),
                orderBy('createdAt', 'desc'),
                limit(6)
            );
            const listingsSnapshot = await getDocs(listingsQuery);
            const listingsData = listingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));
            setListings(listingsData);

        } catch (error) {
            console.error('Error loading community data:', error);
            showNotification('Error loading community data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [communityId, user, showNotification]);

    useEffect(() => {
        loadCommunityData();
    }, [loadCommunityData]);

    const handleJoinCommunity = async () => {
        if (!user) {
            showNotification('Please sign in to join the community', 'info');
            return;
        }

        try {
            // Add user to community members
            await setDoc(doc(db, 'communities', communityId, 'members', user.uid), {
                joinedAt: new Date(),
                role: 'member',
                displayName: user.displayName || user.email.split('@')[0],
                verified: false,
                reputation: 0
            });

            // Update community member count
            await updateDoc(doc(db, 'communities', communityId), {
                memberCount: increment(1)
            });

            setIsMember(true);
            showNotification(`Welcome to the ${community.name} community! 🏘️`, 'success');
            loadCommunityData();
        } catch (error) {
            console.error('Error joining community:', error);
            showNotification('Error joining community', 'error');
        }
    };

    const formatTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    const handleVote = async (discussionId, voteType) => {
        if (!user) {
            showNotification('Please sign in to vote', 'info');
            return;
        }

        try {
            const discussionRef = doc(db, 'communities', communityId, 'discussions', discussionId);
            const discussionDoc = await getDoc(discussionRef);

            if (!discussionDoc.exists()) {
                showNotification('Discussion not found', 'error');
                return;
            }

            const discussionData = discussionDoc.data();
            const upvotedBy = discussionData.upvotedBy || [];
            const downvotedBy = discussionData.downvotedBy || [];
            const userId = user.uid;

            let newUpvotes = discussionData.upvotes || 0;
            let newDownvotes = discussionData.downvotes || 0;
            let newUpvotedBy = [...upvotedBy];
            let newDownvotedBy = [...downvotedBy];

            if (voteType === 'up') {
                // Remove from downvoted if previously downvoted
                if (downvotedBy.includes(userId)) {
                    newDownvotedBy = downvotedBy.filter(id => id !== userId);
                    newDownvotes = Math.max(0, newDownvotes - 1);
                }

                // Toggle upvote
                if (upvotedBy.includes(userId)) {
                    newUpvotedBy = upvotedBy.filter(id => id !== userId);
                    newUpvotes = Math.max(0, newUpvotes - 1);
                } else {
                    newUpvotedBy.push(userId);
                    newUpvotes += 1;
                }
            } else if (voteType === 'down') {
                // Remove from upvoted if previously upvoted
                if (upvotedBy.includes(userId)) {
                    newUpvotedBy = upvotedBy.filter(id => id !== userId);
                    newUpvotes = Math.max(0, newUpvotes - 1);
                }

                // Toggle downvote
                if (downvotedBy.includes(userId)) {
                    newDownvotedBy = downvotedBy.filter(id => id !== userId);
                    newDownvotes = Math.max(0, newDownvotes - 1);
                } else {
                    newDownvotedBy.push(userId);
                    newDownvotes += 1;
                }
            }

            await updateDoc(discussionRef, {
                upvotes: newUpvotes,
                downvotes: newDownvotes,
                upvotedBy: newUpvotedBy,
                downvotedBy: newDownvotedBy
            });

            // Refresh discussions data
            loadCommunityData();

            const voteAction = voteType === 'up' ? 'upvoted' : 'downvoted';
            showNotification(`Successfully ${voteAction} discussion`, 'success');
        } catch (error) {
            console.error('Error voting on discussion:', error);
            showNotification('Error voting on discussion', 'error');
        }
    };

    const getUserVoteStatus = (discussion) => {
        if (!user) return null;

        const userId = user.uid;
        const upvotedBy = discussion.upvotedBy || [];
        const downvotedBy = discussion.downvotedBy || [];

        if (upvotedBy.includes(userId)) return 'up';
        if (downvotedBy.includes(userId)) return 'down';
        return null;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-48 bg-gray-200 rounded-2xl"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-32 bg-gray-200 rounded-xl"></div>
                                <div className="h-64 bg-gray-200 rounded-xl"></div>
                            </div>
                            <div className="space-y-6">
                                <div className="h-48 bg-gray-200 rounded-xl"></div>
                                <div className="h-48 bg-gray-200 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h2>
                    <p className="text-gray-600 mb-8">The community you're looking for doesn't exist.</p>
                    <button
                        onClick={() => onNavigate('home')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Community Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col lg:flex-row items-start justify-between"
                    >
                        <div className="flex-1">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                                    <Home className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold">{community.name}</h1>
                                    <p className="text-green-100 flex items-center mt-1">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {community.type === 'suburb' ? 'Suburb' : 'City'} • {community.region}
                                    </p>
                                </div>
                            </div>

                            <p className="text-lg text-green-100 mb-4 italic">
                                Kia ora whānau! Welcome to your neighborhood community
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span>{community.memberCount || members.length} {getBilingualText('members', 'members')}</span>
                                </div>
                                <div className="flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    <span>{discussions.length} active discussions</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{events.length} upcoming events</span>
                                </div>
                                <div className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    <span>{businesses.length} local businesses</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 lg:mt-0 lg:ml-8">
                            {!isMember ? (
                                <button
                                    onClick={handleJoinCommunity}
                                    className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg flex items-center"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Join Community
                                </button>
                            ) : (
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                                    <Shield className="w-6 h-6 mx-auto mb-2" />
                                    <div className="text-sm font-medium">You're a member!</div>
                                    <div className="text-xs text-green-100 capitalize">{userRole}</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto py-4">
                        {[
                            { id: 'overview', label: 'Overview', icon: Home },
                            { id: 'discussions', label: 'Town Hall', icon: MessageSquare },
                            { id: 'events', label: 'Events', icon: Calendar },
                            { id: 'businesses', label: 'Businesses', icon: Briefcase },
                            { id: 'marketplace', label: 'Local Market', icon: Heart },
                            { id: 'members', label: 'Members', icon: Users }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-green-100 text-green-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Recent Discussions */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                                        Recent Discussions
                                    </h2>
                                    <button
                                        onClick={() => setActiveTab('discussions')}
                                        className="text-green-600 hover:text-green-700 font-medium flex items-center text-sm"
                                    >
                                        View All
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                {discussions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                                        <p className="text-gray-500 mb-4">Be the first to start a community conversation!</p>
                                        {isMember && (
                                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                                Start Discussion
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {discussions.slice(0, 3).map((discussion) => (
                                            <div key={discussion.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900 mb-1">{discussion.title}</h3>
                                                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{discussion.content}</p>
                                                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                                                            <span>by {discussion.authorName}</span>
                                                            <span>{formatTimeAgo(discussion.createdAt)}</span>
                                                            <span className="flex items-center">
                                                                <MessageSquare className="w-3 h-3 mr-1" />
                                                                {discussion.replyCount || 0} replies
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {discussion.pinned && (
                                                        <div className="ml-2">
                                                            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                                                Pinned
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* Local Marketplace */}
                            {listings.length > 0 && (
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                            <Heart className="w-5 h-5 mr-2 text-pink-600" />
                                            Local Marketplace
                                        </h2>
                                        <button
                                            onClick={() => setActiveTab('marketplace')}
                                            className="text-green-600 hover:text-green-700 font-medium flex items-center text-sm"
                                        >
                                            View All
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {listings.slice(0, 4).map((listing) => (
                                            <div key={listing.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
                                                <div className="flex items-start space-x-3">
                                                    <img
                                                        src={listing.images?.[0] || 'https://via.placeholder.com/60'}
                                                        alt={listing.title}
                                                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{listing.title}</h3>
                                                        <p className="text-green-600 font-semibold text-lg">${listing.price}</p>
                                                        <p className="text-gray-500 text-xs">{formatTimeAgo(listing.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Community Stats */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Community Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Members</span>
                                        <span className="font-semibold text-gray-900">{community.memberCount || members.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Active Today</span>
                                        <span className="font-semibold text-gray-900">{Math.floor((community.memberCount || members.length) * 0.15)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">This Week's Posts</span>
                                        <span className="font-semibold text-gray-900">{discussions.length + events.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Community Rating</span>
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="font-semibold text-gray-900 ml-1">4.8</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Moderators */}
                            {moderators.length > 0 && (
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                                        Moderators
                                    </h3>
                                    <div className="space-y-3">
                                        {moderators.slice(0, 3).map((moderator) => (
                                            <div key={moderator.id} className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium text-sm">
                                                        {moderator.displayName?.charAt(0) || 'M'}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 text-sm">{moderator.displayName}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{moderator.role}</p>
                                                </div>
                                                {moderator.verified && (
                                                    <Award className="w-4 h-4 text-green-600" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 italic">
                                            Next election: March 2024
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Upcoming Events */}
                            {events.length > 0 && (
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                                        Upcoming Events
                                    </h3>
                                    <div className="space-y-3">
                                        {events.slice(0, 3).map((event) => (
                                            <div key={event.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                                <h4 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h4>
                                                <div className="flex items-center text-xs text-gray-500 space-x-2">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{event.date?.toLocaleDateString()}</span>
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{event.location}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}

                {/* Discussions Tab */}
                {activeTab === 'discussions' && (
                    <div className="space-y-8">
                        <NewDiscussionForm
                            communityId={communityId}
                            onDiscussionCreated={loadCommunityData}
                        />

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                                Community Discussions
                            </h2>

                            {discussions.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                                    <p className="text-gray-500">Be the first to start a community conversation!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {discussions.map((discussion) => (
                                        <div key={discussion.id} className="border border-gray-100 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                                                    <p className="text-gray-600 mb-3">{discussion.content}</p>
                                                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                                                        <span>by {discussion.authorName}</span>
                                                        <span>{formatTimeAgo(discussion.createdAt)}</span>
                                                        <span className="flex items-center">
                                                            <MessageSquare className="w-4 h-4 mr-1" />
                                                            {discussion.replyCount || 0} replies
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Vote className="w-4 h-4 mr-1" />
                                                            {discussion.upvotes - discussion.downvotes} votes
                                                        </span>
                                                    </div>
                                                </div>
                                                {discussion.pinned && (
                                                    <div className="ml-4">
                                                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                                            Pinned
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Voting buttons */}
                                            <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleVote(discussion.id, 'up')}
                                                    className={`flex items-center transition-colors ${getUserVoteStatus(discussion) === 'up'
                                                            ? 'text-green-600'
                                                            : 'text-gray-500 hover:text-green-600'
                                                        }`}
                                                >
                                                    <Vote className="w-4 h-4 mr-1" />
                                                    Upvote
                                                </button>
                                                <button
                                                    onClick={() => handleVote(discussion.id, 'down')}
                                                    className={`flex items-center transition-colors ${getUserVoteStatus(discussion) === 'down'
                                                            ? 'text-red-600'
                                                            : 'text-gray-500 hover:text-red-600'
                                                        }`}
                                                >
                                                    <Vote className="w-4 h-4 mr-1 rotate-180" />
                                                    Downvote
                                                </button>
                                                <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                                                    <MessageSquare className="w-4 h-4 mr-1" />
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Other tab content */}
                {activeTab !== 'overview' && activeTab !== 'discussions' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 capitalize">{activeTab}</h2>
                        <p className="text-gray-600 mb-6">This section is coming soon! We're building amazing features for your community.</p>
                        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6">
                            <p className="text-sm text-gray-700 italic">
                                ✨ Features in development: Democratic voting system, event management, local business directory, and more!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;