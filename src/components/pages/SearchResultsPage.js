// src/components/pages/SearchResultsPage.js
import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
// Removed unused import
import ItemCard from '../ui/ItemCard';
import JobCard from '../ui/JobCard';
import SearchFilters from '../ui/SearchFilters';
import JobSearchFilters from '../ui/JobSearchFilters';
import { searchJobs, MOCK_JOBS } from '../../lib/jobsData';
import { Search, Grid, List, Home, ChevronRight, Briefcase } from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';

const SearchResultsPage = ({ searchParams, onNavigate, onItemClick, onWatchToggle, watchedItems, onAddToCart, cartItems }) => {
    const { getText } = useTeReo();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchType, setSearchType] = useState(searchParams.searchType || 'items'); // 'items' or 'jobs'
    
    // Filters for regular items
    const [filters, setFilters] = useState({
        category: '',
        priceMin: '',
        priceMax: '',
        location: '',
        condition: '',
        listingType: '',
        tags: [],
        sortBy: 'newest'
    });

    // Filters for jobs
    const [jobFilters, setJobFilters] = useState({
        keywords: '',
        category: '',
        subcategory: '',
        location: '',
        type: '',
        salary: '',
        experience: '',
        workRights: ''
    });

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                console.log('SearchResultsPage: Searching for:', searchParams);

                if (searchType === 'jobs') {
                    // Handle job search
                    let jobResults = [...MOCK_JOBS]; // In real app, this would fetch from API

                    // Apply initial search filters from searchParams
                    if (searchParams.filters) {
                        jobResults = searchJobs(searchParams.filters);
                    } else if (searchParams.keywords && searchParams.keywords.length > 0) {
                        jobResults = searchJobs({ keywords: searchParams.keywords.join(' ') });
                    }

                    setResults(jobResults);
                } else {
                    // Handle regular item search (existing logic)
                    const promises = [];

                    // Get regular listings
                    const listingsQuery = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
                    promises.push(getDocs(listingsQuery));

                    // Get auctions
                    const auctionsQuery = query(collection(db, 'auctions'), orderBy('createdAt', 'desc'));
                    promises.push(getDocs(auctionsQuery));

                    const [listingsSnapshot, auctionsSnapshot] = await Promise.all(promises);

                    // Process listings
                    let listings = listingsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toDate(),
                        listingType: doc.data().listingType || 'fixed-price'
                    }));

                    // Process auctions
                    let auctions = auctionsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toDate(),
                        endTime: doc.data().endTime?.toDate(),
                        listingType: 'auction'
                    }));

                    // Combine all results
                    let allResults = [...listings, ...auctions];

                    console.log('SearchResultsPage: Total items before filtering:', allResults.length);

                    // Apply client-side filtering for keywords
                    if (searchParams.keywords && searchParams.keywords.length > 0) {
                        allResults = allResults.filter(item => {
                            const searchText = `${item.title || ''} ${item.description || ''} ${item.location || ''} ${item.category || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
                            return searchParams.keywords.some(keyword =>
                                searchText.includes(keyword.toLowerCase())
                            );
                        });
                    }

                    console.log('SearchResultsPage: Results after filtering:', allResults.length);

                    // Sort by creation date
                    allResults.sort((a, b) => b.createdAt - a.createdAt);

                    setResults(allResults);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchParams, searchType]);

    const filteredResults = useMemo(() => {
        let filtered = [...results];

        if (searchType === 'jobs') {
            // Apply job-specific filters
            filtered = searchJobs(jobFilters);
        } else {
            // Apply regular item filters
            // Apply category filter
            if (filters.category) {
                filtered = filtered.filter(item => item.category === filters.category);
            }

            // Apply listing type filter
            if (filters.listingType) {
                filtered = filtered.filter(item => item.listingType === filters.listingType);
            }

            // Apply price range filter
            if (filters.priceMin) {
                filtered = filtered.filter(item => {
                    const price = item.listingType === 'auction' ? (item.currentBid || item.startingBid) : item.price;
                    return price >= parseFloat(filters.priceMin);
                });
            }
            if (filters.priceMax) {
                filtered = filtered.filter(item => {
                    const price = item.listingType === 'auction' ? (item.currentBid || item.startingBid) : item.price;
                    return price <= parseFloat(filters.priceMax);
                });
            }

            // Apply location filter
            if (filters.location) {
                filtered = filtered.filter(item => item.location === filters.location);
            }

            // Apply condition filter
            if (filters.condition) {
                filtered = filtered.filter(item => item.condition === filters.condition);
            }

            // Apply tags filter
            if (filters.tags && filters.tags.length > 0) {
                filtered = filtered.filter(item => {
                    const itemTags = item.tags || [];
                    return filters.tags.some(tag =>
                        itemTags.includes(tag) ||
                        item.title?.toLowerCase().includes(tag.toLowerCase()) ||
                        item.description?.toLowerCase().includes(tag.toLowerCase())
                    );
                });
            }

            // Apply sorting
            switch (filters.sortBy) {
                case 'price-low':
                    filtered.sort((a, b) => {
                        const priceA = a.listingType === 'auction' ? (a.currentBid || a.startingBid) : a.price;
                        const priceB = b.listingType === 'auction' ? (b.currentBid || b.startingBid) : b.price;
                        return priceA - priceB;
                    });
                    break;
            case 'price-high':
                filtered.sort((a, b) => {
                    const priceA = a.listingType === 'auction' ? (a.currentBid || a.startingBid) : a.price;
                    const priceB = b.listingType === 'auction' ? (b.currentBid || b.startingBid) : b.price;
                    return priceB - priceA;
                });
                break;
            case 'title-az':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-za':
                filtered.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'popular':
                // Sort by watch count (demo data) or bid count for auctions
                filtered.sort((a, b) => {
                    const popularityA = a.listingType === 'auction' ? (a.bidCount || 0) : (a.watchCount || 0);
                    const popularityB = b.listingType === 'auction' ? (b.bidCount || 0) : (b.watchCount || 0);
                    return popularityB - popularityA;
                });
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        }

        return filtered;
    }, [results, filters, jobFilters, searchType]);

    // Job-specific handlers
    const handleJobClick = (job) => {
        onNavigate('item-detail', { 
            id: job.id, 
            type: 'job',
            job: job 
        });
    };

    const handleSaveJob = (jobId) => {
        console.log('Save job:', jobId);
        // In real app, implement save functionality
    };

    const handleApplyJob = (job) => {
        onNavigate('job-application', { job });
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
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        Home
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">Search Results</span>
                </div>

                {/* Search Type Toggle */}
                <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                            <TeReoText english="Search Type" teReoKey="search" />:
                        </span>
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <button
                                onClick={() => setSearchType('items')}
                                className={`px-4 py-2 text-sm font-medium flex items-center ${
                                    searchType === 'items' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Grid className="mr-2" size={16} />
                                <TeReoText english="Items" teReoKey="marketplace" />
                            </button>
                            <button
                                onClick={() => setSearchType('jobs')}
                                className={`px-4 py-2 text-sm font-medium flex items-center ${
                                    searchType === 'jobs' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Briefcase className="mr-2" size={16} />
                                <TeReoText english="Jobs" teReoKey="jobs" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        <TeReoText english="Search Results" teReoKey="search" />
                        {searchParams.originalQuery && (
                            <span className="text-gray-500 font-normal ml-2">
                                for "{searchParams.originalQuery}"
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-600">
                        {filteredResults.length} {searchType === 'jobs' ? getText('jobs', 'jobs') : 'items'} found
                    </p>
                </div>

                {/* Search Filters */}
                {searchType === 'jobs' ? (
                    <JobSearchFilters
                        onFiltersChange={setJobFilters}
                        initialFilters={jobFilters}
                    />
                ) : (
                    <SearchFilters
                        onFiltersChange={setFilters}
                        currentFilters={filters}
                    />
                )}

                {/* Results */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">View:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {filteredResults.length > 0 ? (
                    <div className={
                        searchType === 'jobs' 
                            ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                            : viewMode === 'grid'
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                : "space-y-4"
                    }>
                        {filteredResults.map(item => (
                            searchType === 'jobs' ? (
                                <JobCard
                                    key={item.id}
                                    job={item}
                                    onJobClick={handleJobClick}
                                    onSaveJob={handleSaveJob}
                                    onApplyJob={handleApplyJob}
                                    isWatched={watchedItems.includes(item.id)}
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
                                    viewMode={viewMode}
                                    onNavigate={onNavigate}
                                />
                            )
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <Search size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">
                            <TeReoText english="No results found" teReoKey="search" />
                        </h3>
                        <p className="text-gray-500 mt-2">
                            <TeReoText english="Try adjusting your filters or search terms" teReoKey="search" />
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;