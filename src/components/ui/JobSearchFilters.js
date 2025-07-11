// Job Search Filters Component - Seek.co.nz Style
// Complete filtering system for job search

import React, { useState, useEffect } from 'react';
import { 
    Search, MapPin, DollarSign, Clock, Briefcase, 
    ChevronDown, ChevronUp, Filter, X, Check 
} from 'lucide-react';
import { 
    JOB_CATEGORIES, JOB_TYPES, SALARY_RANGES, WORK_RIGHTS, 
    EXPERIENCE_LEVELS, NZ_LOCATIONS, getAllCategories 
} from '../../lib/jobsData';

const JobSearchFilters = ({ onFiltersChange, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        keywords: '',
        category: '',
        subcategory: '',
        location: '',
        type: '',
        salary: '',
        experience: '',
        workRights: '',
        ...initialFilters
    });

    const [isExpanded, setIsExpanded] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        onFiltersChange(filters);
    }, [filters, onFiltersChange]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        
        // Clear subcategory when category changes
        if (key === 'category') {
            newFilters.subcategory = '';
        }
        
        setFilters(newFilters);
        setOpenDropdown(null);
    };

    const clearFilters = () => {
        setFilters({
            keywords: '',
            category: '',
            subcategory: '',
            location: '',
            type: '',
            salary: '',
            experience: '',
            workRights: ''
        });
    };

    const clearFilter = (key) => {
        handleFilterChange(key, '');
    };

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter(value => value && value !== '').length;
    };

    const DropdownSelect = ({ 
        label, 
        value, 
        options, 
        placeholder, 
        onSelect, 
        icon: Icon,
        dropdownKey
    }) => {
        const isOpen = openDropdown === dropdownKey;
        
        return (
            <div className="relative">
                <button
                    onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <div className="flex items-center space-x-2">
                        {Icon && <Icon size={18} className="text-gray-500" />}
                        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                            {value ? (typeof options === 'object' ? options[value] : value) : placeholder}
                        </span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
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

    const getSubcategoryOptions = () => {
        if (!filters.category || !JOB_CATEGORIES[filters.category]) return {};
        return JOB_CATEGORIES[filters.category].subcategories || {};
    };

    const getCategoryOptions = () => {
        const options = {};
        Object.entries(JOB_CATEGORIES).forEach(([key, category]) => {
            options[key] = category.name;
        });
        return options;
    };

    const getLocationOptions = () => {
        const options = {};
        Object.entries(NZ_LOCATIONS).forEach(([key, location]) => {
            options[key] = location.name;
        });
        return options;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={filters.keywords}
                        onChange={(e) => handleFilterChange('keywords', e.target.value)}
                        placeholder="Job title, keywords, or company"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
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
                    <Filter size={18} className="mr-2" />
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
                </div>

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
                                {JOB_CATEGORIES[filters.category]?.name}
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
                                {JOB_CATEGORIES[filters.category]?.subcategories[filters.subcategory]}
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
                                {NZ_LOCATIONS[filters.location]?.name}
                                <button
                                    onClick={() => clearFilter('location')}
                                    className="ml-2 hover:text-purple-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        {filters.type && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                                {JOB_TYPES[filters.type]}
                                <button
                                    onClick={() => clearFilter('type')}
                                    className="ml-2 hover:text-orange-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        {filters.salary && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                                {SALARY_RANGES[filters.salary]}
                                <button
                                    onClick={() => clearFilter('salary')}
                                    className="ml-2 hover:text-yellow-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        {filters.experience && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                                {EXPERIENCE_LEVELS[filters.experience]}
                                <button
                                    onClick={() => clearFilter('experience')}
                                    className="ml-2 hover:text-indigo-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        {filters.workRights && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                                {WORK_RIGHTS[filters.workRights]}
                                <button
                                    onClick={() => clearFilter('workRights')}
                                    className="ml-2 hover:text-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}

                        <button
                            onClick={clearFilters}
                            className="text-sm text-red-600 hover:text-red-800 underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
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

export default JobSearchFilters;