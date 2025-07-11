// src/components/pages/HomePage.js
import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LISTINGS_LIMIT, CATEGORIES } from '../../lib/utils';
import ItemCard from '../ui/ItemCard';
import { AuctionCard } from '../ui/AuctionSystem';
import { FullPageLoader } from '../ui/Loaders';
import { Tag, Shield, Star, MessageCircle } from 'lucide-react';

const HomePage = ({ onWatchToggle, watchedItems, onNavigate, onItemClick, onAddToCart, cartItems }) => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [featuredItems, setFeaturedItems] = useState([]);
    const [hasMoreItems, setHasMoreItems] = useState(true);

    const fetchListings = useCallback(async (loadMore = false) => {
        setIsLoading(true);
        try {
            // Fetch from both listings and auctions collections
            const promises = [];
            
            // Get regular listings
            const listingsQuery = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT));
            promises.push(getDocs(listingsQuery));
            
            // Get auctions
            const auctionsQuery = query(collection(db, 'auctions'), orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT));
            promises.push(getDocs(auctionsQuery));
            
            const [listingsSnapshot, auctionsSnapshot] = await Promise.all(promises);
            
            // Process listings
            let allItems = listingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                listingType: doc.data().listingType || 'fixed-price'
            }));
            
            // Process auctions
            const auctions = auctionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                endTime: doc.data().endTime?.toDate(),
                listingType: 'auction'
            }));
            
            // Combine and sort by creation date
            allItems = [...allItems, ...auctions].sort((a, b) => b.createdAt - a.createdAt);

            // For now, add random watch counts for demo purposes
            // In production, you'd aggregate this from user watchlist subcollections
            const itemsWithWatchCounts = allItems.map(item => ({
                ...item,
                watchCount: Math.floor(Math.random() * 50) + 1 // Demo: 1-50 watchers
            }));

            console.log('HomePage: Items found:', itemsWithWatchCounts.length);

            if (loadMore) {
                setListings(prev => [...prev, ...itemsWithWatchCounts]);
            } else {
                setListings(itemsWithWatchCounts);
                setFeaturedItems(itemsWithWatchCounts.slice(0, 8));
            }

            // Check if we have more items to load
            setHasMoreItems(allItems.length === LISTINGS_LIMIT * 2);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const handleLoadMore = () => {
        if (hasMoreItems && !isLoading) {
            fetchListings(true);
        }
    };

    if (isLoading && listings.length === 0) {
        return <FullPageLoader message="Loading latest listings..." />;
    }

    return (
        <div className="flex-grow">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">
                            Welcome to TuiTrade
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-green-100 animate-fade-in-up animation-delay-200">
                            New Zealand's most beautiful marketplace
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
                            <button
                                onClick={() => onNavigate('create-listing')}
                                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <Tag className="inline mr-2" size={20} />
                                Start Selling
                            </button>
                            <button
                                onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
                                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all"
                            >
                                Browse Items
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                        Shop by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {Object.entries(CATEGORIES).map(([key, category]) => {
                            const IconComponent = category.icon;
                            const subcategoryCount = category.subcategories ? Object.keys(category.subcategories).length : 0;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onNavigate('category', { categoryKey: key })}
                                    className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 bg-white shadow-sm hover:shadow-md group ${{
                                        'blue': 'hover:border-blue-400',
                                        'red': 'hover:border-red-400',
                                        'purple': 'hover:border-purple-400',
                                        'green': 'hover:border-green-400',
                                        'orange': 'hover:border-orange-400',
                                        'pink': 'hover:border-pink-400'
                                    }[category.color] || 'hover:border-gray-400'}`}
                                >
                                    <div className={`w-12 h-12 mx-auto mb-3 p-3 rounded-lg transition-colors ${{
                                        'blue': 'bg-blue-100 group-hover:bg-blue-200',
                                        'red': 'bg-red-100 group-hover:bg-red-200',
                                        'purple': 'bg-purple-100 group-hover:bg-purple-200',
                                        'green': 'bg-green-100 group-hover:bg-green-200',
                                        'orange': 'bg-orange-100 group-hover:bg-orange-200',
                                        'pink': 'bg-pink-100 group-hover:bg-pink-200'
                                    }[category.color] || 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                        <IconComponent className={`w-6 h-6 ${{
                                            'blue': 'text-blue-600',
                                            'red': 'text-red-600',
                                            'purple': 'text-purple-600',
                                            'green': 'text-green-600',
                                            'orange': 'text-orange-600',
                                            'pink': 'text-pink-600'
                                        }[category.color] || 'text-gray-600'}`} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2 text-center">{category.name}</h3>
                                    <p className="text-xs text-gray-600 text-center">
                                        {subcategoryCount} categories
                                    </p>
                                    <p className="text-xs text-gray-500 text-center mt-1">
                                        {category.listingTypes.includes('auction') && category.listingTypes.includes('classified') ? 'Auctions & Classified' :
                                            category.listingTypes.includes('auction') ? 'Auctions' : 'Classified'}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Infinite Feed - TikTok/Instagram Style */}
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Live Marketplace Feed
                        </h2>
                        <p className="text-gray-600">
                            Discover amazing items and live auctions from across New Zealand
                        </p>
                    </div>

                    {listings.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Tag className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
                                <p className="text-gray-500 mb-6">Be the first to list an item on TuiTrade!</p>
                                <button
                                    onClick={() => onNavigate('create-listing')}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                >
                                    Create First Listing
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Masonry-style infinite grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                {listings.map(item => (
                                    item.listingType === 'auction' ? (
                                        <AuctionCard
                                            key={item.id}
                                            auction={item}
                                            onItemClick={onItemClick}
                                            onWatchToggle={onWatchToggle}
                                            watchedItems={watchedItems}
                                            onNavigate={onNavigate}
                                        />
                                    ) : (
                                        <ItemCard
                                            key={item.id}
                                            item={item}
                                            isWatched={watchedItems.includes(item.id)}
                                            onWatchToggle={onWatchToggle}
                                            onItemClick={onItemClick}
                                            onAddToCart={onAddToCart}
                                            isInCart={cartItems.some(cartItem => cartItem.id === item.id)}
                                            onNavigate={onNavigate}
                                        />
                                    )
                                ))}
                            </div>

                            {/* Infinite scroll load more */}
                            {hasMoreItems && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                        className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm border border-gray-200 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                                                Loading more...
                                            </div>
                                        ) : (
                                            'Load More Items'
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* End of feed indicator */}
                            {!hasMoreItems && listings.length > 0 && (
                                <div className="text-center mt-12 py-8">
                                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-500 text-sm">
                                        <span>You've reached the end of the feed</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Trust & Safety */}
            <div className="bg-green-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Trade with Confidence
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Your safety and satisfaction are our top priorities
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure Trading</h3>
                            <p className="text-gray-600">
                                All transactions are protected with our secure payment system and buyer protection.
                            </p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
                            <p className="text-gray-600">
                                We verify all listings and provide detailed seller ratings to ensure quality.
                            </p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                            <p className="text-gray-600">
                                Our dedicated support team is here to help you with any questions or concerns.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
