// Reusable Category Landing Page Component
// Template for all category-specific landing pages

import React, { useState, useMemo } from 'react';
import {
    Search, Filter, Grid, List, TrendingUp, Star, ArrowRight, ChevronRight, Shield, Zap, Users, Heart
} from 'lucide-react';

const CategoryLandingPage = ({
    category,
    title,
    description,
    heroImage,
    heroGradient = "from-green-600 to-blue-600",
    features = [],
    successStories = [],
    stats = {},
    popularSubcategories = [],
    featuredListings = [],
    trendingSearches = [],
    sellersHighlights = [],
    onNavigate = () => { }
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for demonstration
    const mockListings = useMemo(() => [
        {
            id: 1,
            title: "Professional Camera Equipment",
            price: 1250,
            image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=200&fit=crop",
            location: "Auckland",
            timeLeft: "2 days",
            watchers: 12,
            seller: { name: "ProPhoto_NZ", rating: 4.9, verified: true }
        },
        {
            id: 2,
            title: "Vintage Collectible Items",
            price: 89,
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
            location: "Wellington",
            timeLeft: "5 days",
            watchers: 8,
            seller: { name: "VintageNZ", rating: 4.8, verified: true }
        },
        {
            id: 3,
            title: "Gaming Setup Complete",
            price: 2350,
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop",
            location: "Christchurch",
            timeLeft: "1 day",
            watchers: 25,
            seller: { name: "GamersParadise", rating: 4.7, verified: true }
        }
    ], []);

    const renderHeroSection = () => (
        <div className={`bg-gradient-to-r ${heroGradient} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20"></div>
            {heroImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${heroImage})` }}
                ></div>
            )}

            <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
                        {description}
                    </p>

                    {/* Quick Search */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder={`Search ${title.toLowerCase()}...`}
                                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:ring-4 focus:ring-white/20 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => onNavigate('category', { categoryKey: category })}
                            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                        >
                            Start Browsing
                            <ArrowRight className="ml-2" size={18} />
                        </button>
                        <button
                            onClick={() => onNavigate('create-listing')}
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                        >
                            List Your Item
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStatsSection = () => (
        <div className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                            {stats.totalListings || '12,000+'}
                        </div>
                        <div className="text-gray-600">Active Listings</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                            {stats.totalSellers || '3,500+'}
                        </div>
                        <div className="text-gray-600">Sellers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                            {stats.dailyViews || '50K+'}
                        </div>
                        <div className="text-gray-600">Daily Views</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                            {stats.successRate || '94%'}
                        </div>
                        <div className="text-gray-600">Success Rate</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderQuickFilters = () => (
        <div className="bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex items-center gap-4">
                        <Filter size={20} className="text-gray-600" />
                        <span className="font-medium text-gray-700">Quick Filters:</span>
                    </div>

                    <div className="flex flex-wrap gap-3 flex-1">
                        {['Under $50', '$50-$200', '$200-$500', 'Over $500', 'Auckland', 'Wellington', 'Christchurch'].map((filter) => (
                            <button
                                key={filter}
                                className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:text-green-600 transition-colors text-sm"
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">View:</span>
                        <button
                            onClick={() => { }}
                            className={`p-2 rounded ${false ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => { }}
                            className={`p-2 rounded ${false ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFeaturedListings = () => (
        <div className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Listings</h2>
                    <button
                        onClick={() => onNavigate('category', { categoryKey: category })}
                        className="text-green-600 hover:text-green-700 flex items-center"
                    >
                        View All
                        <ChevronRight size={16} className="ml-1" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockListings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative aspect-[4/5]">
                                <img
                                    src={listing.image}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                                        <Heart size={16} className="text-gray-600" />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                    <div className="text-white">
                                        <p className="font-semibold text-sm truncate">{listing.title}</p>
                                        <p className="text-lg font-bold">${listing.price}</p>
                                        <p className="text-xs opacity-90">{listing.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPopularSubcategories = () => (
        <div className="bg-gray-50 py-16">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                    Popular Categories
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {popularSubcategories.length > 0 ? popularSubcategories.map((subcat, index) => (
                        <button
                            key={index}
                            onClick={() => onNavigate('category', { categoryKey: category, subcategoryKey: subcat.id })}
                            className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 group text-left w-full"
                        >
                            <div className="text-center">
                                <div className="text-3xl mb-3">{subcat.icon}</div>
                                <h3 className="font-semibold text-gray-900 mb-2">{subcat.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">{subcat.description}</p>
                                <div className="text-green-600 font-medium text-sm group-hover:text-green-700">
                                    {subcat.count} items
                                </div>
                            </div>
                        </button>
                    )) : (
                        // Default subcategories if none provided
                        [
                            { name: 'Electronics', icon: '📱', count: '2.3K', description: 'Phones, laptops, and gadgets' },
                            { name: 'Fashion', icon: '👗', count: '1.8K', description: 'Clothing, shoes, and accessories' },
                            { name: 'Home & Garden', icon: '🏠', count: '1.5K', description: 'Furniture, décor, and tools' },
                            { name: 'Sports', icon: '⚽', count: '890', description: 'Equipment and gear' },
                            { name: 'Books', icon: '📚', count: '1.2K', description: 'All genres and formats' },
                            { name: 'Collectibles', icon: '🏆', count: '670', description: 'Rare and unique items' },
                            { name: 'Toys & Games', icon: '🎮', count: '750', description: 'For all ages' },
                            { name: 'Music', icon: '🎵', count: '580', description: 'Instruments and equipment' }
                        ].map((subcat, index) => (
                            <button
                                key={index}
                                onClick={() => onNavigate('category', { categoryKey: category })}
                                className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 group text-left w-full"
                            >
                                <div className="text-center">
                                    <div className="text-3xl mb-3">{subcat.icon}</div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{subcat.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{subcat.description}</p>
                                    <div className="text-green-600 font-medium text-sm group-hover:text-green-700">
                                        {subcat.count} items
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderFeaturesSection = () => (
        <div className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
                    Why Choose TuiTrade for {title}?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.length > 0 ? features.map((feature, index) => (
                        <div key={index} className="text-center">
                            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <feature.icon className="text-green-600" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    )) : (
                        // Default features
                        [
                            {
                                icon: Shield,
                                title: 'Secure Trading',
                                description: 'Advanced verification system and buyer protection for safe transactions'
                            },
                            {
                                icon: Zap,
                                title: 'Fast & Easy',
                                description: 'List your items in minutes with our streamlined process'
                            },
                            {
                                icon: Users,
                                title: 'Trusted Community',
                                description: 'Join thousands of verified buyers and sellers across New Zealand'
                            }
                        ].map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <IconComponent className="text-green-600" size={24} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );

    const renderTrendingSection = () => (
        <div className="bg-gray-50 py-16">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                    Trending Now
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Trending Searches */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="mr-2 text-green-600" size={20} />
                            Popular Searches
                        </h3>
                        <div className="space-y-3">
                            {(trendingSearches.length > 0 ? trendingSearches : [
                                'iPhone 15 Pro', 'Gaming Chair', 'Vintage Clothing', 'Home Décor',
                                'Exercise Equipment', 'Kitchen Appliances'
                            ]).map((search, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-gray-700">{search}</span>
                                    <div className="flex items-center text-green-600">
                                        <TrendingUp size={14} className="mr-1" />
                                        <span className="text-sm font-medium">+{Math.floor(Math.random() * 50) + 10}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Success Stories */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Star className="mr-2 text-yellow-500" size={20} />
                            Success Stories
                        </h3>
                        <div className="space-y-4">
                            {(successStories.length > 0 ? successStories : [
                                {
                                    user: 'Sarah from Auckland',
                                    story: 'Sold my laptop within 24 hours at asking price!',
                                    rating: 5
                                },
                                {
                                    user: 'Mike from Wellington',
                                    story: 'Found exactly what I was looking for. Great seller!',
                                    rating: 5
                                }
                            ]).map((story, index) => (
                                <div key={index} className="border-l-4 border-green-500 pl-4">
                                    <div className="flex items-center mb-2">
                                        <div className="flex">
                                            {[...Array(story.rating)].map((_, i) => (
                                                <Star key={i} size={14} className="text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <span className="ml-2 text-sm text-gray-600">{story.user}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">"{story.story}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCTASection = () => (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
            <div className="max-w-4xl mx-auto text-center px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to Start Trading?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Join thousands of Kiwis buying and selling on New Zealand's fastest-growing marketplace.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Create Free Account
                    </button>
                    <button
                        onClick={() => onNavigate('category', { categoryKey: category })}
                        className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                        Browse {title}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {renderHeroSection()}
            {renderStatsSection()}
            {renderQuickFilters()}
            {renderFeaturedListings()}
            {renderPopularSubcategories()}
            {renderFeaturesSection()}
            {renderTrendingSection()}
            {renderCTASection()}
        </div>
    );
};

export default CategoryLandingPage;