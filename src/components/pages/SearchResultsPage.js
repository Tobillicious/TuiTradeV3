// src/components/pages/SearchResultsPage.js
import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FullPageLoader } from '../ui/Loaders';
import ItemCard from '../ui/ItemCard';
import SearchFilters from '../ui/SearchFilters';
import { Search, Grid, List, Home, ChevronRight } from 'lucide-react';

const SearchResultsPage = ({ searchParams, onNavigate, onItemClick, onWatchToggle, watchedItems, onAddToCart, cartItems }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        category: '',
        priceMin: '',
        priceMax: '',
        location: '',
        condition: '',
        sortBy: 'newest'
    });

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                console.log('SearchResultsPage: Searching for:', searchParams);
                
                // Fetch from both listings and auctions collections
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
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchParams]);

    const filteredResults = useMemo(() => {
        let filtered = [...results];

        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        // Apply price range filter
        if (filters.priceMin) {
            filtered = filtered.filter(item => item.price >= parseFloat(filters.priceMin));
        }
        if (filters.priceMax) {
            filtered = filtered.filter(item => item.price <= parseFloat(filters.priceMax));
        }

        // Apply location filter
        if (filters.location) {
            filtered = filtered.filter(item => item.location === filters.location);
        }

        // Apply condition filter
        if (filters.condition) {
            filtered = filtered.filter(item => item.condition === filters.condition);
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
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
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return filtered;
    }, [results, filters]);

    if (loading) return <FullPageLoader message="Searching..." />;

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

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Search Results
                        {searchParams.originalQuery && (
                            <span className="text-gray-500 font-normal ml-2">
                                for "{searchParams.originalQuery}"
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-600">{filteredResults.length} items found</p>
                </div>

                {/* Search Filters */}
                <SearchFilters
                    onFiltersChange={setFilters}
                    currentFilters={filters}
                />

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
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-4"
                    }>
                        {filteredResults.map(item => (
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
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <Search size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">No results found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;