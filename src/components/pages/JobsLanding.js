// Jobs Landing Page - Seek.co.nz Style Employment Portal
// Complete job marketplace with advanced search and filtering

import React, { useState, useEffect } from 'react';
import { 
    Search, MapPin, Briefcase, TrendingUp, Clock, 
    Users, Building, Star, ChevronRight, Filter,
    Award, Target, Zap, Globe, Heart
} from 'lucide-react';
import JobSearchFilters from '../ui/JobSearchFilters';
import JobCard from '../ui/JobCard';
import JobDetailModal from '../modals/JobDetailModal';
import { 
    JOB_CATEGORIES, 
    MOCK_JOBS, 
    getAllCategories, 
    searchJobs,
    NZ_LOCATIONS
} from '../../lib/jobsData';

const JobsLanding = ({ user, onNavigate, onItemClick, watchedItems = [], onWatchToggle }) => {
    const [searchFilters, setSearchFilters] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showJobDetail, setShowJobDetail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [quickSearch, setQuickSearch] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    useEffect(() => {
        // Initialize with featured jobs
        setSearchResults(MOCK_JOBS);
    }, []);

    const handleFiltersChange = (filters) => {
        setSearchFilters(filters);
        setIsLoading(true);
        
        // Simulate API call delay
        setTimeout(() => {
            const results = searchJobs(filters);
            setSearchResults(results);
            setIsLoading(false);
        }, 300);
    };

    const handleQuickSearch = (e) => {
        e.preventDefault();
        const filters = {
            keywords: quickSearch,
            location: selectedLocation
        };
        setSearchFilters(filters);
        handleFiltersChange(filters);
    };

    const handleJobClick = (job) => {
        setSelectedJob(job);
        setShowJobDetail(true);
    };

    const handleApplyJob = (job, applicationData) => {
        console.log('Applying for job:', job.title, 'with data:', applicationData);
        // In real app, submit application
        alert(`Application submitted for ${job.title}!`);
    };

    const handleSaveJob = (jobId) => {
        if (onWatchToggle) {
            onWatchToggle(jobId);
        }
    };

    const handleCategoryClick = (categoryKey) => {
        const filters = { category: categoryKey };
        setSearchFilters(filters);
        handleFiltersChange(filters);
    };

    const handleLocationClick = (locationKey) => {
        const filters = { location: locationKey };
        setSearchFilters(filters);
        handleFiltersChange(filters);
    };

    const featuredJobs = MOCK_JOBS.filter(job => job.featured);
    const categories = getAllCategories();

    const topCategories = categories.slice(0, 8);
    const topLocations = Object.entries(NZ_LOCATIONS).slice(0, 6);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section - Seek Style */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Find Your Perfect Job
                        </h1>
                        <p className="text-xl mb-8 text-blue-100">
                            New Zealand's largest job board with thousands of opportunities
                        </p>
                        
                        {/* Quick Search */}
                        <form onSubmit={handleQuickSearch} className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg shadow-lg p-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={quickSearch}
                                            onChange={(e) => setQuickSearch(e.target.value)}
                                            placeholder="Job title, keywords, or company"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg"
                                        />
                                    </div>
                                    
                                    <div className="md:w-64 relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <select
                                            value={selectedLocation}
                                            onChange={(e) => setSelectedLocation(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        >
                                            <option value="">All New Zealand</option>
                                            {Object.entries(NZ_LOCATIONS).map(([key, location]) => (
                                                <option key={key} value={key}>{location.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap"
                                    >
                                        Search Jobs
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Quick Stats */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-100">15,247</div>
                                <div className="text-sm text-blue-200">Job Listings</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-100">3,892</div>
                                <div className="text-sm text-blue-200">Companies</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-100">1,247</div>
                                <div className="text-sm text-blue-200">New This Week</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <JobSearchFilters 
                    onFiltersChange={handleFiltersChange}
                    initialFilters={searchFilters}
                />
            </div>

            {/* Featured Jobs Section */}
            {featuredJobs.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
                        <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                            <span className="text-sm">View all featured</span>
                            <ChevronRight size={16} className="ml-1" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {featuredJobs.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onJobClick={handleJobClick}
                                onSaveJob={handleSaveJob}
                                onApplyJob={handleApplyJob}
                                isWatched={watchedItems.includes(job.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Job Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {searchFilters.keywords || searchFilters.category || searchFilters.location 
                            ? 'Search Results' 
                            : 'Latest Jobs'
                        }
                    </h2>
                    <div className="text-sm text-gray-600">
                        {searchResults.length} {searchResults.length === 1 ? 'job' : 'jobs'} found
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Searching for jobs...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {searchResults.length > 0 ? (
                            searchResults.map(job => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onJobClick={handleJobClick}
                                    onSaveJob={handleSaveJob}
                                    onApplyJob={handleApplyJob}
                                    isWatched={watchedItems.includes(job.id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Search size={48} className="mx-auto" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                                <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                                <button 
                                    onClick={() => setSearchFilters({})}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Browse by Category */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
                        <p className="text-gray-600">Explore jobs across different industries</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topCategories.map((category) => (
                            <div 
                                key={category.key}
                                onClick={() => handleCategoryClick(category.key)}
                                className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-3xl">{category.icon}</div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {category.jobCount}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                                    {category.name}
                                </h3>
                                <div className="flex items-center text-gray-600 group-hover:text-blue-600">
                                    <span className="text-sm">View jobs</span>
                                    <ChevronRight size={16} className="ml-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Browse by Location */}
            <div className="bg-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Locations</h2>
                        <p className="text-gray-600">Find jobs in New Zealand's major cities</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topLocations.map(([key, location]) => (
                            <div 
                                key={key}
                                onClick={() => handleLocationClick(key)}
                                className="bg-white rounded-lg p-6 hover:shadow-lg cursor-pointer transition-shadow group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                            {location.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{location.region}</p>
                                    </div>
                                    <div className="flex items-center text-gray-600 group-hover:text-blue-600">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Job Detail Modal */}
            <JobDetailModal
                job={selectedJob}
                isOpen={showJobDetail}
                onClose={() => setShowJobDetail(false)}
                onApplyJob={handleApplyJob}
                onSaveJob={handleSaveJob}
                isWatched={selectedJob && watchedItems.includes(selectedJob.id)}
                currentUser={user}
            />
        </div>
    );
};

export default JobsLanding;