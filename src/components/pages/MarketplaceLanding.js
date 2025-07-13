import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LISTINGS_LIMIT } from '../../lib/utils';
import ItemCard from '../ui/ItemCard';
import { AuctionCard } from '../ui/AuctionSystem';
import { Monitor, Wrench, Package, Star, ChevronDown } from 'lucide-react';

const MarketplaceLanding = ({ onNavigate, onWatchToggle, watchedItems, onItemClick, onAddToCart, cartItems }) => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchListings = useCallback(async (loadMore = false) => {
    if (!loadMore) setIsLoading(true);
    try {
      const listingsQuery = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT));
      const auctionsQuery = query(collection(db, 'auctions'), orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT));
      
      const [listingsSnapshot, auctionsSnapshot] = await Promise.all([getDocs(listingsQuery), getDocs(auctionsQuery)]);

      let allItems = [
        ...listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate(), listingType: doc.data().listingType || 'fixed-price' })),
        ...auctionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate(), endTime: doc.data().endTime?.toDate(), listingType: 'auction' }))
      ].sort((a, b) => b.createdAt - a.createdAt);

      if (loadMore) {
        setListings(prev => [...prev, ...allItems]);
      } else {
        setListings(allItems);
      }
      setHasMoreItems(allItems.length === LISTINGS_LIMIT * 2);
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
    } finally {
      if (!loadMore) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Browse All Listings</h2>
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
