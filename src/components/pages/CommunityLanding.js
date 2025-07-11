// Community Landing Page
// Social features, forums, user profiles, and community interactions

import React from 'react';
import { Users, MessageCircle, Heart, Award, TrendingUp, Shield, Star, Crown } from 'lucide-react';
import CategoryLandingPage from './CategoryLandingPage';

const CommunityLanding = ({ onNavigate }) => {
    const communityData = {
        category: 'community',
        title: 'Community',
        description: 'Connect with fellow Kiwis! Join discussions, share experiences, and build lasting relationships in New Zealand\'s friendliest trading community.',
        heroImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=600&fit=crop',
        heroGradient: 'from-pink-600 to-orange-600',
        
        stats: {
            totalListings: '50,000+',
            totalSellers: '12,000+',
            dailyViews: '95K+',
            successRate: '98%'
        },

        features: [
            {
                icon: Shield,
                title: 'Verified Members',
                description: 'Multi-level verification system ensuring you connect with genuine, trustworthy community members.'
            },
            {
                icon: Crown,
                title: 'Achievement System',
                description: 'Earn badges and level up your profile by being an active, helpful member of the community.'
            },
            {
                icon: MessageCircle,
                title: 'Real-time Chat',
                description: 'Instant messaging, group discussions, and community forums for seamless communication.'
            }
        ],

        popularSubcategories: [
            {
                id: 'forums',
                name: 'Discussion Forums',
                icon: '💬',
                description: 'General chat, buy/sell advice, and community discussions',
                count: '8.5K'
            },
            {
                id: 'seller-network',
                name: 'Seller Network',
                icon: '🤝',
                description: 'Connect with other sellers, share tips, and collaborate',
                count: '3.2K'
            },
            {
                id: 'local-groups',
                name: 'Local Groups',
                icon: '📍',
                description: 'City and region-specific community groups',
                count: '2.1K'
            },
            {
                id: 'trading-tips',
                name: 'Trading Tips',
                icon: '💡',
                description: 'Advice, guides, and best practices for buying and selling',
                count: '1.8K'
            },
            {
                id: 'showcase',
                name: 'Member Showcase',
                icon: '🏆',
                description: 'Share your finds, collections, and success stories',
                count: '2.8K'
            },
            {
                id: 'events',
                name: 'Events & Meetups',
                icon: '🎉',
                description: 'Local meetups, swap meets, and community events',
                count: '450'
            },
            {
                id: 'feedback',
                name: 'Feedback & Reviews',
                icon: '⭐',
                description: 'Rate and review your trading experiences',
                count: '15K'
            },
            {
                id: 'newbie-zone',
                name: 'Newbie Zone',
                icon: '🌱',
                description: 'Getting started guides and newcomer support',
                count: '1.2K'
            }
        ],

        trendingSearches: [
            'Auckland Meetup',
            'Selling Tips',
            'Photography Help',
            'Vintage Collectors',
            'Car Enthusiasts',
            'Tech Community',
            'Craft Circle',
            'Local Swappers'
        ],

        successStories: [
            {
                user: 'Marcus - Power Seller',
                story: 'The community helped me grow from 0 to 1000+ sales in 18 months. The networking here is incredible!',
                rating: 5
            },
            {
                user: 'Jenny - Collector',
                story: 'Found my collecting tribe here! We share finds, trade items, and have regular meetups in Wellington.',
                rating: 5
            },
            {
                user: 'Dave - New Seller',
                story: 'As a newbie, the community guidance was invaluable. Made my first $1000 in sales within 2 months.',
                rating: 5
            }
        ]
    };

    return <CategoryLandingPage {...communityData} onNavigate={onNavigate} />;
};

export default CommunityLanding;