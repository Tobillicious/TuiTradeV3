// src/components/pages/SearchResultsPage.js
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ItemCard from '../ui/ItemCard';
import JobCard from '../ui/JobCard';
import { AuctionCard } from '../ui/AuctionSystem';
import { Search, Home, ChevronRight, Grid, List } from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { useAuth } from '../../context/AuthContext';
import { trackEvent } from '../../lib/analytics';
import { LISTINGS_LIMIT } from '../../lib/utils';

const SearchResultsPage = () => {
    const { getText } = useTeReo();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [items, setItems] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [searchType, setSearchType] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [watchedItems, setWatchedItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    
    // Extract search parameters from URL
    const searchQuery = searchParams.get('q') || '';
    const categoryFilter = searchParams.get('category') || '';
    const locationFilter = searchParams.get('location') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const condition = searchParams.get('condition') || '';

    // Search functionality
    const searchData = async () => {
        if (!searchQuery && !categoryFilter && !locationFilter) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const promises = [];
            
            // Search listings
            if (searchType === 'all' || searchType === 'items') {
                const listingsQuery = buildListingsQuery();
                promises.push(getDocs(listingsQuery));
            } else {
                promises.push(Promise.resolve({ docs: [] }));
            }
            
            // Search jobs
            if (searchType === 'all' || searchType === 'jobs') {
                const jobsQuery = buildJobsQuery();
                promises.push(getDocs(jobsQuery));
            } else {
                promises.push(Promise.resolve({ docs: [] }));
            }
            
            // Search auctions
            if (searchType === 'all' || searchType === 'auctions') {
                const auctionsQuery = buildAuctionsQuery();
                promises.push(getDocs(auctionsQuery));
            } else {
                promises.push(Promise.resolve({ docs: [] }));
            }

            const [listingsSnapshot, jobsSnapshot, auctionsSnapshot] = await Promise.all(promises);

            // Process listings
            const listingsData = listingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                type: 'listing'
            }));

            // Process jobs
            const jobsData = jobsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                type: 'job'
            }));

            // Process auctions
            const auctionsData = auctionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                endTime: doc.data().endTime?.toDate(),
                type: 'auction'
            }));

            setItems(listingsData);
            setJobs(jobsData);
            setAuctions(auctionsData);
            setTotalResults(listingsData.length + jobsData.length + auctionsData.length);

            // Track search event
            trackEvent('search_performed', {
                query: searchQuery,
                category: categoryFilter,
                location: locationFilter,
                results_count: listingsData.length + jobsData.length + auctionsData.length,
                search_type: searchType
            });

        } catch (error) {
            console.error('Error searching:', error);
            setItems([]);
            setJobs([]);
            setAuctions([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    };

    // Build Firestore queries
    const buildListingsQuery = () => {
        let q = collection(db, 'listings');
        const constraints = [orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT)];
        
        if (categoryFilter) {
            constraints.unshift(where('category', '==', categoryFilter));
        }
        
        return query(q, ...constraints);
    };

    const buildJobsQuery = () => {
        let q = collection(db, 'jobs');
        const constraints = [orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT)];
        
        if (locationFilter) {
            constraints.unshift(where('location', '==', locationFilter));
        }
        
        return query(q, ...constraints);
    };

    const buildAuctionsQuery = () => {
        let q = collection(db, 'auctions');
        const constraints = [orderBy('createdAt', 'desc'), limit(LISTINGS_LIMIT)];
        
        if (categoryFilter) {
            constraints.unshift(where('category', '==', categoryFilter));
        }
        
        return query(q, ...constraints);
    };

    // Load search results when parameters change
    useEffect(() => {
        searchData();
    }, [searchQuery, categoryFilter, locationFilter, searchType, minPrice, maxPrice, condition]);

    // Filtered and sorted results
    const filteredResults = useMemo(() => {
        let allResults = [];
        
        if (searchType === 'all') {
            allResults = [...items, ...jobs, ...auctions];
        } else if (searchType === 'items') {
            allResults = items;
        } else if (searchType === 'jobs') {
            allResults = jobs;
        } else if (searchType === 'auctions') {
            allResults = auctions;
        }

        // Apply text search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            allResults = allResults.filter(item => 
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query) ||
                item.location?.toLowerCase().includes(query)
            );
        }

        // Apply price filter
        if (minPrice || maxPrice) {
            allResults = allResults.filter(item => {
                const price = item.price || item.salary || item.currentBid || 0;
                const min = parseFloat(minPrice) || 0;
                const max = parseFloat(maxPrice) || Infinity;
                return price >= min && price <= max;
            });
        }

        // Apply condition filter
        if (condition) {
            allResults = allResults.filter(item => item.condition === condition);
        }

        // Sort results
        allResults.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'price_low':
                    return (a.price || a.salary || a.currentBid || 0) - (b.price || b.salary || b.currentBid || 0);
                case 'price_high':
                    return (b.price || b.salary || b.currentBid || 0) - (a.price || a.salary || a.currentBid || 0);
                case 'popularity':
                    return (b.views || 0) - (a.views || 0);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return allResults;
    }, [searchType, items, jobs, auctions, searchQuery, minPrice, maxPrice, condition, sortBy]);

    // Event handlers
    const handleItemClick = (item) => {
        if (item.type === 'job') {
            navigate(`/job-application/${item.id}`);
        } else if (item.type === 'auction') {
            navigate(`/auction/${item.id}`);
        } else {
            navigate(`/item/${item.id}`);
        }
        
        trackEvent('search_result_click', {
            item_id: item.id,
            item_type: item.type,
            search_query: searchQuery,
            position: filteredResults.indexOf(item)
        });
    };

    const handleSaveItem = (itemId) => {
        setWatchedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleApplyFilters = (newFilters) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (newFilters.category) params.set('category', newFilters.category);
        if (newFilters.location) params.set('location', newFilters.location);
        if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
        if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
        if (newFilters.condition) params.set('condition', newFilters.condition);
        
        navigate(`/search?${params.toString()}`);
    };

    const handleSearchTypeChange = (type) => {
        setSearchType(type);
        trackEvent('search_type_change', { type, query: searchQuery });
    };


    if (loading) {
        return (
            <div className="bg-gray-50 flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb Skeleton */}
                    <div className="mb-6 flex items-center">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-4 mx-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>

                    {/* Header Skeleton */}
                    <div className="mb-6">
                        <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                    </div>

                    {/* Filters Skeleton */}
                    <div className="mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* View Controls Skeleton */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                            <div className="flex gap-2">
                                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Results Skeleton */}
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
        );
    }

    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <button onClick={() => navigate('/')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        <TeReoText english="Home" teReoKey="home" />
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">
                        <TeReoText english="Search Results" teReoKey="searchResults" />
                    </span>
                </div>

                {/* Search Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Search Type Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {['all', 'items', 'jobs', 'auctions'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleSearchTypeChange(type)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        searchType === type
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <TeReoText 
                                        english={type.charAt(0).toUpperCase() + type.slice(1)} 
                                        teReoKey={type} 
                                    />
                                    {type !== 'all' && (
                                        <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                                            {type === 'items' ? items.length : 
                                             type === 'jobs' ? jobs.length : 
                                             type === 'auctions' ? auctions.length : 0}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Sort and View Controls */}
                        <div className="flex items-center gap-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="popularity">Most Popular</option>
                            </select>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg ${
                                        viewMode === 'grid'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg ${
                                        viewMode === 'list'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(searchQuery || categoryFilter || locationFilter || minPrice || maxPrice) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {searchQuery && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    Query: "{searchQuery}"
                                </span>
                            )}
                            {categoryFilter && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    Category: {categoryFilter}
                                </span>
                            )}
                            {locationFilter && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                    Location: {locationFilter}
                                </span>
                            )}
                            {(minPrice || maxPrice) && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                    Price: ${minPrice || '0'} - ${maxPrice || '∞'}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        <TeReoText english="Search Results" teReoKey="searchResults" />
                        {searchQuery && (
                            <span className="text-gray-500 font-normal ml-2">
                                for "{searchQuery}"
                            </span>
                        )}
                    </h1>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">
                            <span className="font-semibold">{filteredResults.length}</span> results found
                            {totalResults > filteredResults.length && (
                                <span className="text-sm text-gray-500 ml-2">
                                    (filtered from {totalResults} total)
                                </span>
                            )}
                        </p>
                        
                        {searchQuery && (
                            <button
                                onClick={() => navigate('/search')}
                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                {filteredResults.length === 0 ? (
                    <div className="text-center py-12">
                        <Search size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            <TeReoText 
                                english={`No ${searchType === 'all' ? 'results' : searchType} found`} 
                                teReoKey="noResults" 
                            />
                        </h3>
                        <p className="text-gray-500 mb-4">
                            <TeReoText 
                                english="Try adjusting your search criteria" 
                                teReoKey="tryAdjusting" 
                            />
                        </p>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>• Try different keywords</p>
                            <p>• Remove some filters</p>
                            <p>• Check spelling</p>
                            <p>• Try broader categories</p>
                        </div>
                        <button
                            onClick={() => navigate('/search')}
                            className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <TeReoText english="Start New Search" teReoKey="newSearch" />
                        </button>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                        }`}>
                        {filteredResults.map((item) => {
                            if (item.type === 'job') {
                                return (
                                    <JobCard
                                        key={item.id}
                                        job={item}
                                        onSaveJob={() => handleSaveItem(item.id)}
                                        onApplyJob={() => navigate(`/job-application/${item.id}`)}
                                        onJobClick={() => handleItemClick(item)}
                                        isWatched={watchedItems.includes(item.id)}
                                        compact={viewMode === 'list'}
                                    />
                                );
                            } else if (item.type === 'auction') {
                                return (
                                    <AuctionCard
                                        key={item.id}
                                        auction={item}
                                        onItemClick={() => handleItemClick(item)}
                                        onWatchToggle={() => handleSaveItem(item.id)}
                                        watchedItems={watchedItems}
                                        onNavigate={(path) => navigate(path)}
                                    />
                                );
                            } else {
                                return (
                                    <ItemCard
                                        key={item.id}
                                        item={item}
                                        onWatchToggle={() => handleSaveItem(item.id)}
                                        onItemClick={() => handleItemClick(item)}
                                        onAddToCart={() => setCartItems(prev => [...prev, item])}
                                        isWatched={watchedItems.includes(item.id)}
                                        isInCart={cartItems.some(cartItem => cartItem.id === item.id)}
                                        viewMode={viewMode}
                                        onNavigate={(path) => navigate(path)}
                                    />
                                );
                            }
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;