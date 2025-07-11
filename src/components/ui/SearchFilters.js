// src/components/ui/SearchFilters.js
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Filter, SlidersHorizontal, X, Tag, Star, User, MapPin, DollarSign } from 'lucide-react';
import { CATEGORIES, NZ_REGIONS } from '../../lib/utils';

// Debounce utility function
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const SearchFilters = memo(({ onFiltersChange, currentFilters = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        category: currentFilters.category || '',
        priceMin: currentFilters.priceMin || '',
        priceMax: currentFilters.priceMax || '',
        location: currentFilters.location || '',
        condition: currentFilters.condition || '',
        listingType: currentFilters.listingType || '',
        tags: currentFilters.tags || [],
        sortBy: currentFilters.sortBy || 'newest',
        ...currentFilters
    });

    // Debounce filter changes to prevent excessive API calls
    const debouncedOnFiltersChange = useCallback(
        debounce((filters) => {
            onFiltersChange(filters);
        }, 300),
        [onFiltersChange]
    );

    const handleFilterChange = useCallback((key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        debouncedOnFiltersChange(newFilters);
    }, [localFilters, debouncedOnFiltersChange]);

    const handleTagToggle = useCallback((tag) => {
        const newTags = localFilters.tags.includes(tag)
            ? localFilters.tags.filter(t => t !== tag)
            : [...localFilters.tags, tag];
        handleFilterChange('tags', newTags);
    }, [localFilters.tags, handleFilterChange]);

    const clearFilters = useCallback(() => {
        const clearedFilters = {
            category: '',
            priceMin: '',
            priceMax: '',
            location: '',
            condition: '',
            listingType: '',
            tags: [],
            sortBy: 'newest'
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    }, [onFiltersChange]);

    const conditionOptions = useMemo(() => [
        'New',
        'Used - Like New',
        'Used - Good',
        'Used - Fair'
    ], []);

    const listingTypeOptions = useMemo(() => [
        { value: 'fixed-price', label: 'Fixed Price' },
        { value: 'auction', label: 'Auction' }
    ], []);

    const sortOptions = useMemo(() => [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'title-az', label: 'Title: A to Z' },
        { value: 'title-za', label: 'Title: Z to A' },
        { value: 'popular', label: 'Most Popular' }
    ], []);

    // Popular tags for quick filtering
    const popularTags = useMemo(() => [
        'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports',
        'Collectibles', 'Tools', 'Garden', 'Kitchen', 'Baby',
        'Vintage', 'Handmade', 'Local Pickup', 'Free Shipping'
    ], []);

    const hasActiveFilters = useMemo(() => {
        return Object.values(localFilters).some(value =>
            (Array.isArray(value) ? value.length > 0 : value !== '') && value !== 'newest'
        );
    }, [localFilters]);

    const activeFilterCount = useMemo(() => {
        return (
            localFilters.tags.length +
            (localFilters.category ? 1 : 0) +
            (localFilters.priceMin || localFilters.priceMax ? 1 : 0) +
            (localFilters.location ? 1 : 0) +
            (localFilters.condition ? 1 : 0) +
            (localFilters.listingType ? 1 : 0)
        );
    }, [localFilters]);

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter size={16} />
                        <span>Filters</span>
                        {hasActiveFilters && (
                            <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center space-x-2">
                        <SlidersHorizontal size={16} className="text-gray-400" />
                        <select
                            value={localFilters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <X size={16} />
                        <span>Clear All</span>
                    </button>
                )}
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {localFilters.category && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            Category: {CATEGORIES[localFilters.category]?.name}
                            <button
                                onClick={() => handleFilterChange('category', '')}
                                className="ml-2 hover:text-green-600"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {(localFilters.priceMin || localFilters.priceMax) && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            Price: ${localFilters.priceMin || '0'} - ${localFilters.priceMax || '∞'}
                            <button
                                onClick={() => {
                                    handleFilterChange('priceMin', '');
                                    handleFilterChange('priceMax', '');
                                }}
                                className="ml-2 hover:text-blue-600"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {localFilters.location && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                            Location: {localFilters.location}
                            <button
                                onClick={() => handleFilterChange('location', '')}
                                className="ml-2 hover:text-purple-600"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {localFilters.condition && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                            Condition: {localFilters.condition}
                            <button
                                onClick={() => handleFilterChange('condition', '')}
                                className="ml-2 hover:text-orange-600"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {localFilters.listingType && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                            Type: {listingTypeOptions.find(opt => opt.value === localFilters.listingType)?.label}
                            <button
                                onClick={() => handleFilterChange('listingType', '')}
                                className="ml-2 hover:text-red-600"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                    {localFilters.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                            <Tag size={12} className="mr-1" />
                            {tag}
                            <button
                                onClick={() => handleTagToggle(tag)}
                                className="ml-2 hover:text-gray-600"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {isOpen && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Tag size={14} className="mr-1" />
                                Category
                            </label>
                            <select
                                value={localFilters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">All Categories</option>
                                {Object.entries(CATEGORIES).map(([key, category]) => (
                                    <option key={key} value={key}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Listing Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <DollarSign size={14} className="mr-1" />
                                Listing Type
                            </label>
                            <select
                                value={localFilters.listingType}
                                onChange={(e) => handleFilterChange('listingType', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">All Types</option>
                                {listingTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <DollarSign size={14} className="mr-1" />
                                Min Price
                            </label>
                            <input
                                type="number"
                                placeholder="$0"
                                value={localFilters.priceMin}
                                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <DollarSign size={14} className="mr-1" />
                                Max Price
                            </label>
                            <input
                                type="number"
                                placeholder="$999,999"
                                value={localFilters.priceMax}
                                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <MapPin size={14} className="mr-1" />
                                Location
                            </label>
                            <select
                                value={localFilters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">All Locations</option>
                                {NZ_REGIONS.map(region => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Star size={14} className="mr-1" />
                                Condition
                            </label>
                            <select
                                value={localFilters.condition}
                                onChange={(e) => handleFilterChange('condition', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">Any Condition</option>
                                {conditionOptions.map(condition => (
                                    <option key={condition} value={condition}>
                                        {condition}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Popular Tags */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Tag size={14} className="mr-1" />
                            Popular Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagToggle(tag)}
                                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${localFilters.tags.includes(tag)
                                            ? 'bg-green-100 text-green-800 border-green-300'
                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for performance optimization
    return (
        JSON.stringify(prevProps.currentFilters) === JSON.stringify(nextProps.currentFilters) &&
        prevProps.onFiltersChange === nextProps.onFiltersChange
    );
});

SearchFilters.displayName = 'SearchFilters';

export default SearchFilters;