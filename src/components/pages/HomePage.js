// src/components/pages/HomePage.js
import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LISTINGS_LIMIT } from '../../lib/utils';
import ItemCard from '../ui/ItemCard';
import { AuctionCard } from '../ui/AuctionSystem';
import { Tag, Shield, Star, MessageCircle, ChevronDown, ShoppingCart, Car, Briefcase, Wrench, Gift, Home } from 'lucide-react';

const HomePage = ({ onWatchToggle, watchedItems, onNavigate, onItemClick, onAddToCart, cartItems }) => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMoreItems, setHasMoreItems] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

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
                // Removed setFeaturedItems
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

    const handleLoadMore = async () => {
        if (hasMoreItems && !isLoadingMore) {
            setIsLoadingMore(true);
            await fetchListings(true);
            // setCurrentPage(prev => prev + 1); // Removed currentPage
            setIsLoadingMore(false);
        }
    };



    if (isLoading && listings.length === 0) {
        return (
            <div className="flex-grow">
                {/* Hero Section Skeleton */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-center">
                            <div className="h-12 bg-white/20 rounded animate-pulse mb-4"></div>
                            <div className="h-6 bg-white/20 rounded animate-pulse mb-8 w-2/3 mx-auto"></div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <div className="h-12 bg-white/20 rounded animate-pulse w-32"></div>
                                <div className="h-12 bg-white/20 rounded animate-pulse w-32"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Skeleton */}
                <div className="bg-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="h-8 bg-gray-200 rounded animate-pulse mb-12 w-1/3 mx-auto"></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-6 rounded-xl border-2 border-gray-200">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse mx-auto mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Listings Skeleton */}
                <div className="bg-gray-50 min-h-screen py-8">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-1/4 mx-auto"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                    <div className="relative aspect-[4/5]">
                                        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                                        <div className="absolute top-2 right-2">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                                                <div className="h-6 bg-gray-300 rounded animate-pulse w-1/2"></div>
                                                <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
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
                        <p className="text-lg md:text-xl mb-2 text-green-200 animate-fade-in-up animation-delay-100 italic">
                            Nau mai, haere mai ki TuiTrade
                        </p>
                        <p className="text-xl md:text-2xl mb-8 text-green-100 animate-fade-in-up animation-delay-200">
                            Aotearoa's most beautiful marketplace
                        </p>
                        <p className="text-sm text-green-200 animate-fade-in-up animation-delay-300 italic">
                            Kia ora! Trade the Kiwi way - whānau friendly, locally owned
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

            {/* Enhanced Categories Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            Explore Our Categories
                        </h2>
                        <p className="text-xl text-gray-600 mb-2 italic">
                            Kōrero mai - Tell us what you're looking for
                        </p>
                        <p className="text-lg text-gray-500">
                            Discover amazing items across Aotearoa's most comprehensive marketplace
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Marketplace Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-800/20"></div>
                            <div className="relative p-8 h-80 flex flex-col justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <ShoppingCart className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3">Marketplace</h3>
                                    <p className="text-blue-100 text-lg mb-4">Everything you need, all in one place</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-blue-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>11 categories</span>
                                        </div>
                                        <div className="flex items-center text-blue-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>Auctions & Classified</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onNavigate('marketplace-landing')}
                                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                                >
                                    Explore Marketplace
                                </button>
                            </div>
                        </div>

                        {/* Motors Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-red-800/20"></div>
                            <div className="relative p-8 h-80 flex flex-col justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <Car className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3">Motors</h3>
                                    <p className="text-red-100 text-lg mb-4">Find your perfect ride</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-red-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>6 categories</span>
                                        </div>
                                        <div className="flex items-center text-red-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>Auctions & Classified</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onNavigate('motors-landing')}
                                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                                >
                                    Browse Motors
                                </button>
                            </div>
                        </div>

                        {/* Property Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-800/20"></div>
                            <div className="relative p-8 h-80 flex flex-col justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <Home className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3">Property</h3>
                                    <p className="text-green-100 text-lg mb-4">Your dream home awaits</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-green-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>3 categories</span>
                                        </div>
                                        <div className="flex items-center text-green-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>Classified</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onNavigate('real-estate-landing')}
                                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                                >
                                    Find Property
                                </button>
                            </div>
                        </div>

                        {/* Jobs Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-800/20"></div>
                            <div className="relative p-8 h-80 flex flex-col justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <Briefcase className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3">Jobs</h3>
                                    <p className="text-purple-100 text-lg mb-4">Your next career move</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-purple-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>5 categories</span>
                                        </div>
                                        <div className="flex items-center text-purple-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>Classified</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onNavigate('jobs-landing')}
                                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                                >
                                    Find Jobs
                                </button>
                            </div>
                        </div>

                        {/* Services Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-orange-800/20"></div>
                            <div className="relative p-8 h-80 flex flex-col justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <Wrench className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3">Services</h3>
                                    <p className="text-orange-100 text-lg mb-4">Professional services</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-orange-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>4 categories</span>
                                        </div>
                                        <div className="flex items-center text-orange-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>Classified</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onNavigate('digital-goods-landing')}
                                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                                >
                                    Browse Services
                                </button>
                            </div>
                        </div>

                        {/* Community Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-pink-800/20"></div>
                            <div className="relative p-8 h-80 flex flex-col justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <Gift className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3">Community</h3>
                                    <p className="text-pink-100 text-lg mb-4">Connect with Kiwis</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-pink-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>3 categories</span>
                                        </div>
                                        <div className="flex items-center text-pink-100">
                                            <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                            <span>Classified</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onNavigate('community-landing')}
                                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                                >
                                    Join Community
                                </button>
                            </div>
                        </div>
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
                        <p className="text-gray-600 mb-2">
                            Discover amazing items and live auctions from across Aotearoa
                        </p>
                        <p className="text-sm text-gray-500 italic">
                            He taonga tuku iho - Treasures from our community
                        </p>
                    </div>

                    {listings.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Tag className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kāore anō he taonga</h3>
                                <p className="text-gray-500 mb-2">No items yet</p>
                                <p className="text-gray-500 mb-6">Be the first to list an item on TuiTrade!</p>
                                <p className="text-sm text-gray-400 italic">Tīmata mai - Start here</p>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

                            {/* Load More Button */}
                            {hasMoreItems && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-5 h-5 mr-2" />
                                                Load More Items
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                        Kia kaha - Keep going!
                                    </p>
                                </div>
                            )}

                            {/* Skeleton Loaders for Loading More */}
                            {isLoadingMore && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                            <div className="relative aspect-[4/5]">
                                                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                                                <div className="absolute top-2 right-2">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                                    <div className="space-y-2">
                                                        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                                                        <div className="h-6 bg-gray-300 rounded animate-pulse w-1/2"></div>
                                                        <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
