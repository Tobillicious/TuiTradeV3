// src/components/ui/SearchFilters.js
import React, { useState, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import { NZ_REGIONS } from '../../lib/nzLocalization';

const SearchFilters = ({ onApplyFilters, initialFilters = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        priceMin: initialFilters.priceMin || '',
        priceMax: initialFilters.priceMax || '',
        location: initialFilters.location || '',
        category: initialFilters.category || '',
        condition: initialFilters.condition || '',
        sellerRating: initialFilters.sellerRating || '',
        sortBy: initialFilters.sortBy || 'relevance'
    });

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleApplyFilters = useCallback(() => {
        onApplyFilters(filters);
        setIsOpen(false);
    }, [filters, onApplyFilters]);

    const handleClearFilters = useCallback(() => {
        const clearedFilters = {
            priceMin: '',
            priceMax: '',
            location: '',
            category: '',
            condition: '',
            sellerRating: '',
            sortBy: 'relevance'
        };
        setFilters(clearedFilters);
        onApplyFilters(clearedFilters);
    }, [onApplyFilters]);

    const hasActiveFilters = Object.values(filters).some(value => value && value !== 'relevance');

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${hasActiveFilters
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <Filter size={16} />
                <span className="font-medium">Filters</span>
                {hasActiveFilters && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                        {Object.values(filters).filter(v => v && v !== 'relevance').length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Search Filters</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price Range | Te Tau Utu
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.priceMin}
                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <span className="flex items-center text-gray-500">to</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.priceMax}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location | Te Wāhi
                            </label>
                            <select
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">All Locations</option>
                                {Object.entries(NZ_REGIONS).map(([key, region]) => (
                                    <option key={key} value={key}>
                                        {region.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition | Te Āhua
                            </label>
                            <select
                                value={filters.condition}
                                onChange={(e) => handleFilterChange('condition', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Any Condition</option>
                                <option value="new">New</option>
                                <option value="like-new">Like New</option>
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>

                        {/* Seller Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seller Rating | Te Whakatauranga Kaihoko
                            </label>
                            <select
                                value={filters.sellerRating}
                                onChange={(e) => handleFilterChange('sellerRating', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Any Rating</option>
                                <option value="5">5+ Stars</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By | Rārangi Mā
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilters;