// src/lib/categoryUtils.js
import { CATEGORIES } from './utils';

export const getCategoryConfig = (categoryKey) => {
    return CATEGORIES[categoryKey] || null;
};

export const calculateListingFees = (categoryKey, price, listingType = 'fixed-price') => {
    const category = getCategoryConfig(categoryKey);
    if (!category) return { listingFee: 0, successFee: 0, total: 0 };

    const listingFee = category.fees.listingFee || 0;
    let successFee = 0;

    if (listingType === 'auction' || listingType === 'fixed-price') {
        successFee = Math.min(
            price * category.fees.successFeeRate,
            category.fees.maxSuccessFee || Infinity
        );
    }

    return {
        listingFee,
        successFee,
        total: listingFee + successFee,
        breakdown: {
            listingFee: `$${listingFee.toFixed(2)}`,
            successFee: `$${successFee.toFixed(2)} (${(category.fees.successFeeRate * 100).toFixed(1)}%)`,
            total: `$${(listingFee + successFee).toFixed(2)}`
        }
    };
};

export const getAvailableListingTypes = (categoryKey) => {
    const category = getCategoryConfig(categoryKey);
    return category?.listingTypes || ['fixed-price'];
};

export const getDefaultListingDuration = (categoryKey, listingType) => {
    const category = getCategoryConfig(categoryKey);
    if (!category) return 7;

    // Motors has longer durations
    if (categoryKey === 'motors') {
        return listingType === 'classified' ? 90 : 14;
    }

    return category.defaultDuration || 7;
};

export const getCategorySpecificFields = (categoryKey, subcategoryKey) => {
    const category = getCategoryConfig(categoryKey);
    if (!category || !subcategoryKey || !category.subcategories) return null;

    const subcategory = category.subcategories[subcategoryKey];
    if (!subcategory) return null;

    return {
        attributes: subcategory.attributes || [],
        required: subcategory.required || [],
        tags: subcategory.tags || []
    };
};

export const validateCategoryListing = (categoryKey, subcategoryKey, formData) => {
    const errors = [];
    const category = getCategoryConfig(categoryKey);

    if (!category) {
        errors.push('Invalid category selected');
        return errors;
    }

    // Check if listing type is allowed for category
    if (!category.listingTypes.includes(formData.listingType)) {
        errors.push(`${formData.listingType} listings not allowed in ${category.name}`);
    }

    // Validate category-specific required fields
    if (subcategoryKey && category.subcategories?.[subcategoryKey]) {
        const subcategory = category.subcategories[subcategoryKey];
        if (subcategory.required) {
            subcategory.required.forEach(field => {
                if (!formData.attributes?.[field]) {
                    errors.push(`${field} is required for ${subcategory.name}`);
                }
            });
        }
    }

    // Motors-specific validations
    if (categoryKey === 'motors' && subcategoryKey === 'cars') {
        const year = parseInt(formData.attributes?.Year);
        if (year && (year < 1900 || year > new Date().getFullYear() + 1)) {
            errors.push('Please enter a valid year');
        }

        const mileage = parseInt(formData.attributes?.Mileage);
        if (mileage && mileage < 0) {
            errors.push('Mileage cannot be negative');
        }
    }

    // Property-specific validations
    if (categoryKey === 'property') {
        if (!category.listingTypes.includes('auction') && formData.listingType === 'auction') {
            errors.push('Auctions not allowed for property listings');
        }
    }

    return errors;
};

export const getSearchFilters = (categoryKey, subcategoryKey) => {
    const category = getCategoryConfig(categoryKey);
    if (!category) return [];

    const filters = [
        {
            key: 'listingType',
            label: 'Listing Type',
            type: 'select',
            options: category.listingTypes.map(type => ({
                value: type,
                label: type === 'fixed-price' ? 'Buy Now' : type.charAt(0).toUpperCase() + type.slice(1)
            }))
        },
        {
            key: 'priceRange',
            label: 'Price Range',
            type: 'range',
            min: 0,
            max: categoryKey === 'property' ? 2000000 : categoryKey === 'motors' ? 100000 : 5000
        }
    ];

    // Add category-specific filters
    if (categoryKey === 'motors' && subcategoryKey === 'cars') {
        filters.push(
            {
                key: 'yearRange',
                label: 'Year',
                type: 'range',
                min: 1990,
                max: new Date().getFullYear() + 1
            },
            {
                key: 'mileageRange',
                label: 'Mileage (km)',
                type: 'range',
                min: 0,
                max: 300000
            }
        );
    }

    if (categoryKey === 'property') {
        filters.push(
            {
                key: 'bedrooms',
                label: 'Bedrooms',
                type: 'select',
                options: [
                    { value: '1', label: '1+' },
                    { value: '2', label: '2+' },
                    { value: '3', label: '3+' },
                    { value: '4', label: '4+' },
                    { value: '5', label: '5+' }
                ]
            }
        );
    }

    return filters;
};

export const formatListingTypeDisplay = (listingType) => {
    switch (listingType) {
        case 'fixed-price':
            return 'Buy Now';
        case 'auction':
            return 'Auction';
        case 'classified':
            return 'Classified';
        default:
            return listingType;
    }
};

export const getCategoryColor = (categoryKey) => {
    const category = getCategoryConfig(categoryKey);
    return category?.color || 'gray';
};

export const getCategoryIcon = (categoryKey) => {
    const category = getCategoryConfig(categoryKey);
    return category?.icon;
};

export const getBreadcrumbPath = (categoryKey, subcategoryKey) => {
    const path = [{ name: 'Home', key: 'home' }];
    const category = getCategoryConfig(categoryKey);
    if (category) {
        path.push({ name: category.name, key: categoryKey });
        if (subcategoryKey && category.subcategories?.[subcategoryKey]) {
            path.push({ name: category.subcategories[subcategoryKey].name, key: subcategoryKey });
        }
    }
    return path;
};

export const getConditionClass = (condition) => {
    const conditionClasses = {
        'New': 'bg-green-100 text-green-800',
        'Used - Like New': 'bg-blue-100 text-blue-800',
        'Used - Good': 'bg-yellow-100 text-yellow-800',
        'Used - Fair': 'bg-orange-100 text-orange-800',
    };
    return conditionClasses[condition] || 'bg-gray-100 text-gray-800';
};