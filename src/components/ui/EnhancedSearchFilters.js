// =============================================
// EnhancedSearchFilters.js - Advanced Search & Filtering UI
// --------------------------------------------------------
// Provides advanced, category-specific search filters and real-time filtering UI.
// Used on landing pages and search results for improved discoverability.
// =============================================
// Enhanced Search Filters Component
// Combines marketplace and job search with category-specific filters

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, MapPin, DollarSign, Clock, Briefcase,
    ChevronDown, ChevronUp, Filter, X, Check, Star,
    Grid, List, Sliders, Save, Bell
} from 'lucide-react';
import {
    JOB_CATEGORIES, JOB_TYPES, SALARY_RANGES, WORK_RIGHTS,
    EXPERIENCE_LEVELS, NZ_LOCATIONS
} from '../../lib/jobsData';
import { ENHANCED_CATEGORIES } from '../../lib/enhancedCategories';
import { NZ_REGIONS } from '../../lib/nzLocalization';
import { useTeReo, TeReoText } from './TeReoToggle';

const EnhancedSearchFilters = ({
    onApplyFilters,
    initialFilters = {},
    searchType = 'marketplace',
    onSearchTypeChange,
    onViewModeChange,
    viewMode = 'grid'
}) => {
    const { getText } = useTeReo();
    const [isExpanded, setIsExpanded] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [filters, setFilters] = useState({
        keywords: initialFilters.keywords || '',
        category: initialFilters.category || '',
        subcategory: initialFilters.subcategory || '',
        location: initialFilters.location || '',
        priceMin: initialFilters.priceMin || '',
        priceMax: initialFilters.priceMax || '',
        condition: initialFilters.condition || '',
        sellerRating: initialFilters.sellerRating || '',
        sortBy: initialFilters.sortBy || 'relevance',
        // Job-specific filters
        type: initialFilters.type || '',
        salary: initialFilters.salary || '',
        experience: initialFilters.experience || '',
        workRights: initialFilters.workRights || '',
        // Advanced filters
        distance: initialFilters.distance || '',
        datePosted: initialFilters.datePosted || '',
        negotiable: initialFilters.negotiable || false,
        pickup: initialFilters.pickup || false,
        delivery: initialFilters.delivery || false
    });

    const handleFilterChange = useCallback((key, value) => {
        const newFilters = { ...filters, [key]: value };

        // Clear subcategory when category changes
        if (key === 'category') {
            newFilters.subcategory = '';
        }

        setFilters(newFilters);
        setOpenDropdown(null);
    }, [filters]);

    const handleApplyFilters = useCallback(() => {
        onApplyFilters(filters);
    }, [filters, onApplyFilters]);

    const handleClearFilters = useCallback(() => {
        const clearedFilters = {
            keywords: '',
            category: '',
            subcategory: '',
            location: '',
            priceMin: '',
            priceMax: '',
            condition: '',
            sellerRating: '',
            sortBy: 'relevance',
            type: '',
            salary: '',
            experience: '',
            workRights: '',
            distance: '',
            datePosted: '',
            negotiable: false,
            pickup: false,
            delivery: false
        };
        setFilters(clearedFilters);
        onApplyFilters(clearedFilters);
    }, [onApplyFilters]);

    const clearFilter = useCallback((key) => {
        handleFilterChange(key, '');
    }, [handleFilterChange]);

    const getActiveFiltersCount = useCallback(() => {
        return Object.values(filters).filter(value =>
            value && value !== '' && value !== 'relevance' && value !== false
        ).length;
    }, [filters]);

    const DropdownSelect = ({
        label,
        value,
        options,
        placeholder,
        onSelect,
        icon: Icon,
        dropdownKey,
        disabled = false
    }) => {
        const isOpen = openDropdown === dropdownKey;

        return (
            <div className="relative">
                <button
                    onClick={() => !disabled && setOpenDropdown(isOpen ? null : dropdownKey)}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        {Icon && <Icon size={18} className="text-gray-500" />}
                        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                            {value ? (typeof options === 'object' ? options[value] : value) : placeholder}
                        </span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && !disabled && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {placeholder && (
                            <button
                                onClick={() => onSelect('')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-500"
                            >
                                {placeholder}
                            </button>
                        )}
                        {Array.isArray(options) ? (
                            options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSelect(option.value || option)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900"
                                >
                                    {option.label || option}
                                </button>
                            ))
                        ) : (
                            Object.entries(options).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => onSelect(key)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900"
                                >
                                    {label}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    };

    const getCategoryOptions = () => {
        if (searchType === 'jobs') {
            const options = {};
            Object.entries(JOB_CATEGORIES).forEach(([key, category]) => {
                options[key] = category.name;
            });
            return options;
        } else {
            const options = {};
            Object.entries(ENHANCED_CATEGORIES).forEach(([key, category]) => {
                options[key] = category.name;
            });
            return options;
        }
    };

    const getSubcategoryOptions = () => {
        if (!filters.category) return {};

        if (searchType === 'jobs') {
            return JOB_CATEGORIES[filters.category]?.subcategories || {};
        } else {
            return ENHANCED_CATEGORIES[filters.category]?.subcategories || {};
        }
    };

    const getLocationOptions = () => {
        const options = {};
        Object.entries(NZ_REGIONS).forEach(([key, region]) => {
            options[key] = region.name;
        });
        return options;
    };

    const getSortOptions = () => {
        if (searchType === 'jobs') {
            return {
                'relevance': 'Best Match',
                'date-newest': 'Date Posted (Newest)',
                'date-oldest': 'Date Posted (Oldest)',
                'salary-high': 'Salary (High to Low)',
                'salary-low': 'Salary (Low to High)',
                'company': 'Company Name'
            };
        } else {
            return {
                'relevance': 'Best Match',
                'price-low': 'Price (Low to High)',
                'price-high': 'Price (High to Low)',
                'date-newest': 'Newest First',
                'date-oldest': 'Oldest First',
                'popular': 'Most Popular',
                'rating': 'Highest Rated'
            };
        }
    };

    const getConditionOptions = () => {
        return {
            'new': 'New',
            'like-new': 'Like New',
            'excellent': 'Excellent',
            'good': 'Good',
            'fair': 'Fair',
            'poor': 'Poor'
        };
    };

    const getDatePostedOptions = () => {
        return {
            '1': 'Last 24 hours',
            '3': 'Last 3 days',
            '7': 'Last week',
            '30': 'Last month',
            '90': 'Last 3 months'
        };
    };

    const getDistanceOptions = () => {
        return {
            '5': 'Within 5km',
            '10': 'Within 10km',
            '25': 'Within 25km',
            '50': 'Within 50km',
            '100': 'Within 100km'
        };
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Search Type Toggle */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button
                        onClick={() => onSearchTypeChange('marketplace')}
                        className={`px-4 py-2 text-sm font-medium flex items-center ${searchType === 'marketplace'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Grid className="mr-2" size={16} />
                        <TeReoText english="Marketplace" teReoKey="marketplace" />
                    </button>
                    <button
                        onClick={() => onSearchTypeChange('jobs')}
                        className={`px-4 py-2 text-sm font-medium flex items-center ${searchType === 'jobs'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Briefcase className="mr-2" size={16} />
                        <TeReoText english="Jobs" teReoKey="jobs" />
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-2 rounded ${viewMode === 'grid'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-2 rounded ${viewMode === 'list'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={filters.keywords}
                        onChange={(e) => handleFilterChange('keywords', e.target.value)}
                        placeholder={searchType === 'jobs' ? "Job title, keywords, or company" : "What are you looking for?"}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                    />
                </div>

                <div className="lg:w-64">
                    <DropdownSelect
                        label="Location"
                        value={filters.location}
                        options={getLocationOptions()}
                        placeholder="All New Zealand"
                        onSelect={(value) => handleFilterChange('location', value)}
                        icon={MapPin}
                        dropdownKey="location"
                    />
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="lg:hidden flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <Sliders size={18} className="mr-2" />
                    More Filters
                    {isExpanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                </button>
            </div>

            {/* Advanced Filters */}
            <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                    <DropdownSelect
                        label="Category"
                        value={filters.category}
                        options={getCategoryOptions()}
                        placeholder="All Categories"
                        onSelect={(value) => handleFilterChange('category', value)}
                        icon={Briefcase}
                        dropdownKey="category"
                    />

                    {filters.category && (
                        <DropdownSelect
                            label="Subcategory"
                            value={filters.subcategory}
                            options={getSubcategoryOptions()}
                            placeholder="All Subcategories"
                            onSelect={(value) => handleFilterChange('subcategory', value)}
                            icon={Briefcase}
                            dropdownKey="subcategory"
                        />
                    )}

                    {searchType === 'jobs' ? (
                        <>
                            <DropdownSelect
                                label="Job Type"
                                value={filters.type}
                                options={JOB_TYPES}
                                placeholder="All Job Types"
                                onSelect={(value) => handleFilterChange('type', value)}
                                icon={Clock}
                                dropdownKey="type"
                            />

                            <DropdownSelect
                                label="Salary Range"
                                value={filters.salary}
                                options={SALARY_RANGES}
                                placeholder="All Salaries"
                                onSelect={(value) => handleFilterChange('salary', value)}
                                icon={DollarSign}
                                dropdownKey="salary"
                            />

                            <DropdownSelect
                                label="Experience Level"
                                value={filters.experience}
                                options={EXPERIENCE_LEVELS}
                                placeholder="All Experience"
                                onSelect={(value) => handleFilterChange('experience', value)}
                                icon={Briefcase}
                                dropdownKey="experience"
                            />

                            <DropdownSelect
                                label="Work Rights"
                                value={filters.workRights}
                                options={WORK_RIGHTS}
                                placeholder="All Work Rights"
                                onSelect={(value) => handleFilterChange('workRights', value)}
                                icon={Check}
                                dropdownKey="workRights"
                            />
                        </>
                    ) : (
                        <>
                            {/* Price Range */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Price Range | Te Tau Utu
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceMin}
                                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <span className="flex items-center text-gray-500">to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceMax}
                                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <DropdownSelect
                                label="Condition"
                                value={filters.condition}
                                options={getConditionOptions()}
                                placeholder="Any Condition"
                                onSelect={(value) => handleFilterChange('condition', value)}
                                icon={Star}
                                dropdownKey="condition"
                            />

                            <DropdownSelect
                                label="Seller Rating"
                                value={filters.sellerRating}
                                options={{
                                    '5': '5+ Stars',
                                    '4': '4+ Stars',
                                    '3': '3+ Stars'
                                }}
                                placeholder="Any Rating"
                                onSelect={(value) => handleFilterChange('sellerRating', value)}
                                icon={Star}
                                dropdownKey="sellerRating"
                            />
                        </>
                    )}

                    <DropdownSelect
                        label="Sort By"
                        value={filters.sortBy}
                        options={getSortOptions()}
                        placeholder="Sort by"
                        onSelect={(value) => handleFilterChange('sortBy', value)}
                        icon={Clock}
                        dropdownKey="sortBy"
                    />

                    <DropdownSelect
                        label="Date Posted"
                        value={filters.datePosted}
                        options={getDatePostedOptions()}
                        placeholder="Any time"
                        onSelect={(value) => handleFilterChange('datePosted', value)}
                        icon={Clock}
                        dropdownKey="datePosted"
                    />

                    {filters.location && (
                        <DropdownSelect
                            label="Distance"
                            value={filters.distance}
                            options={getDistanceOptions()}
                            placeholder="Any distance"
                            onSelect={(value) => handleFilterChange('distance', value)}
                            icon={MapPin}
                            dropdownKey="distance"
                        />
                    )}
                </div>

                {/* Additional Options for Marketplace */}
                {searchType === 'marketplace' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.negotiable}
                                onChange={(e) => handleFilterChange('negotiable', e.target.checked)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Price Negotiable</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.pickup}
                                onChange={(e) => handleFilterChange('pickup', e.target.checked)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Pickup Available</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.delivery}
                                onChange={(e) => handleFilterChange('delivery', e.target.checked)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Delivery Available</span>
                        </label>
                    </div>
                )}

                {/* Active Filters */}
                {getActiveFiltersCount() > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-sm text-gray-600">Active filters:</span>

                        {filters.keywords && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                "{filters.keywords}"
                                <button
                                    onClick={() => clearFilter('keywords')}
                                    className="ml-2 hover:text-blue-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        {filters.category && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                {searchType === 'jobs'
                                    ? JOB_CATEGORIES[filters.category]?.name
                                    : ENHANCED_CATEGORIES[filters.category]?.name
                                }
                                <button
                                    onClick={() => clearFilter('category')}
                                    className="ml-2 hover:text-green-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        {filters.subcategory && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                {searchType === 'jobs'
                                    ? JOB_CATEGORIES[filters.category]?.subcategories[filters.subcategory]
                                    : ENHANCED_CATEGORIES[filters.category]?.subcategories[filters.subcategory]
                                }
                                <button
                                    onClick={() => clearFilter('subcategory')}
                                    className="ml-2 hover:text-green-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        {filters.location && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                                {NZ_REGIONS[filters.location]?.name}
                                <button
                                    onClick={() => clearFilter('location')}
                                    className="ml-2 hover:text-purple-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        {filters.priceMin && filters.priceMax && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                                ${filters.priceMin} - ${filters.priceMax}
                                <button
                                    onClick={() => {
                                        clearFilter('priceMin');
                                        clearFilter('priceMax');
                                    }}
                                    className="ml-2 hover:text-yellow-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        {filters.negotiable && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                                Price Negotiable
                                <button
                                    onClick={() => handleFilterChange('negotiable', false)}
                                    className="ml-2 hover:text-orange-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-red-600 hover:text-red-800 underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleApplyFilters}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                            <Save size={16} />
                            <span>Save Search</span>
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                            <Bell size={16} />
                            <span>Set Alert</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {openDropdown && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOpenDropdown(null)}
                />
            )}
        </div>
    );
};

export default EnhancedSearchFilters; 