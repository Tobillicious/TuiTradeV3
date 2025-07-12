// Real Estate Landing Page
// Properties for sale and rent across New Zealand

import React from 'react';
import { Calculator, Camera, Calendar } from 'lucide-react';
import CategoryLandingPage from './CategoryLandingPage';

const RealEstateLanding = ({ onNavigate }) => {
    const realEstateData = {
        category: 'property',
        title: 'Real Estate',
        description: 'Discover your next home or investment property. From Auckland apartments to Queenstown lifestyle blocks - find it all here.',
        heroImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=600&fit=crop',
        heroGradient: 'from-purple-600 to-pink-600',

        stats: {
            totalListings: '8,500+',
            totalSellers: '1,200+',
            dailyViews: '45K+',
            successRate: '89%'
        },

        features: [
            {
                icon: Calculator,
                title: 'Mortgage Calculator',
                description: 'Calculate your borrowing capacity with our integrated mortgage calculator and pre-approval tools.'
            },
            {
                icon: Camera,
                title: 'Virtual Tours',
                description: 'Immersive 3D virtual tours and high-quality photography for every property listing.'
            },
            {
                icon: Calendar,
                title: 'Easy Viewing',
                description: 'Schedule property viewings directly through the platform with instant confirmation.'
            }
        ],

        popularSubcategories: [
            {
                id: 'houses-sale',
                name: 'Houses for Sale',
                icon: '🏡',
                description: 'Family homes, luxury properties, and investment opportunities',
                count: '3.2K'
            },
            {
                id: 'apartments-sale',
                name: 'Apartments for Sale',
                icon: '🏢',
                description: 'Modern apartments, penthouses, and unit complexes',
                count: '1.8K'
            },
            {
                id: 'rentals',
                name: 'Rental Properties',
                icon: '🗝️',
                description: 'Houses, apartments, and rooms for rent',
                count: '2.1K'
            },
            {
                id: 'commercial',
                name: 'Commercial',
                icon: '🏪',
                description: 'Offices, retail spaces, and business premises',
                count: '680'
            },
            {
                id: 'land',
                name: 'Land & Sections',
                icon: '🌳',
                description: 'Building sections, lifestyle blocks, and development land',
                count: '450'
            },
            {
                id: 'lifestyle',
                name: 'Lifestyle Properties',
                icon: '🌄',
                description: 'Rural properties, farms, and lifestyle blocks',
                count: '320'
            },
            {
                id: 'beachfront',
                name: 'Beachfront',
                icon: '🏖️',
                description: 'Waterfront properties and holiday homes',
                count: '180'
            },
            {
                id: 'new-builds',
                name: 'New Builds',
                icon: '🏗️',
                description: 'Brand new homes and off-the-plan developments',
                count: '290'
            }
        ],

        trendingSearches: [
            'Auckland 3 bedroom',
            'Wellington apartment',
            'Christchurch house',
            'Queenstown holiday home',
            'Tauranga waterfront',
            'Hamilton family home',
            'Dunedin student flat',
            'Rotorua lifestyle block'
        ],

        successStories: [
            {
                user: 'Lisa from Auckland',
                story: 'Found our dream home in just 2 weeks! The search filters made it so easy to find exactly what we wanted.',
                rating: 5
            },
            {
                user: 'Tom from Wellington',
                story: 'Sold our apartment above asking price. The virtual tour feature attracted so many quality buyers.',
                rating: 5
            },
            {
                user: 'Rachel from Christchurch',
                story: 'Great platform for first-time buyers. The mortgage calculator and guides were incredibly helpful.',
                rating: 5
            }
        ]
    };

    return <CategoryLandingPage {...realEstateData} onNavigate={onNavigate} />;
};

export default RealEstateLanding;