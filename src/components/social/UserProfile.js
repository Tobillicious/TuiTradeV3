// Enhanced User Profile Component with Social Features
// Comprehensive profile with ratings, badges, and community features

import React, { useState, useEffect, useMemo } from 'react';
import {
    Star, MapPin, Calendar, Award, Shield, Heart, MessageCircle,
    Settings, Edit, Camera, Users, TrendingUp, Package, Eye,
    CheckCircle, AlertCircle, Crown, Badge, Gift
} from 'lucide-react';
import { SELLER_LEVELS, ACHIEVEMENT_BADGES, calculateTrustScore } from '../../lib/communityFeatures';
import { formatNZCurrency } from '../../lib/nzLocalization';
import { getUserReviews } from '../../lib/reviewService';

const UserProfile = ({
    userId,
    isOwnProfile = false,
    onFollow,
    onMessage,
    onEdit
}) => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFollowing, setIsFollowing] = useState(false);
    const [showBadges, setShowBadges] = useState(false);
    const [recentListings, setRecentListings] = useState([]);
    const [reviews, setReviews] = useState([]);

    // ========== AI Agent Guidance ==========
    // The following mockUser and related logic are for development only.
    // NEXT STEPS: Replace with real Firestore or API integration for user profiles.
    // - Fetch user data from the database instead of using hardcoded mock data.
    // - Remove or disable mockUser in production.
    // Note: Claude or future agents may override these suggestions if they disagree.
    const mockUser = {
        id: userId,
        displayName: 'Sarah Johnson',
        username: '@sarahj_nz',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612d1c2?w=150&h=150&fit=crop&crop=face',
        coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop',
        bio: 'Passionate about sustainable living and vintage finds. Auckland based seller with a love for unique treasures! 🌱✨',
        location: 'Auckland, New Zealand',
        joinDate: new Date('2022-03-15'),
        verification: {
            emailVerified: true,
            phoneVerified: true,
            addressVerified: true,
            idVerified: false,
            bankAccountVerified: true
        },
        stats: {
            itemsSold: 127,
            itemsPurchased: 89,
            totalListings: 45,
            activeListings: 12,
            totalRatings: 156,
            positiveRatings: 149,
            neutralRatings: 6,
            negativeRatings: 1,
            accountAge: 650
        },
        social: {
            followers: 234,
            following: 89,
            favouriteCategories: ['vintage-fashion', 'home-decor', 'books']
        },
        badges: ['first-sale', 'power-seller', 'five-star-seller', 'eco-warrior', 'helpful-reviewer'],
        recentActivity: [
            { type: 'item_sold', item: 'Vintage Leather Jacket', date: '2 days ago' },
            { type: 'review_left', rating: 5, date: '1 week ago' },
            { type: 'item_listed', item: 'Mid-Century Coffee Table', date: '1 week ago' }
        ]
    };

    useEffect(() => {
        // Simulate API call
        setUser(mockUser);
        setRecentListings([
            { id: 1, title: 'Vintage Denim Jacket', price: 85, image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=150&h=150&fit=crop', status: 'active' },
            { id: 2, title: 'Retro Coffee Table', price: 320, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop', status: 'sold' },
            { id: 3, title: 'Plant Collection', price: 45, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150&h=150&fit=crop', status: 'active' }
        ]);
        // Load real user reviews
        const loadUserReviews = async () => {
            try {
                const userReviews = await getUserReviews(userId, { limit: 5 });
                setReviews(userReviews);
            } catch (error) {
                console.error('Error loading user reviews:', error);
                setReviews([]); // Fallback to empty array
            }
        };
        loadUserReviews();
    }, [userId]);

    const trustScore = useMemo(() => {
        if (!user) return 0;
        return calculateTrustScore({
            ...user.stats,
            verificationLevel: Object.values(user.verification).filter(Boolean).length
        });
    }, [user]);

    const sellerLevel = useMemo(() => {
        if (!user) return 'new';

        for (const [level, requirements] of Object.entries(SELLER_LEVELS).reverse()) {
            const meetsRequirements = Object.entries(requirements.requirements || {}).every(([key, value]) => {
                if (key === 'trustScore') return trustScore >= value;
                if (key.includes('Verified')) return user.verification[key];
                return user.stats[key] >= value;
            });

            if (meetsRequirements) return level;
        }
        return 'new';
    }, [user, trustScore]);

    const verificationCount = useMemo(() => {
        return user ? Object.values(user.verification).filter(Boolean).length : 0;
    }, [user]);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    const renderHeader = () => (
        <div className="relative">
            {/* Cover Photo */}
            <div
                className="h-48 md:h-64 bg-gradient-to-r from-green-400 to-blue-500 relative"
                style={user.coverPhoto ? { backgroundImage: `url(${user.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
                {isOwnProfile && (
                    <button className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white/90 transition-colors">
                        <Camera size={16} />
                    </button>
                )}
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 md:-mt-20">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white"
                        />
                        {isOwnProfile && (
                            <button className="absolute bottom-2 right-2 bg-green-600 p-2 rounded-full text-white hover:bg-green-700 transition-colors">
                                <Camera size={14} />
                            </button>
                        )}

                        {/* Trust Score Badge */}
                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${trustScore >= 95 ? 'bg-green-500 text-white' :
                                    trustScore >= 85 ? 'bg-blue-500 text-white' :
                                        trustScore >= 70 ? 'bg-yellow-500 text-white' :
                                            'bg-gray-500 text-white'
                                }`}>
                                {trustScore}
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 mt-4 md:mt-0 md:ml-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                                    {user.displayName}
                                    {verificationCount >= 3 && (
                                        <CheckCircle className="ml-2 text-green-500" size={20} />
                                    )}
                                    {SELLER_LEVELS[sellerLevel] && (
                                        <span className="ml-2 text-lg">
                                            {SELLER_LEVELS[sellerLevel].icon}
                                        </span>
                                    )}
                                </h1>
                                <p className="text-gray-600">{user.username}</p>
                                <div className="flex items-center text-gray-500 mt-1">
                                    <MapPin size={14} className="mr-1" />
                                    <span className="text-sm">{user.location}</span>
                                    <Calendar size={14} className="ml-4 mr-1" />
                                    <span className="text-sm">
                                        Joined {user.joinDate.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 mt-4 md:mt-0">
                                {!isOwnProfile && (
                                    <>
                                        <button
                                            onClick={() => setIsFollowing(!isFollowing)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isFollowing
                                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                        >
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                        <button
                                            onClick={onMessage}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <MessageCircle size={16} className="mr-2 inline" />
                                            Message
                                        </button>
                                    </>
                                )}
                                {isOwnProfile && (
                                    <button
                                        onClick={onEdit}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Edit size={16} className="mr-2 inline" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <p className="mt-4 text-gray-700 max-w-2xl">{user.bio}</p>
                        )}

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{user.stats.itemsSold}</div>
                                <div className="text-sm text-gray-500">Items Sold</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{trustScore}%</div>
                                <div className="text-sm text-gray-500">Trust Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{user.social.followers}</div>
                                <div className="text-sm text-gray-500">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{user.stats.activeListings}</div>
                                <div className="text-sm text-gray-500">Active Listings</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabs = () => (
        <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
                {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'listings', label: 'Listings', icon: Package },
                    { id: 'reviews', label: 'Reviews', icon: Star },
                    { id: 'badges', label: 'Badges', icon: Award }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id
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
    );

    const renderOverview = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <TrendingUp className="mr-2" size={18} />
                        Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {user.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">
                                        {activity.type === 'item_sold' && `Sold "${activity.item}"`}
                                        {activity.type === 'review_left' && `Left a ${activity.rating}-star review`}
                                        {activity.type === 'item_listed' && `Listed "${activity.item}"`}
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Listings */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Listings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentListings.map(listing => (
                            <div key={listing.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex space-x-3">
                                    <img
                                        src={listing.image}
                                        alt={listing.title}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 line-clamp-1">{listing.title}</h4>
                                        <p className="text-green-600 font-semibold">{formatNZCurrency(listing.price)}</p>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${listing.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {listing.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                {/* Seller Level */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Crown className="mr-2 text-yellow-500" size={18} />
                        Seller Level
                    </h3>
                    <div className="text-center">
                        <div className="text-3xl mb-2">{SELLER_LEVELS[sellerLevel].icon}</div>
                        <h4 className="font-semibold text-gray-900">{SELLER_LEVELS[sellerLevel].name}</h4>
                        <div className="mt-4 space-y-2">
                            {SELLER_LEVELS[sellerLevel].benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center text-sm text-gray-600">
                                    <CheckCircle size={14} className="mr-2 text-green-500" />
                                    {benefit}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Verification Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Shield className="mr-2" size={18} />
                        Verification Status
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(user.verification).map(([key, verified]) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </span>
                                {verified ? (
                                    <CheckCircle className="text-green-500" size={16} />
                                ) : (
                                    <AlertCircle className="text-gray-400" size={16} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-center">
                        <div className="text-sm text-gray-500">
                            {verificationCount} of {Object.keys(user.verification).length} verified
                        </div>
                    </div>
                </div>

                {/* Achievement Badges */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Badge className="mr-2" size={18} />
                        Top Badges
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {user.badges.slice(0, 4).map(badgeKey => {
                            const badge = Object.values(ACHIEVEMENT_BADGES).flatMap(category =>
                                Object.entries(category)
                            ).find(([key]) => key === badgeKey)?.[1];

                            if (!badge) return null;

                            return (
                                <div key={badgeKey} className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl mb-1">{badge.icon}</div>
                                    <div className="text-xs font-medium text-gray-900">{badge.name}</div>
                                </div>
                            );
                        })}
                    </div>
                    {user.badges.length > 4 && (
                        <button
                            onClick={() => setActiveTab('badges')}
                            className="w-full mt-3 text-sm text-green-600 hover:text-green-700"
                        >
                            View all {user.badges.length} badges
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'listings':
                return <div className="p-6">Listings content</div>;
            case 'reviews':
                return <div className="p-6">Reviews content</div>;
            case 'badges':
                return <div className="p-6">Badges content</div>;
            default:
                return renderOverview();
        }
    };

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {renderHeader()}
            {renderTabs()}
            {renderTabContent()}
        </div>
    );
};

export default UserProfile;