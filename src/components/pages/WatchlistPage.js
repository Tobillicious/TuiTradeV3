// src/components/pages/WatchlistPage.js
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { FullPageLoader } from '../ui/Loaders';
// Removed unused import
import { formatPrice } from '../../lib/utils';
import { Eye, Heart, Home, ChevronRight, Bell, BellOff, AlertTriangle, Clock, TrendingUp, TrendingDown, Download, X, MapPin, User } from 'lucide-react';

const WatchlistPage = ({ onNavigate, onItemClick, onWatchToggle, watchedItems, onAddToCart, cartItems }) => {
    const [watchedListings, setWatchedListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState({});
    const [showNotifications, setShowNotifications] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchWatchlist();
            checkForNotifications();
        }
    }, [currentUser, watchedItems]);

    const fetchWatchlist = async () => {
        // Defensive programming: handle undefined/null watchedItems
        if (!currentUser || !watchedItems || !Array.isArray(watchedItems) || watchedItems.length === 0) {
            setWatchedListings([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Firestore 'in' queries have a limit of 10 items, so we need to batch them
            const batchSize = 10;
            const allListings = [];
            const allAuctions = [];

            // Process watchedItems in batches of 10
            for (let i = 0; i < watchedItems.length; i += batchSize) {
                const batch = watchedItems.slice(i, i + batchSize);
                
                // Fetch watched listings in this batch
                try {
                    const listingsQuery = query(
                        collection(db, 'listings'),
                        where('__name__', 'in', batch)
                    );
                    const listingsSnapshot = await getDocs(listingsQuery);
                    const listings = listingsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toDate(),
                        listingType: doc.data().listingType || 'fixed-price'
                    }));
                    allListings.push(...listings);
                } catch (listingError) {
                    console.warn('Error fetching listings batch:', listingError);
                }

                // Fetch watched auctions in this batch
                try {
                    const auctionsQuery = query(
                        collection(db, 'auctions'),
                        where('__name__', 'in', batch)
                    );
                    const auctionsSnapshot = await getDocs(auctionsQuery);
                    const auctions = auctionsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toDate(),
                        endTime: doc.data().endTime?.toDate(),
                        listingType: 'auction'
                    }));
                    allAuctions.push(...auctions);
                } catch (auctionError) {
                    console.warn('Error fetching auctions batch:', auctionError);
                }
            }

            const allWatched = [...allListings, ...allAuctions];
            setWatchedListings(allWatched);
            
            // Show success message if we have items
            if (allWatched.length > 0) {
                console.log(`✅ Successfully loaded ${allWatched.length} watched items`);
            }
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            // Set empty array on error to prevent crashes
            setWatchedListings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWatchlist = (itemId) => {
        onWatchToggle(itemId);
    };

    const checkForNotifications = () => {
        const newNotifications = {};

        watchedListings.forEach(item => {
            const notifications = [];

            // Check for auction ending soon (within 24 hours)
            if (item.listingType === 'auction' && item.endTime) {
                const endTime = new Date(item.endTime);
                const now = new Date();
                const hoursLeft = (endTime - now) / (1000 * 60 * 60);

                if (hoursLeft <= 24 && hoursLeft > 0) {
                    notifications.push({
                        type: 'ending-soon',
                        message: `Auction ends in ${Math.floor(hoursLeft)} hours`,
                        icon: Clock,
                        color: 'text-orange-600'
                    });
                }
            }

            // Check for new bids on auctions
            if (item.listingType === 'auction' && item.bidCount > 0) {
                const recentBids = item.bidCount - (item.lastBidCount || 0);
                if (recentBids > 0) {
                    notifications.push({
                        type: 'new-bids',
                        message: `${recentBids} new bid${recentBids > 1 ? 's' : ''} on this auction`,
                        icon: TrendingUp,
                        color: 'text-green-600'
                    });
                }
            }

            // Check for price changes (demo data)
            if (item.listingType === 'fixed-price' && item.priceHistory) {
                const lastPrice = item.priceHistory[item.priceHistory.length - 1];
                const previousPrice = item.priceHistory[item.priceHistory.length - 2];
                if (lastPrice && previousPrice && lastPrice !== previousPrice) {
                    const change = lastPrice > previousPrice ? 'increased' : 'decreased';
                    notifications.push({
                        type: 'price-change',
                        message: `Price ${change} from $${previousPrice} to $${lastPrice}`,
                        icon: lastPrice > previousPrice ? TrendingUp : TrendingDown,
                        color: lastPrice > previousPrice ? 'text-red-600' : 'text-green-600'
                    });
                }
            }

            // Check for low stock (for items with quantity)
            if (item.quantity && item.quantity <= 3) {
                notifications.push({
                    type: 'low-stock',
                    message: `Only ${item.quantity} left in stock`,
                    icon: AlertTriangle,
                    color: 'text-red-600'
                });
            }

            if (notifications.length > 0) {
                newNotifications[item.id] = notifications;
            }
        });

        setNotifications(newNotifications);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    
                    {/* Skeleton grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                <div className="aspect-[4/5] bg-gray-200 animate-pulse"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        Home
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">My Watchlist</span>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showNotifications
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            {showNotifications ? <Bell size={16} /> : <BellOff size={16} />}
                            <span>{showNotifications ? 'Hide' : 'Show'} Notifications</span>
                        </button>
                    </div>
                </div>

                {/* Notifications Summary */}
                {showNotifications && Object.keys(notifications).length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="font-semibold text-blue-900">
                                    {Object.values(notifications).flat().length} notification{Object.values(notifications).flat().length !== 1 ? 's' : ''} for your watchlist
                                </span>
                            </div>
                            <button
                                onClick={() => setNotifications({})}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                Dismiss all
                            </button>
                        </div>
                    </div>
                )}

                {watchedListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {watchedListings.map(item => (
                            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                                <div className="relative aspect-[4/5]">
                                    <img
                                        src={item.imageUrl || 'https://placehold.co/320x400/fef2f2/dc2626?text=Watchlist+Item'}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />

                                    {/* Notifications Badge */}
                                    {showNotifications && notifications[item.id] && (
                                        <div className="absolute top-2 left-2">
                                            <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                                                {notifications[item.id].length}
                                            </div>
                                        </div>
                                    )}

                                    {/* Digital Goods Badge */}
                                    {item.isDigital && (
                                        <div className="absolute top-2 right-2">
                                            <div className="bg-purple-500 text-white px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide flex items-center">
                                                <Download size={10} className="mr-1" />
                                                Digital
                                            </div>
                                        </div>
                                    )}

                                    {/* Professional overlay elements */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Remove from watchlist button */}
                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={() => handleRemoveFromWatchlist(item.id)}
                                            className="p-2 rounded-full transition-all shadow-lg bg-white/90 text-gray-700 hover:bg-white hover:scale-110"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {/* Professional item info overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                                        <div className="text-white">
                                            <h4 className="font-bold text-lg mb-1 line-clamp-1">{item.title}</h4>

                                            {/* Price and status */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-2xl font-bold text-green-400">
                                                        {item.listingType === 'auction'
                                                            ? formatPrice(item.currentBid || item.startingBid)
                                                            : formatPrice(item.price)
                                                        }
                                                    </p>
                                                    {item.listingType === 'auction' && (
                                                        <p className="text-xs text-white/80">
                                                            {item.bidCount || 0} bids
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-white/80 mb-1">Status</p>
                                                    <div className={`text-xs px-2 py-1 rounded-full ${item.listingType === 'auction'
                                                        ? 'bg-red-500/20 text-red-300'
                                                        : 'bg-green-500/20 text-green-300'
                                                        }`}>
                                                        {item.listingType === 'auction' ? 'Live Auction' : 'Fixed Price'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notifications */}
                                            {showNotifications && notifications[item.id] && (
                                                <div className="mb-2 space-y-1">
                                                    {notifications[item.id].map((notification, index) => {
                                                        const IconComponent = notification.icon;
                                                        return (
                                                            <div key={index} className={`flex items-center text-xs ${notification.color}`}>
                                                                <IconComponent size={10} className="mr-1" />
                                                                {notification.message}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-xs text-white/90">
                                                <span className="flex items-center">
                                                    <MapPin size={10} className="mr-1" />
                                                    {item.location}
                                                </span>
                                                {item.userEmail && (
                                                    <span className="flex items-center">
                                                        <User size={10} className="mr-1" />
                                                        {item.userEmail.split('@')[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-8">
                        {/* Creative animated empty state */}
                        <div className="relative mb-8">
                            <div className="w-32 h-32 mx-auto relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 rounded-full animate-pulse"></div>
                                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                                    <Heart className="w-12 h-12 text-green-600" />
                                </div>
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Your Watchlist is Waiting!
                        </h2>
                        <p className="text-gray-600 text-lg mb-2">
                            Start building your collection of favorite items
                        </p>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            💡 Pro tip: Click the <Heart className="w-4 h-4 inline mx-1 text-red-500" /> on any item to save it here. 
                            You'll get notified about price changes and auction updates!
                        </p>
                        
                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => onNavigate('/')}
                                className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                🛍️ Browse Marketplace
                            </button>
                            <button
                                onClick={() => onNavigate('/jobs')}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                💼 Explore Jobs
                            </button>
                        </div>
                        
                        {/* Popular categories */}
                        <div className="mt-12 max-w-2xl mx-auto">
                            <p className="text-gray-600 mb-6">Or start with these popular categories:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { name: 'Motors', icon: '🚗', path: '/motors' },
                                    { name: 'Property', icon: '🏠', path: '/real-estate' },
                                    { name: 'Electronics', icon: '📱', path: '/category/electronics' },
                                    { name: 'Fashion', icon: '👕', path: '/category/fashion' }
                                ].map((category) => (
                                    <button
                                        key={category.name}
                                        onClick={() => onNavigate(category.path)}
                                        className="p-4 rounded-xl bg-white border-2 border-gray-100 hover:border-green-300 hover:shadow-md transition-all text-center group"
                                    >
                                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                                            {category.icon}
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                                            {category.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchlistPage;