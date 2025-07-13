import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LISTINGS_LIMIT } from '../../lib/utils';
import ItemCard from '../ui/ItemCard';
import { AuctionCard } from '../ui/AuctionSystem';
import { Monitor, Wrench, Package, Star, Heart, TrendingUp, Crown, Sparkles } from 'lucide-react';

const MarketplaceLanding = ({ onNavigate, onWatchToggle, watchedItems, onItemClick, onAddToCart, cartItems }) => {
  const [listings, setListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isMountedRef = useRef(true);

  const fetchListings = useCallback(async (loadMore = false) => {
    if (!isMountedRef.current) return;
    if (!loadMore) setIsLoading(true);
    try {
      const listingsQuery = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT));
      const auctionsQuery = query(collection(db, 'auctions'), orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT));
      
      const [listingsSnapshot, auctionsSnapshot] = await Promise.all([getDocs(listingsQuery), getDocs(auctionsQuery)]);

      let allItems = [
        ...listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate(), listingType: doc.data().listingType || 'fixed-price' })),
        ...auctionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate(), endTime: doc.data().endTime?.toDate(), listingType: 'auction' }))
      ].sort((a, b) => b.createdAt - a.createdAt);

      // Extract featured listings (high engagement items)
      const featured = allItems
        .filter(item => (item.watchCount || 0) > 5 || (item.views || 0) > 50 || item.listingType === 'auction')
        .sort((a, b) => {
          const scoreA = (a.watchCount || 0) * 2 + (a.views || 0) * 0.1 + (a.listingType === 'auction' ? 20 : 0);
          const scoreB = (b.watchCount || 0) * 2 + (b.views || 0) * 0.1 + (b.listingType === 'auction' ? 20 : 0);
          return scoreB - scoreA;
        })
        .slice(0, 8);

      // Get watchlist items (items user is watching)
      const watchlist = allItems.filter(item => watchedItems.includes(item.id)).slice(0, 6);

      if (!isMountedRef.current) return;
      
      if (loadMore) {
        setListings(prev => [...prev, ...allItems]);
      } else {
        setListings(allItems);
        setFeaturedListings(featured);
        setWatchlistItems(watchlist);
      }
      setHasMoreItems(allItems.length === LISTINGS_LIMIT * 2);
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
    } finally {
      if (!loadMore && isMountedRef.current) setIsLoading(false);
    }
  }, [watchedItems]);

  useEffect(() => {
    fetchListings();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchListings]);

  const handleLoadMore = async () => {
    if (hasMoreItems && !isLoadingMore) {
      setIsLoadingMore(true);
      await fetchListings(true);
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-lg text-gray-300 mb-6">Your one-stop shop for goods and services.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <button onClick={() => onNavigate('digital-goods-landing')} className="flex flex-col items-center justify-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
              <Monitor className="w-8 h-8 mb-2 text-indigo-400" />
              <span className="font-semibold">Digital Goods</span>
            </button>
            <button onClick={() => onNavigate('services-landing')} className="flex flex-col items-center justify-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
              <Wrench className="w-8 h-8 mb-2 text-orange-400" />
              <span className="font-semibold">Services</span>
            </button>
            <button onClick={() => onNavigate('used-goods-landing')} className="flex flex-col items-center justify-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
              <Package className="w-8 h-8 mb-2 text-amber-400" />
              <span className="font-semibold">Used Goods</span>
            </button>
            <button onClick={() => onNavigate('new-goods-landing')} className="flex flex-col items-center justify-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
              <Star className="w-8 h-8 mb-2 text-teal-400" />
              <span className="font-semibold">New Goods</span>
            </button>
          </div>
        </div>
      </div>
      {/* Watchlist Section */}
      {watchlistItems.length > 0 && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-red-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Your Watchlist</h2>
              </div>
              <p className="text-gray-600 mb-4">Items you're keeping an eye on</p>
              <button
                onClick={() => onNavigate('watchlist')}
                className="text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                View All Watched Items →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {watchlistItems.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onItemClick(item)}>
                  <div className="aspect-square bg-gray-200 rounded-md mb-2 overflow-hidden">
                    {item.photos && item.photos[0] && (
                      <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                  <p className="text-green-600 font-bold text-sm">${item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured/Cool Listings Section */}
      {featuredListings.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Featured & Trending</h2>
                <Crown className="w-8 h-8 text-yellow-500 ml-3" />
              </div>
              <p className="text-gray-600">Hot items everyone's talking about</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map(item => (
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
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">All Marketplace Listings</h2>
          </div>
          <p className="text-gray-600">Browse everything available on TuiTrade</p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative aspect-[4/5]">
                  <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            ))}
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
            {hasMoreItems && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketplaceLanding;
