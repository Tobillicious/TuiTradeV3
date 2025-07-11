// Marketplace Landing Page
// General marketplace with everything from electronics to home goods

import React from 'react';
import { ShoppingCart, Shield, Zap, Users, Heart, Star, TrendingUp, Package } from 'lucide-react';
import CategoryLandingPage from './CategoryLandingPage';

const MarketplaceLanding = ({ onNavigate }) => {
    const marketplaceData = {
        category: 'marketplace',
        title: 'Marketplace',
        description: 'New Zealand\'s premier online marketplace. Buy, sell, and discover unique items from trusted sellers across the country.',
        heroImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
        heroGradient: 'from-blue-600 to-green-600',
        
        stats: {
            totalListings: '25,000+',
            totalSellers: '8,500+',
            dailyViews: '120K+',
            successRate: '96%'
        },

        features: [
            {
                icon: Shield,
                title: 'Buyer Protection',
                description: 'Advanced verification system with dispute resolution and secure payment processing for peace of mind.'
            },
            {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'List items in under 2 minutes with our smart category detection and auto-pricing suggestions.'
            },
            {
                icon: Users,
                title: 'Trusted Community',
                description: 'Join 50,000+ verified Kiwis trading everything from vintage finds to the latest tech.'
            }
        ],

        popularSubcategories: [
            {
                id: 'electronics',
                name: 'Electronics',
                icon: '📱',
                description: 'Phones, laptops, gaming, and smart home devices',
                count: '5.2K'
            },
            {
                id: 'fashion',
                name: 'Fashion',
                icon: '👗',
                description: 'Clothing, shoes, accessories, and vintage finds',
                count: '3.8K'
            },
            {
                id: 'home-garden',
                name: 'Home & Garden',
                icon: '🏠',
                description: 'Furniture, décor, appliances, and garden tools',
                count: '4.1K'
            },
            {
                id: 'sports',
                name: 'Sports & Outdoors',
                icon: '⚽',
                description: 'Equipment, gear, and outdoor adventure items',
                count: '2.3K'
            },
            {
                id: 'books-media',
                name: 'Books & Media',
                icon: '📚',
                description: 'Books, movies, music, and collectibles',
                count: '1.9K'
            },
            {
                id: 'baby-kids',
                name: 'Baby & Kids',
                icon: '🧸',
                description: 'Toys, clothes, equipment, and educational items',
                count: '1.6K'
            },
            {
                id: 'health-beauty',
                name: 'Health & Beauty',
                icon: '💄',
                description: 'Skincare, cosmetics, wellness, and fitness',
                count: '1.1K'
            },
            {
                id: 'business',
                name: 'Business & Industrial',
                icon: '🏢',
                description: 'Equipment, supplies, and professional tools',
                count: '890'
            }
        ],

        trendingSearches: [
            'iPhone 15 Pro Max',
            'Gaming Chair',
            'Vintage Clothing',
            'Home Décor',
            'Exercise Equipment',
            'Kitchen Appliances',
            'Designer Handbags',
            'Outdoor Furniture'
        ],

        successStories: [
            {
                user: 'Emma from Auckland',
                story: 'Sold my entire wardrobe within a week! The platform made it so easy to reach genuine buyers.',
                rating: 5
            },
            {
                user: 'James from Christchurch',
                story: 'Found rare vintage camera gear that I\'ve been searching for years. Great community here!',
                rating: 5
            },
            {
                user: 'Sophie from Wellington',
                story: 'Made over $2,000 decluttering my home. The smart pricing suggestions were incredibly helpful.',
                rating: 5
            }
        ]
    };

    return <CategoryLandingPage {...marketplaceData} onNavigate={onNavigate} />;
};

export default MarketplaceLanding;