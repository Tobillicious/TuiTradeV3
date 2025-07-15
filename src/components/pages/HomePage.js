// src/components/pages/HomePage.js
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { LISTINGS_LIMIT } from '../../lib/utils';
import { trackPageView } from '../../lib/analytics';
import useAppContextSafe from '../../hooks/useAppContextSafe';
import ItemCard from '../ui/ItemCard';
import { AuctionCard } from '../ui/AuctionSystem';
import Carousel from '../ui/Carousel';
import Counter from '../ui/Counter';
import SpotlightCard from '../ui/SpotlightCard';
import TestimonialSystem from '../ui/TestimonialSystem';
import SocialProofIndicators from '../ui/SocialProofIndicators';
import LiveImpactTracker from '../ui/LiveImpactTracker';
import { Tag, Shield, Star, MessageCircle, ChevronDown } from 'lucide-react';
import { getBilingualText, TE_REO_TRANSLATIONS } from '../../lib/nzLocalizationEnhanced';

const HomePage = () => {
    // Use safe context hook with validation and helpers (refactored from inline code)
    const {
        onWatchToggle,
        watchedItems,
        onAddToCart,
        cartItems
    } = useAppContextSafe();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMoreItems, setHasMoreItems] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [stats, setStats] = useState({
        totalListings: 0,
        totalUsers: 0,
        totalJobs: 0,
        totalAuctions: 0,
        activeListings: 0
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

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

            // Get real watch counts from existing data or views
            const itemsWithWatchCounts = allItems.map(item => ({
                ...item,
                watchCount: item.watchCount || Math.max(Math.floor((item.views || 0) / 10), 0)
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

    // Fetch real platform statistics
    const fetchPlatformStats = useCallback(async () => {
        setIsLoadingStats(true);
        try {
            const promises = [
                getCountFromServer(collection(db, 'listings')),
                getCountFromServer(collection(db, 'users')),
                getCountFromServer(collection(db, 'jobs')),
                getCountFromServer(collection(db, 'auctions')),
            ];

            const [listingsCount, usersCount, jobsCount, auctionsCount] = await Promise.all(promises);

            setStats({
                totalListings: listingsCount.data().count,
                totalUsers: usersCount.data().count,
                totalJobs: jobsCount.data().count,
                totalAuctions: auctionsCount.data().count,
                activeListings: listingsCount.data().count
            });

            // Track homepage visit
            trackPageView('/home', {
                total_listings: listingsCount.data().count,
                total_users: usersCount.data().count
            });

        } catch (error) {
            console.error('Error fetching platform stats:', error);
            // Fallback to zero stats if Firebase is unreachable
            setStats({
                totalListings: 0,
                totalUsers: 0,
                totalJobs: 0,
                totalAuctions: 0,
                activeListings: 0
            });
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        fetchListings();
        fetchPlatformStats();
    }, [fetchListings, fetchPlatformStats]);

    const handleLoadMore = async () => {
        if (hasMoreItems && !isLoadingMore) {
            setIsLoadingMore(true);
            await fetchListings(true);
            // setCurrentPage(prev => prev + 1); // Removed currentPage
            setIsLoadingMore(false);
        }
    };
    
    const onItemClick = (item) => {
        navigate(`/item/${item.id}`);
    }



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
                            {getBilingualText('Welcome to TuiTrade', 'welcome')}
                        </h1>
                        <p className="text-lg md:text-xl mb-2 text-green-200 animate-fade-in-up animation-delay-100 italic">
                            {TE_REO_TRANSLATIONS.greetings.welcome}, haere mai ki TuiTrade
                        </p>
                        <p className="text-xl md:text-2xl mb-8 text-green-100 animate-fade-in-up animation-delay-200">
                            {getBilingualText("Aotearoa's most beautiful marketplace", 'marketplace')}
                        </p>
                        <p className="text-sm text-green-200 animate-fade-in-up animation-delay-300 italic">
                            {TE_REO_TRANSLATIONS.greetings.hello}! Trade the Kiwi way - whānau friendly, locally owned
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
                            <button
                                onClick={() => navigate('/create-listing')}
                                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <Tag className="inline mr-2" size={20} />
                                {getBilingualText('Start Selling', 'post_a_job')}
                            </button>
                            <button
                                onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
                                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all"
                            >
                                {getBilingualText('Browse Items', 'browse')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Impact Tracker */}
            <div className="bg-gradient-to-br from-gray-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <LiveImpactTracker />
                </div>
            </div>

            {/* Social Proof Indicators */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SocialProofIndicators 
                        position="inline"
                        showRecentActivity={true}
                        showStats={true}
                        showTrustSignals={true}
                    />
                </div>
            </div>

            {/* Enhanced Categories Section with Carousel */}
            <div className="bg-gradient-to-br from-gray-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            {getBilingualText('Explore Our Categories', 'browse_categories')}
                        </h2>
                        <p className="text-xl text-gray-600 mb-2 italic">
                            Kōrero mai - Tell us what you're looking for
                        </p>
                        <p className="text-lg text-gray-500">
                            Discover amazing items across {TE_REO_TRANSLATIONS.phrases.new_zealand}'s most comprehensive {TE_REO_TRANSLATIONS.interface.marketplace}
                        </p>
                    </motion.div>

                    {/* Hero Carousel */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    >
                        <Carousel 
                            autoplay={true}
                            autoplayDelay={5000}
                            pauseOnHover={true}
                            onNavigate={(path) => navigate(path)}
                        />
                    </motion.div>
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
                                    onClick={() => navigate('/create-listing')}
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
                                            onNavigate={(path) => navigate(path)}
                                        />
                                    ) : (
                                        <ItemCard
                                            key={item.id}
                                            item={item}
                                            isWatched={Array.isArray(watchedItems) && watchedItems.includes(item.id)}
                                            onWatchToggle={onWatchToggle}
                                            onItemClick={onItemClick}
                                            onAddToCart={onAddToCart}
                                            isInCart={Array.isArray(cartItems) && cartItems.some(cartItem => cartItem.id === item.id)}
                                            onNavigate={(path) => navigate(path)}
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
                    <motion.div 
                        className="text-center mb-12"
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Trade with Confidence
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Your safety and satisfaction are our top priorities
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            <SpotlightCard className="theme-tui">
                                <div className="text-center p-6">
                                    <motion.div 
                                        className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Shield className="w-8 h-8 text-white" />
                                    </motion.div>
                                    <h3 className="text-xl font-semibold mb-2">Secure Trading</h3>
                                    <p className="text-gray-600">
                                        All transactions are protected with our secure payment system and buyer protection.
                                    </p>
                                </div>
                            </SpotlightCard>
                        </motion.div>

                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            <SpotlightCard 
                                spotlightColor="rgba(249, 115, 22, 0.25)"
                                backgroundColor="rgba(255, 255, 255, 0.95)"
                            >
                                <div className="text-center p-6">
                                    <motion.div 
                                        className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Star className="w-8 h-8 text-white" />
                                    </motion.div>
                                    <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
                                    <p className="text-gray-600">
                                        We verify all listings and provide detailed seller ratings to ensure quality.
                                    </p>
                                </div>
                            </SpotlightCard>
                        </motion.div>

                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            <SpotlightCard 
                                spotlightColor="rgba(59, 130, 246, 0.25)"
                                backgroundColor="rgba(255, 255, 255, 0.95)"
                            >
                                <div className="text-center p-6">
                                    <motion.div 
                                        className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <MessageCircle className="w-8 h-8 text-white" />
                                    </motion.div>
                                    <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                                    <p className="text-gray-600">
                                        Our dedicated support team is here to help you with any questions or concerns.
                                    </p>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Testimonials & Success Stories */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <TestimonialSystem 
                        displayMode="carousel"
                        category="all"
                        maxItems={6}
                        autoPlay={true}
                        showStats={true}
                    />
                </div>
            </div>

            {/* Real-time Platform Statistics */}
            <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">
                            {getBilingualText('Platform Statistics', 'platform_stats')}
                        </h2>
                        <p className="text-gray-300">
                            {getBilingualText('Real-time data from our growing community', 'realtime_data')}
                        </p>
                        <p className="text-sm text-gray-400 mt-2 italic">
                            {TE_REO_TRANSLATIONS.greetings.hello_formal} - Live community insights
                        </p>
                    </motion.div>

                    {isLoadingStats ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="text-center">
                                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                        <div className="h-6 bg-gray-700 rounded animate-pulse mb-2"></div>
                                        <div className="h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
                                        <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Total Listings */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors">
                                    <p className="text-gray-400 text-sm mb-2">
                                        {getBilingualText('Total Listings', 'total_listings')}
                                    </p>
                                    <Counter 
                                        value={stats.totalListings}
                                        places={[10000, 1000, 100, 10, 1]}
                                        fontSize={32}
                                        padding={8}
                                        gap={4}
                                        textColor="#ffffff"
                                        backgroundColor="#374151"
                                        fontWeight={700}
                                        borderRadius={6}
                                        shadow={true}
                                    />
                                    <p className="text-gray-500 text-xs mt-2">Active marketplace items</p>
                                </div>
                            </motion.div>

                            {/* Total Users */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                                    <p className="text-gray-400 text-sm mb-2">
                                        {getBilingualText('Community Members', 'community_members')}
                                    </p>
                                    <Counter 
                                        value={stats.totalUsers}
                                        places={[10000, 1000, 100, 10, 1]}
                                        fontSize={32}
                                        padding={8}
                                        gap={4}
                                        textColor="#ffffff"
                                        backgroundColor="#374151"
                                        fontWeight={700}
                                        borderRadius={6}
                                        shadow={true}
                                    />
                                    <p className="text-gray-500 text-xs mt-2">Registered users</p>
                                </div>
                            </motion.div>

                            {/* Total Jobs */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                                    <p className="text-gray-400 text-sm mb-2">
                                        {getBilingualText('Job Opportunities', 'job_opportunities')}
                                    </p>
                                    <Counter 
                                        value={stats.totalJobs}
                                        places={[1000, 100, 10, 1]}
                                        fontSize={32}
                                        padding={8}
                                        gap={4}
                                        textColor="#ffffff"
                                        backgroundColor="#374151"
                                        fontWeight={700}
                                        borderRadius={6}
                                        shadow={true}
                                    />
                                    <p className="text-gray-500 text-xs mt-2">Career positions</p>
                                </div>
                            </motion.div>

                            {/* Total Auctions */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-yellow-500 transition-colors">
                                    <p className="text-gray-400 text-sm mb-2">
                                        {getBilingualText('Live Auctions', 'live_auctions')}
                                    </p>
                                    <Counter 
                                        value={stats.totalAuctions}
                                        places={[1000, 100, 10, 1]}
                                        fontSize={32}
                                        padding={8}
                                        gap={4}
                                        textColor="#ffffff"
                                        backgroundColor="#374151"
                                        fontWeight={700}
                                        borderRadius={6}
                                        shadow={true}
                                    />
                                    <p className="text-gray-500 text-xs mt-2">Bidding opportunities</p>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center mt-8"
                    >
                        <p className="text-gray-400 text-sm">
                            {getBilingualText('Updated in real-time', 'updated_realtime')} • 
                            <span className="text-green-400 ml-1">Live</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1 italic">
                            Ngā taonga o te hapori - Community treasures growing daily
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
