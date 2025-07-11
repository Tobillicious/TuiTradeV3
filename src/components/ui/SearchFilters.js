// src/components/ui/SearchFilters.js
import { useState } from 'react';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, NZ_REGIONS } from '../../lib/utils';

const SearchFilters = ({ onFiltersChange, currentFilters = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        category: currentFilters.category || '',
        priceMin: currentFilters.priceMin || '',
        priceMax: currentFilters.priceMax || '',
        location: currentFilters.location || '',
        condition: currentFilters.condition || '',
        sortBy: currentFilters.sortBy || 'newest',
        ...currentFilters
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            category: '',
            priceMin: '',
            priceMax: '',
            location: '',
            condition: '',
            sortBy: 'newest'
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const conditionOptions = [
        'New',
        'Used - Like New',
        'Used - Good',
        'Used - Fair'
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'title-az', label: 'Title: A to Z' },
        { value: 'title-za', label: 'Title: Z to A' }
    ];

    const hasActiveFilters = Object.values(localFilters).some(value => 
        value !== '' && value !== 'newest'
    );

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
                                Active
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

            {isOpen && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                </div>
            )}
        </div>
    );
};

export default SearchFilters;