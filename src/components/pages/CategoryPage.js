// src/components/pages/CategoryPage.js
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CATEGORIES, LISTINGS_LIMIT } from '../../lib/utils';
import { FullPageLoader } from '../ui/Loaders';
import ItemCard from '../ui/ItemCard';
import { Home, ChevronRight, Tag, Grid, List as ListIcon, SlidersHorizontal } from 'lucide-react';
import { AuctionCard } from '../ui/AuctionSystem';

const CategoryPage = ({ categoryKey, subcategoryKey, onNavigate, onItemClick, onWatchToggle, watchedItems, onAddToCart, cartItems }) => {
    const [listings, setListings] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryKey || '');
    const [selectedTags, setSelectedTags] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    const category = CATEGORIES[categoryKey];

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            console.log('CategoryPage: Fetching listings for category:', categoryKey);
            console.log('CategoryPage: Subcategory:', selectedSubcategory);
            console.log('CategoryPage: Tags:', selectedTags);
            
            const promises = [];

            // Base constraints for both listings and auctions
            let baseConstraints = [where('category', '==', categoryKey)];

            if (selectedSubcategory) {
                baseConstraints.push(where('subcategory', '==', selectedSubcategory));
            }

            if (selectedTags.length > 0) {
                baseConstraints.push(where('tags', 'array-contains-any', selectedTags));
            }

            // Sort order based on selection
            let orderField = 'createdAt';
            let orderDirection = 'desc';

            if (sortBy === 'price-low') {
                orderField = 'price';
                orderDirection = 'asc';
            } else if (sortBy === 'price-high') {
                orderField = 'price';
                orderDirection = 'desc';
            }

            // Fetch regular listings if category supports them
            if (category.listingTypes.includes('fixed-price') || category.listingTypes.includes('classified')) {
                const listingsConstraints = [
                    ...baseConstraints,
                    orderBy(orderField, orderDirection),
                    limit(LISTINGS_LIMIT)
                ];

                const listingsQuery = query(collection(db, 'listings'), ...listingsConstraints);
                promises.push(getDocs(listingsQuery));
            }

            // Fetch auctions if category supports them
            if (category.listingTypes.includes('auction')) {
                const auctionsConstraints = [
                    ...baseConstraints,
                    orderBy(orderField === 'price' ? 'currentBid' : orderField, orderDirection),
                    limit(LISTINGS_LIMIT)
                ];

                const auctionsQuery = query(collection(db, 'auctions'), ...auctionsConstraints);
                promises.push(getDocs(auctionsQuery));
            }

            const results = await Promise.all(promises);

            let newListings = [];
            let newAuctions = [];

            // Handle listings results
            if (results[0] && (category.listingTypes.includes('fixed-price') || category.listingTypes.includes('classified'))) {
                newListings = results[0].docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    listingType: 'fixed-price'
                }));
            }

            // Handle auctions results
            const auctionResultIndex = category.listingTypes.includes('auction') ?
                (category.listingTypes.includes('fixed-price') || category.listingTypes.includes('classified') ? 1 : 0) : -1;

            if (auctionResultIndex >= 0 && results[auctionResultIndex]) {
                newAuctions = results[auctionResultIndex].docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    endTime: doc.data().endTime?.toDate(),
                    listingType: 'auction'
                }));
            }

            console.log('CategoryPage: Found listings:', newListings.length);
            console.log('CategoryPage: Found auctions:', newAuctions.length);
            console.log('CategoryPage: Listings data:', newListings);
            console.log('CategoryPage: Auctions data:', newAuctions);
            
            setListings(newListings);
            setAuctions(newAuctions);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    }, [categoryKey, selectedSubcategory, selectedTags, sortBy, category.listingTypes]);

    useEffect(() => {
        if (category) {
            fetchListings();
        }
    }, [fetchListings, category]);

    const handleSubcategoryChange = (subcategoryKey) => {
        setSelectedSubcategory(subcategoryKey);
        setSelectedTags([]);
    };

    const handleTagToggle = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const allItems = [...listings, ...auctions].sort((a, b) => {
        if (sortBy === 'price-low') {
            const priceA = a.price || a.currentBid || a.startingBid || 0;
            const priceB = b.price || b.currentBid || b.startingBid || 0;
            return priceA - priceB;
        } else if (sortBy === 'price-high') {
            const priceA = a.price || a.currentBid || a.startingBid || 0;
            const priceB = b.price || b.currentBid || b.startingBid || 0;
            return priceB - priceA;
        }
        return b.createdAt - a.createdAt;
    });

    if (loading) {
        return <FullPageLoader message="Loading listings..." />;
    }

    if (!category) {
        return (
            <div className="bg-gray-50 flex-grow flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Category not found</p>
                    <button
                        onClick={() => onNavigate('home')}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const selectedSubcategoryData = selectedSubcategory ? category.subcategories?.[selectedSubcategory] : null;

    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        Home
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">{category.name}</span>
                    {selectedSubcategoryData && (
                        <>
                            <ChevronRight size={16} className="mx-2" />
                            <span className="font-semibold text-gray-700">{selectedSubcategoryData.name}</span>
                        </>
                    )}
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedSubcategoryData ? selectedSubcategoryData.name : category.name}
                    </h1>
                    <p className="text-gray-600">
                        {allItems.length} items • {category.listingTypes.join(' & ')} listings
                    </p>
                </div>

                {/* Filters and Controls */}
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center"
                        >
                            <SlidersHorizontal size={16} className="mr-2" />
                            Filters
                        </button>

                        {/* Sort and View Controls */}
                        <div className="flex items-center space-x-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>

                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
                                >
                                    <ListIcon size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
                        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                            {/* Subcategories */}
                            {category.subcategories && (
                                <div>
                                    <h3 className="font-semibold mb-3">Categories</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleSubcategoryChange('')}
                                            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedSubcategory ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            All {category.name}
                                        </button>
                                        {Object.entries(category.subcategories).map(([key, subcategory]) => (
                                            <button
                                                key={key}
                                                onClick={() => handleSubcategoryChange(key)}
                                                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedSubcategory === key ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {subcategory.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {selectedSubcategoryData?.tags && (
                                <div>
                                    <h3 className="font-semibold mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSubcategoryData.tags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagToggle(tag)}
                                                className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {allItems.length === 0 ? (
                            <div className="text-center py-12">
                                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                                <p className="text-gray-600">Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                    : 'grid-cols-1'
                                }`}>
                                {allItems.map(item => (
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
                                            isWatched={watchedItems?.includes(item.id) || false}
                                            onWatchToggle={onWatchToggle}
                                            onItemClick={onItemClick}
                                            onAddToCart={onAddToCart}
                                            isInCart={cartItems?.some(cartItem => cartItem.id === item.id) || false}
                                            viewMode={viewMode}
                                            onNavigate={onNavigate}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;