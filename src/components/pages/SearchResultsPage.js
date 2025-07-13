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
import { FullPageLoader } from '../ui/Loaders';
import { JOB_CATEGORIES, JOB_TYPES, SALARY_RANGES, EXPERIENCE_LEVELS, WORK_RIGHTS, NZ_LOCATIONS } from '../../lib/jobsData';
import jobService from '../../lib/jobsService';

const SearchResultsPage = ({ searchParams, onNavigate }) => {
    const { getText } = useTeReo();
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [items, setItems] = useState([]);
    const [searchType, setSearchType] = useState('jobs');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [jobFilters, setJobFilters] = useState({});
    const [watchedItems, setWatchedItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [filters, setFilters] = useState({
        category: searchParams?.category || '',
        subcategory: searchParams?.subcategory || '',
        location: searchParams?.location || '',
        type: searchParams?.type || '',
        salary: searchParams?.salary || '',
        experience: searchParams?.experience || '',
        workRights: searchParams?.workRights || '',
        keywords: searchParams?.keywords || ''
    });

    // Initialize job service
    useEffect(() => {
        jobService.initialize();
    }, []);

    // Load jobs from real service
    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);
                const jobResults = await jobService.searchJobs(filters, { limit: 100 });
                setJobs(jobResults);
            } catch (error) {
                console.error('Error loading jobs:', error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, [filters]);

    // Filtered results based on search type
    const filteredResults = useMemo(() => {
        return searchType === 'jobs' ? jobs : items;
    }, [searchType, jobs, items]);

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

    // Item-specific handlers
    const onWatchToggle = (itemId) => {
        setWatchedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const onItemClick = (item) => {
        onNavigate('item-detail', { id: item.id, item });
    };

    const onAddToCart = (item) => {
        setCartItems(prev => [...prev, item]);
    };

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
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
                                className={`px-4 py-2 text-sm font-medium flex items-center ${searchType === 'items'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Grid className="mr-2" size={16} />
                                <TeReoText english="Items" teReoKey="marketplace" />
                            </button>
                            <button
                                onClick={() => setSearchType('jobs')}
                                className={`px-4 py-2 text-sm font-medium flex items-center ${searchType === 'jobs'
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

                {/* Filters */}
                {searchType === 'jobs' && (
                    <div className="mb-6">
                        <JobSearchFilters
                            onFiltersChange={setJobFilters}
                            initialFilters={jobFilters}
                        />
                    </div>
                )}

                {/* View Controls */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {filteredResults.length} results
                        </span>
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {filteredResults.length === 0 ? (
                    <div className="text-center py-12">
                        <Search size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No {searchType} found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                        }`}>
                        {filteredResults.map((item) => (
                            searchType === 'jobs' ? (
                                <JobCard
                                    key={item.id}
                                    job={item}
                                    onSaveJob={handleSaveJob}
                                    onApplyJob={handleApplyJob}
                                    onJobClick={handleJobClick}
                                    isWatched={watchedItems.includes(item.id)}
                                    compact={viewMode === 'list'}
                                />
                            ) : (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    onWatchToggle={onWatchToggle}
                                    onClick={onItemClick}
                                    onAddToCart={onAddToCart}
                                    isWatched={watchedItems.includes(item.id)}
                                    isInCart={cartItems.some(cartItem => cartItem.id === item.id)}
                                    viewMode={viewMode}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;