// Enhanced Category Browser Component
// Navigate deep category hierarchies with brand/model selection

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown, Search, Star, Tag, Filter, ArrowLeft } from 'lucide-react';
import { ENHANCED_CATEGORIES, getBrandsForCategory, getAttributesForCategory } from '../../lib/enhancedCategories';

const CategoryBrowser = ({ 
    onCategorySelect, 
    selectedPath = [], 
    showBrands = true, 
    showFilters = true,
    mode = 'browse' // 'browse', 'select', 'filter'
}) => {
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [viewLevel, setViewLevel] = useState(0);
    const [breadcrumb, setBreadcrumb] = useState([]);

    // Get current category data based on selected path
    const currentCategory = useMemo(() => {
        let current = ENHANCED_CATEGORIES;
        
        for (const pathItem of selectedPath) {
            if (current[pathItem]?.subcategories) {
                current = current[pathItem].subcategories;
            } else {
                break;
            }
        }
        
        return current;
    }, [selectedPath]);

    // Get brands for current category
    const availableBrands = useMemo(() => {
        if (!showBrands || selectedPath.length === 0) return null;
        return getBrandsForCategory(...selectedPath);
    }, [selectedPath, showBrands]);

    // Get models for selected brand
    const availableModels = useMemo(() => {
        if (!selectedBrand || !availableBrands) return null;
        return availableBrands[selectedBrand]?.models || null;
    }, [selectedBrand, availableBrands]);

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return currentCategory;
        
        const filtered = {};
        Object.entries(currentCategory).forEach(([key, category]) => {
            if (category.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
                filtered[key] = category;
            }
        });
        
        return filtered;
    }, [currentCategory, searchTerm]);

    const toggleExpanded = useCallback((categoryKey) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryKey)) {
                newSet.delete(categoryKey);
            } else {
                newSet.add(categoryKey);
            }
            return newSet;
        });
    }, []);

    const handleCategoryClick = useCallback((categoryKey, categoryData) => {
        const newPath = [...selectedPath, categoryKey];
        
        if (categoryData.subcategories) {
            // Navigate deeper
            setBreadcrumb(prev => [...prev, { key: categoryKey, name: categoryData.name }]);
            setViewLevel(prev => prev + 1);
        }
        
        onCategorySelect({
            path: newPath,
            category: categoryData,
            brand: selectedBrand,
            model: selectedModel,
            level: viewLevel
        });
    }, [selectedPath, selectedBrand, selectedModel, viewLevel, onCategorySelect]);

    const handleBrandSelect = useCallback((brandKey, brandData) => {
        setSelectedBrand(brandKey);
        setSelectedModel(null);
        
        onCategorySelect({
            path: selectedPath,
            brand: brandKey,
            brandData,
            model: null
        });
    }, [selectedPath, onCategorySelect]);

    const handleModelSelect = useCallback((modelKey, modelData) => {
        setSelectedModel(modelKey);
        
        onCategorySelect({
            path: selectedPath,
            brand: selectedBrand,
            model: modelKey,
            modelData
        });
    }, [selectedPath, selectedBrand, onCategorySelect]);

    const navigateBack = useCallback(() => {
        if (breadcrumb.length > 0) {
            const newBreadcrumb = [...breadcrumb];
            newBreadcrumb.pop();
            setBreadcrumb(newBreadcrumb);
            setViewLevel(prev => prev - 1);
        }
    }, [breadcrumb]);

    const renderBreadcrumb = () => (
        <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
            {viewLevel > 0 && (
                <button
                    onClick={navigateBack}
                    className="p-1 hover:bg-gray-200 rounded"
                >
                    <ArrowLeft size={16} />
                </button>
            )}
            <span className="text-sm text-gray-600">Browse:</span>
            <span className="text-sm font-medium">All Categories</span>
            {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={14} className="text-gray-400" />
                    <span className="text-sm font-medium">{item.name}</span>
                </React.Fragment>
            ))}
        </div>
    );

    const renderSearchBar = () => (
        <div className="relative mb-4">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
    );

    const renderCategoryGrid = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(filteredCategories).map(([key, category]) => {
                const isExpanded = expandedCategories.has(key);
                const hasSubcategories = category.subcategories && Object.keys(category.subcategories).length > 0;
                
                return (
                    <div
                        key={key}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleCategoryClick(key, category)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {category.icon && (
                                    <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                                        <category.icon className={`text-${category.color}-600`} size={20} />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                    {category.description && (
                                        <p className="text-sm text-gray-500">{category.description}</p>
                                    )}
                                </div>
                            </div>
                            {hasSubcategories && (
                                <ChevronRight className="text-gray-400" size={16} />
                            )}
                        </div>
                        
                        {category.subcategories && (
                            <div className="mt-3 text-xs text-gray-500">
                                {Object.keys(category.subcategories).length} subcategories
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderBrandSelector = () => {
        if (!availableBrands) return null;

        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Tag className="mr-2" size={18} />
                    Select Brand
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(availableBrands).map(([brandKey, brandData]) => (
                        <button
                            key={brandKey}
                            onClick={() => handleBrandSelect(brandKey, brandData)}
                            className={`p-3 border rounded-lg text-left transition-colors ${
                                selectedBrand === brandKey
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="font-medium">{brandData.name}</div>
                            {brandData.models && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {Object.keys(brandData.models).length} models
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderModelSelector = () => {
        if (!availableModels) return null;

        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Star className="mr-2" size={18} />
                    Select Model
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(availableModels).map(([modelKey, modelData]) => (
                        <button
                            key={modelKey}
                            onClick={() => handleModelSelect(modelKey, modelData)}
                            className={`p-3 border rounded-lg text-left transition-colors ${
                                selectedModel === modelKey
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="font-medium">{modelData.name}</div>
                            {modelData.variants && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {modelData.variants.join(', ')}
                                </div>
                            )}
                            {modelData.colors && (
                                <div className="text-xs text-gray-400 mt-1">
                                    Colors: {modelData.colors.slice(0, 3).join(', ')}
                                    {modelData.colors.length > 3 && ` +${modelData.colors.length - 3} more`}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderCategoryAttributes = () => {
        if (selectedPath.length === 0) return null;

        const attributes = getAttributesForCategory(...selectedPath);
        if (!attributes.attributes.length) return null;

        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Filter className="mr-2" size={16} />
                    Category Information
                </h4>
                <div className="text-sm">
                    <div className="mb-2">
                        <span className="font-medium text-blue-800">Required fields:</span>
                        <span className="ml-2 text-blue-700">
                            {attributes.required.length > 0 ? attributes.required.join(', ') : 'None'}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium text-blue-800">Available attributes:</span>
                        <span className="ml-2 text-blue-700">
                            {attributes.attributes.join(', ')}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {renderBreadcrumb()}
            {renderSearchBar()}
            {renderCategoryGrid()}
            {renderBrandSelector()}
            {renderModelSelector()}
            {renderCategoryAttributes()}
        </div>
    );
};

// Quick category selector for forms
export const QuickCategorySelector = ({ onSelect, selectedPath = [] }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (selection) => {
        onSelect(selection);
        setIsOpen(false);
    };

    const formatSelection = () => {
        if (selectedPath.length === 0) return 'Select Category';
        
        let display = selectedPath.map(path => {
            const parts = path.split('-');
            return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
        }).join(' › ');
        
        return display;
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
                <div className="flex items-center justify-between">
                    <span className={selectedPath.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                        {formatSelection()}
                    </span>
                    <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
                </div>
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    <CategoryBrowser
                        onCategorySelect={handleSelect}
                        selectedPath={selectedPath}
                        mode="select"
                        showBrands={true}
                        showFilters={false}
                    />
                </div>
            )}
        </div>
    );
};

export default CategoryBrowser;