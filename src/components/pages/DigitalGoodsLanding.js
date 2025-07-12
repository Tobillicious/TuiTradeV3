// Digital Goods Landing Page
// Software, eBooks, courses, digital art, and NFTs

import React from 'react';
import { Download, Shield, Globe } from 'lucide-react';
import CategoryLandingPage from './CategoryLandingPage';

const DigitalGoodsLanding = ({ onNavigate }) => {
    const digitalGoodsData = {
        category: 'digitalGoods',
        title: 'Digital Goods',
        description: 'Discover, buy, and sell digital products. From software and courses to NFTs and digital art - the future of commerce is here.',
        heroImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=600&fit=crop',
        heroGradient: 'from-indigo-600 to-purple-600',

        stats: {
            totalListings: '6,500+',
            totalSellers: '1,800+',
            dailyViews: '28K+',
            successRate: '94%'
        },

        features: [
            {
                icon: Download,
                title: 'Instant Delivery',
                description: 'Get your digital products instantly after purchase with secure download links and license keys.'
            },
            {
                icon: Shield,
                title: 'License Protection',
                description: 'Clear licensing terms and digital rights management to protect both creators and buyers.'
            },
            {
                icon: Globe,
                title: 'Global Reach',
                description: 'Sell your digital creations worldwide with multi-currency support and international payments.'
            }
        ],

        popularSubcategories: [
            {
                id: 'software',
                name: 'Software',
                icon: '💻',
                description: 'Applications, games, mobile apps, and development tools',
                count: '1.8K'
            },
            {
                id: 'ebooks',
                name: 'eBooks & Audiobooks',
                icon: '📚',
                description: 'Digital books, audiobooks, and educational content',
                count: '1.2K'
            },
            {
                id: 'courses',
                name: 'Online Courses',
                icon: '🎓',
                description: 'Programming, design, business, and skill development courses',
                count: '950'
            },
            {
                id: 'graphics',
                name: 'Graphics & Design',
                icon: '🎨',
                description: 'Stock photos, templates, fonts, and design assets',
                count: '1.5K'
            },
            {
                id: 'music',
                name: 'Music & Audio',
                icon: '🎵',
                description: 'Music tracks, sound effects, beats, and audio samples',
                count: '680'
            },
            {
                id: 'videos',
                name: 'Videos & Animation',
                icon: '🎬',
                description: 'Stock footage, animations, tutorials, and video content',
                count: '520'
            },
            {
                id: 'nft',
                name: 'NFTs & Digital Art',
                icon: '🖼️',
                description: 'Digital art, collectibles, and blockchain-based assets',
                count: '380'
            },
            {
                id: 'templates',
                name: 'Templates & Tools',
                icon: '⚙️',
                description: 'Website templates, business tools, and productivity resources',
                count: '420'
            }
        ],

        trendingSearches: [
            'Photoshop Actions',
            'WordPress Themes',
            'Stock Photography',
            'Online Course',
            'Mobile App',
            'Music Beats',
            'Digital Art',
            'Logo Templates'
        ],

        successStories: [
            {
                user: 'Creative Studio Auckland',
                story: 'Sold over 500 design templates in our first month. The platform made it easy to reach designers worldwide.',
                rating: 5
            },
            {
                user: 'Dev Team Wellington',
                story: 'Our mobile app generated $15K in sales within 6 months. Great marketplace for digital products.',
                rating: 5
            },
            {
                user: 'Sarah - Digital Artist',
                story: 'My NFT collection sold out in 48 hours! The built-in blockchain integration made everything seamless.',
                rating: 5
            }
        ]
    };

    return <CategoryLandingPage {...digitalGoodsData} onNavigate={onNavigate} />;
};

export default DigitalGoodsLanding;