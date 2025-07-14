// Personalized Feed Component
// Displays algorithmically curated content based on user behavior

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, Heart, Eye, Star, Zap } from 'lucide-react';
import { getPersonalizedFeed, trackItemClick } from '../../lib/apiService';
import { useAuth } from '../../context/AuthContext';
import { useTeReo } from './TeReoToggle';

const PersonalizedFeed = ({ onItemClick, onWatchToggle, watchedItems = [] }) => {
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedType, setFeedType] = useState('personalized'); // personalized, trending, recent
    const { currentUser } = useAuth();
    const { getText } = useTeReo();

    useEffect(() => {
        loadFeed();
    }, [feedType, currentUser]);

    const loadFeed = async () => {
        try {
            setLoading(true);
            setError(null);

            let items = [];

            if (feedType === 'personalized' && currentUser) {
                // Get personalized feed
                items = await getPersonalizedFeed(12, { type: 'personalized' });
            } else if (feedType === 'trending') {
                // Get trending items
                items = await getPersonalizedFeed(12, { type: 'trending' });
            } else {
                // Get recent items
                items = await getPersonalizedFeed(12, { type: 'recent' });
            }

            setFeedItems(items);
        } catch (err) {
            console.error('Error loading feed:', err);
            setError('Failed to load personalized content');
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (item) => {
        // Track the click interaction
        if (currentUser) {
            trackItemClick(item.id, item.categoryId, {
                feedType,
                position: feedItems.indexOf(item)
            });
        }

        // Navigate to item detail
        onItemClick(item);
    };

    const getFeedTitle = () => {
        if (feedType === 'personalized') {
            return getText('For You | Mōu', 'for_you');
        } else if (feedType === 'trending') {
            return getText('Trending Now | Rongonui Ināianei', 'trending_now');
        } else {
            return getText('Latest Items | Ngā Taonga Hou', 'latest_items');
        }
    };

    const getFeedDescription = () => {
        if (feedType === 'personalized') {
            return getText('Curated just for you based on your interests', 'personalized_description');
        } else if (feedType === 'trending') {
            return getText('Most popular items right now', 'trending_description');
        } else {
            return getText('Fresh items just added to TuiTrade', 'recent_description');
        }
    };

    const getFeedIcon = () => {
        switch (feedType) {
            case 'personalized':
                return <Sparkles className="w-5 h-5" />;
            case 'trending':
                return <TrendingUp className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
        }
    };

    const getRelevanceBadge = (item) => {
        if (!item.relevanceScore || item.relevanceScore < 5) return null;

        let badge = null;
        if (item.relevanceScore > 15) {
            badge = { text: getText('Perfect Match | Tino Rite', 'perfect_match'), color: 'bg-green-100 text-green-800', icon: <Star className="w-3 h-3" /> };
        } else if (item.relevanceScore > 10) {
            badge = { text: getText('Great Match | Rite Pai', 'great_match'), color: 'bg-blue-100 text-blue-800', icon: <Zap className="w-3 h-3" /> };
        } else if (item.relevanceScore > 5) {
            badge = { text: getText('Good Match | Rite', 'good_match'), color: 'bg-yellow-100 text-yellow-800', icon: <Heart className="w-3 h-3" /> };
        }

        return badge;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">{getText('Unable to load personalized content', 'feed_error_title')}</p>
                    <p className="text-sm mb-4">{error}</p>
                    <button
                        onClick={loadFeed}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        {getText('Try Again | Whakamātau Anō', 'try_again')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Feed Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                            {getFeedIcon()}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{getFeedTitle()}</h2>
                            <p className="text-sm text-gray-500">{getFeedDescription()}</p>
                        </div>
                    </div>

                    {/* Feed Type Selector */}
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        {[
                            { key: 'personalized', label: getText('For You', 'for_you_short'), icon: Sparkles },
                            { key: 'trending', label: getText('Trending', 'trending_short'), icon: TrendingUp },
                            { key: 'recent', label: getText('Recent', 'recent_short'), icon: Clock }
                        ].map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.key}
                                    onClick={() => setFeedType(type.key)}
                                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${feedType === type.key
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{type.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Feed Content */}
            <div className="p-6">
                {feedItems.length === 0 ? (
                    <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {getText('No personalized content yet', 'no_personalized_content')}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {getText('Start browsing and interacting with items to get personalized recommendations', 'personalized_help_text')}
                        </p>
                        <button
                            onClick={() => setFeedType('recent')}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            {getText('Browse Recent Items | Kōwhiri Taonga Hou', 'browse_recent')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {feedItems.map((item) => {
                            const relevanceBadge = getRelevanceBadge(item);
                            const isWatched = watchedItems?.includes(item.id) || false;

                            return (
                                <div
                                    key={item.id}
                                    className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => handleItemClick(item)}
                                >
                                    {/* Relevance Badge */}
                                    {relevanceBadge && (
                                        <div className={`absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${relevanceBadge.color} z-10`}>
                                            {relevanceBadge.icon}
                                            <span>{relevanceBadge.text}</span>
                                        </div>
                                    )}

                                    {/* Item Image */}
                                    <div className="aspect-square bg-gray-100 overflow-hidden">
                                        {item.images && item.images[0] ? (
                                            <img
                                                src={item.images[0]}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Eye className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Details */}
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </h3>

                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-lg font-bold text-green-600">
                                                ${item.price?.toLocaleString() || '0'}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onWatchToggle(item.id);
                                                }}
                                                className={`p-1 rounded-full transition-colors ${isWatched
                                                        ? 'text-red-500 hover:text-red-600'
                                                        : 'text-gray-400 hover:text-red-500'
                                                    }`}
                                            >
                                                <Heart className={`w-5 h-5 ${isWatched ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>{item.location || getText('Location not specified', 'no_location')}</span>
                                            <div className="flex items-center space-x-2">
                                                {item.viewCount > 0 && (
                                                    <span className="flex items-center space-x-1">
                                                        <Eye className="w-3 h-3" />
                                                        <span>{item.viewCount}</span>
                                                    </span>
                                                )}
                                                {item.watchlistCount > 0 && (
                                                    <span className="flex items-center space-x-1">
                                                        <Heart className="w-3 h-3" />
                                                        <span>{item.watchlistCount}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalizedFeed; 