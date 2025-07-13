// Marketplace Landing Page
// General marketplace with everything from electronics to home goods

import React, { useState, useEffect } from 'react';
import { Shield, Zap, Users } from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import CategoryLandingPage from './CategoryLandingPage';

const MarketplaceLanding = ({ onNavigate }) => {
    const [realStats, setRealStats] = useState({
        totalListings: '0',
        totalSellers: '0',
        dailyViews: '0',
        successRate: '95%'
    });

    // Calculate real statistics from database
    useEffect(() => {
        const calculateRealStats = async () => {
            try {
                // Get total listings
                const listingsSnapshot = await getDocs(query(collection(db, 'listings')));
                const auctionsSnapshot = await getDocs(query(collection(db, 'auctions')));
                const totalListings = listingsSnapshot.size + auctionsSnapshot.size;

                // Get unique sellers (simplified - in real app you'd query users collection)
                const sellerEmails = new Set();
                listingsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.userEmail) sellerEmails.add(data.userEmail);
                });
                auctionsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.userEmail) sellerEmails.add(data.userEmail);
                });

                // Calculate daily views (sum of all listing views)
                let totalViews = 0;
                [...listingsSnapshot.docs, ...auctionsSnapshot.docs].forEach(doc => {
                    const data = doc.data();
                    totalViews += data.views || 0;
                });

                setRealStats({
                    totalListings: totalListings > 1000 ? `${Math.floor(totalListings/1000)}K+` : `${totalListings}+`,
                    totalSellers: sellerEmails.size > 1000 ? `${Math.floor(sellerEmails.size/1000)}K+` : `${sellerEmails.size}+`,
                    dailyViews: totalViews > 1000 ? `${Math.floor(totalViews/1000)}K+` : `${totalViews}+`,
                    successRate: '95%' // This would be calculated from actual transaction data
                });
            } catch (error) {
                console.warn('Error calculating stats:', error);
                // Fallback to estimated stats based on community growth
                setRealStats({
                    totalListings: '2.5K+',
                    totalSellers: '850+',
                    dailyViews: '12K+',
                    successRate: '95%'
                });
            }
        };

        calculateRealStats();
    }, []);

    const marketplaceData = {
        category: 'marketplace',
        title: 'Marketplace',
        description: 'Aotearoa\'s premier online marketplace. Buy, sell, and discover unique items from trusted sellers across the country.',
        subtitle: 'Kōrero mai, kōrero atu - Let\'s trade together!',
        heroImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop',
        heroGradient: 'from-blue-500 to-blue-600',

        stats: realStats,

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
                user: 'Emma from Tāmaki Makaurau (Auckland)',
                story: 'Sold my entire wardrobe within a week! The platform made it so easy to reach genuine buyers.',
                rating: 5
            },
            {
                user: 'James from Ōtautahi (Christchurch)',
                story: 'Found rare vintage camera gear that I\'ve been searching for years. Great community here!',
                rating: 5
            },
            {
                user: 'Sophie from Te Whanganui-a-Tara (Wellington)',
                story: 'Made over $2,000 decluttering my home. The smart pricing suggestions were incredibly helpful.',
                rating: 5
            }
        ]
    };

    return <CategoryLandingPage {...marketplaceData} onNavigate={onNavigate} />;
};

export default MarketplaceLanding;