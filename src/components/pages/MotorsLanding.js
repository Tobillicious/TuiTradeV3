import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LISTINGS_LIMIT } from '../../lib/utils';
import ItemCard from '../ui/ItemCard';
import { AuctionCard } from '../ui/AuctionSystem';
import { Car, Bike, Anchor, Wrench, Star, TrendingUp, Crown, Sparkles, Fuel, Gauge, Shield, Zap } from 'lucide-react';
import { getBilingualText, TE_REO_TRANSLATIONS } from '../../lib/nzLocalizationEnhanced';

const MotorsLanding = ({ onNavigate, onWatchToggle, watchedItems, onItemClick, onAddToCart, cartItems }) => {
  const [listings, setListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
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

      // Filter for motors-related items
      const motorsItems = allItems.filter(item => 
        item.category === 'motors' || 
        item.subcategory === 'cars' || 
        item.subcategory === 'motorcycles' || 
        item.subcategory === 'boats' || 
        item.subcategory === 'parts' ||
        item.title?.toLowerCase().includes('car') ||
        item.title?.toLowerCase().includes('motorcycle') ||
        item.title?.toLowerCase().includes('boat') ||
        item.title?.toLowerCase().includes('part')
      );

      // Extract featured listings (high engagement items)
      const featured = motorsItems
        .filter(item => (item.watchCount || 0) > 5 || (item.views || 0) > 50 || item.listingType === 'auction')
        .sort((a, b) => {
          const scoreA = (a.watchCount || 0) * 2 + (a.views || 0) * 0.1 + (a.listingType === 'auction' ? 20 : 0);
          const scoreB = (b.watchCount || 0) * 2 + (b.views || 0) * 0.1 + (b.listingType === 'auction' ? 20 : 0);
          return scoreB - scoreA;
        })
        .slice(0, 8);

      if (!isMountedRef.current) return;
      
      if (loadMore) {
        setListings(prev => [...prev, ...motorsItems]);
      } else {
        setListings(motorsItems);
        setFeaturedListings(featured);
      }
      setHasMoreItems(motorsItems.length === LISTINGS_LIMIT * 2);
    } catch (error) {
      console.error('Error fetching motors listings:', error);
    } finally {
      if (!loadMore && isMountedRef.current) setIsLoading(false);
    }
  }, []);

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

  const motorCategories = [
    { name: 'Cars', icon: <Car className="w-6 h-6" />, color: 'text-blue-500', route: 'motors-landing' },
    { name: 'Motorcycles', icon: <Bike className="w-6 h-6" />, color: 'text-red-500', route: 'motors-landing' },
    { name: 'Boats', icon: <Anchor className="w-6 h-6" />, color: 'text-cyan-500', route: 'motors-landing' },
    { name: 'Parts', icon: <Wrench className="w-6 h-6" />, color: 'text-orange-500', route: 'motors-landing' },
    { name: 'Commercial', icon: <Car className="w-6 h-6" />, color: 'text-green-500', route: 'motors-landing' },
    { name: 'Classic', icon: <Star className="w-6 h-6" />, color: 'text-yellow-500', route: 'motors-landing' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {getBilingualText('Find Your Perfect Ride', 'find_ride')}
          </h1>
          <p className="text-xl mb-2 text-red-200">
            {TE_REO_TRANSLATIONS.greetings.hello}! {getBilingualText('Cars, motorcycles, boats, and parts', 'motors_description')}
          </p>
          <p className="text-lg mb-8 text-red-100">
            {getBilingualText('Quality vehicles across Aotearoa', 'quality_vehicles')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={() => onNavigate('search-results', { category: 'motors' })}
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all transform hover:scale-105 shadow-lg"
            >
              <Car className="inline mr-2" size={20} />
              {getBilingualText('Browse Motors', 'browse_motors')}
            </button>
            <button 
              onClick={() => onNavigate('create-listing', { category: 'motors' })}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-all"
            >
              {getBilingualText('Sell Your Vehicle', 'sell_vehicle')}
            </button>
          </div>
          
          {/* Motor Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {motorCategories.map((category, index) => (
              <button 
                key={index}
                onClick={() => onNavigate(category.route, { subcategory: category.name.toLowerCase() })}
                className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <div className={`${category.color} mb-2`}>
                  {category.icon}
                </div>
                <span className="font-semibold text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Motors Section */}
      {featuredListings.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-red-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Featured Vehicles</h2>
                <Crown className="w-8 h-8 text-yellow-500 ml-3" />
              </div>
              <p className="text-gray-600">Premium vehicles with great value and condition</p>
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

      {/* All Motors Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">All Motor Vehicles</h2>
          </div>
          <p className="text-gray-600">Browse all available vehicles and parts on TuiTrade</p>
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
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kāore anō he waka</h3>
              <p className="text-gray-500 mb-2">No vehicles listed yet</p>
              <p className="text-gray-500 mb-6">Be the first to list a vehicle on TuiTrade!</p>
              <p className="text-sm text-gray-400 italic">Tīmata mai - Start here</p>
              <button
                onClick={() => onNavigate('create-listing', { category: 'motors' })}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                List First Vehicle
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
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Car className="w-5 h-5 mr-2" />
                      Load More Vehicles
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 italic">
                  Kia kaha - Keep going!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TuiTrade Motors?</h2>
            <p className="text-gray-600">Trusted by thousands of Kiwis for quality vehicles</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Sellers</h3>
              <p className="text-gray-600">All sellers are verified for your peace of mind</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gauge className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-gray-600">All vehicles meet our quality standards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Fuel className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing across all vehicle types</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorsLanding;
