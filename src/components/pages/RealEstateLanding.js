import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LISTINGS_LIMIT } from '../../lib/utils';
import ItemCard from '../ui/ItemCard';
import { AuctionCard } from '../ui/AuctionSystem';
import { Home, Building, MapPin, DollarSign, Star, TrendingUp, Crown, Sparkles, Shield, Users, Award, Zap } from 'lucide-react';
import { getBilingualText, TE_REO_TRANSLATIONS } from '../../lib/nzLocalizationEnhanced';

const RealEstateLanding = ({ onNavigate, onWatchToggle, watchedItems, onItemClick, onAddToCart, cartItems }) => {
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

      // Filter for real estate-related items
      const realEstateItems = allItems.filter(item =>
        item.category === 'real-estate' ||
        item.subcategory === 'houses' ||
        item.subcategory === 'apartments' ||
        item.subcategory === 'commercial' ||
        item.subcategory === 'land' ||
        item.title?.toLowerCase().includes('house') ||
        item.title?.toLowerCase().includes('apartment') ||
        item.title?.toLowerCase().includes('property') ||
        item.title?.toLowerCase().includes('land') ||
        item.title?.toLowerCase().includes('commercial')
      );

      // Extract featured listings (high engagement items)
      const featured = realEstateItems
        .filter(item => (item.watchCount || 0) > 5 || (item.views || 0) > 50 || item.listingType === 'auction')
        .sort((a, b) => {
          const scoreA = (a.watchCount || 0) * 2 + (a.views || 0) * 0.1 + (a.listingType === 'auction' ? 20 : 0);
          const scoreB = (b.watchCount || 0) * 2 + (b.views || 0) * 0.1 + (b.listingType === 'auction' ? 20 : 0);
          return scoreB - scoreA;
        })
        .slice(0, 8);

      if (!isMountedRef.current) return;

      if (loadMore) {
        setListings(prev => [...prev, ...realEstateItems]);
      } else {
        setListings(realEstateItems);
        setFeaturedListings(featured);
      }
      setHasMoreItems(realEstateItems.length === LISTINGS_LIMIT * 2);
    } catch (error) {
      console.error('Error fetching real estate listings:', error);
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

  const propertyCategories = [
    { name: 'Houses', icon: <Home className="w-6 h-6" />, color: 'text-green-500', route: 'real-estate-landing' },
    { name: 'Apartments', icon: <Building className="w-6 h-6" />, color: 'text-blue-500', route: 'real-estate-landing' },
    { name: 'Commercial', icon: <Building className="w-6 h-6" />, color: 'text-purple-500', route: 'real-estate-landing' },
    { name: 'Land', icon: <MapPin className="w-6 h-6" />, color: 'text-yellow-500', route: 'real-estate-landing' },
    { name: 'Rentals', icon: <Home className="w-6 h-6" />, color: 'text-orange-500', route: 'real-estate-landing' },
    { name: 'Luxury', icon: <Star className="w-6 h-6" />, color: 'text-pink-500', route: 'real-estate-landing' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {getBilingualText('Find Your Dream Home', 'find_home')}
          </h1>
          <p className="text-xl mb-2 text-green-200">
            {TE_REO_TRANSLATIONS.greetings.hello}! {getBilingualText('Properties across Aotearoa', 'properties_description')}
          </p>
          <p className="text-lg mb-8 text-green-100">
            {getBilingualText('Houses, apartments, commercial properties, and land', 'property_types')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => onNavigate('search-results', { category: 'real-estate' })}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg"
            >
              <Home className="inline mr-2" size={20} />
              {getBilingualText('Browse Properties', 'browse_properties')}
            </button>
            <button
              onClick={() => onNavigate('create-listing', { category: 'real-estate' })}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all"
            >
              {getBilingualText('List Your Property', 'list_property')}
            </button>
          </div>

          {/* Property Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {propertyCategories.map((category, index) => (
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

      {/* Featured Properties Section */}
      {featuredListings.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-green-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
                <Crown className="w-8 h-8 text-yellow-500 ml-3" />
              </div>
              <p className="text-gray-600">Premium properties in prime locations</p>
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

      {/* All Properties Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">All Properties</h2>
          </div>
          <p className="text-gray-600">Browse all available properties on TuiTrade</p>
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
                <Home className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kāore anō he kāinga</h3>
              <p className="text-gray-500 mb-2">No properties listed yet</p>
              <p className="text-gray-500 mb-6">Be the first to list a property on TuiTrade!</p>
              <p className="text-sm text-gray-400 italic">Tīmata mai - Start here</p>
              <button
                onClick={() => onNavigate('create-listing', { category: 'real-estate' })}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                List First Property
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
                      <Home className="w-5 h-5 mr-2" />
                      Load More Properties
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TuiTrade Real Estate?</h2>
            <p className="text-gray-600">Trusted by thousands of Kiwis for property transactions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
              <p className="text-gray-600">All property transactions are protected and verified</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">Professional support throughout your property journey</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Value</h3>
              <p className="text-gray-600">Competitive pricing and transparent fees</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealEstateLanding;
