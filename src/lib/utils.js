// =============================================
// utils.js - General Utilities & Category Definitions
// ---------------------------------------------------
// Contains helper functions, constants, and category/subcategory definitions
// used throughout the app for listings, navigation, and UI logic.
// =============================================
// src/lib/utils.js

import {
    ShoppingCart, Car, Briefcase, Home as HomeIcon, Wrench, Gift
} from 'lucide-react';

export const CATEGORIES = {
    marketplace: {
        name: 'Marketplace',
        icon: ShoppingCart,
        color: 'blue',
        listingTypes: ['auction', 'fixed-price'],
        defaultDuration: 7,
        fees: { listingFee: 0, successFeeRate: 0.079, maxSuccessFee: 499 },
        subcategories: {
            'antiques-collectibles': {
                name: 'Antiques & Collectibles',
                tags: ['Furniture', 'Art', 'Coins', 'Stamps', 'Militaria', 'Pottery & Glass', 'Vintage', 'Other Collectibles'],
                attributes: ['Age', 'Condition', 'Authenticity', 'Origin']
            },
            'clothing-fashion': {
                name: 'Clothing & Fashion',
                tags: ['Women\'s Clothing', 'Men\'s Clothing', 'Children\'s Clothing', 'Shoes', 'Accessories', 'Handbags', 'Lingerie', 'Vintage Fashion'],
                attributes: ['Size', 'Brand', 'Color', 'Material', 'Gender', 'Age Group']
            },
            'electronics': {
                name: 'Electronics',
                tags: ['Computers & Laptops', 'TVs & Audio', 'Cameras', 'Gaming', 'Mobile Phones', 'Tablets', 'Smart Home', 'Components'],
                attributes: ['Brand', 'Model', 'Storage', 'Screen Size', 'Connectivity', 'Operating System']
            },
            'home-living': {
                name: 'Home & Living',
                tags: ['Furniture', 'Outdoor & Garden', 'Kitchen & Dining', 'Bedroom', 'Bathroom', 'Lighting', 'Storage', 'Appliances'],
                attributes: ['Material', 'Dimensions', 'Room', 'Style', 'Energy Rating']
            },
            'sports': {
                name: 'Sports',
                tags: ['Fitness Equipment', 'Team Sports', 'Water Sports', 'Winter Sports', 'Outdoor Recreation', 'Cycling', 'Golf', 'Martial Arts'],
                attributes: ['Sport Type', 'Size', 'Gender', 'Age Group', 'Skill Level']
            },
            'books': {
                name: 'Books',
                tags: ['Fiction', 'Non-Fiction', 'Educational', 'Children\'s Books', 'Comics', 'Audio Books', 'E-books', 'Magazines'],
                attributes: ['Genre', 'Author', 'Language', 'Format', 'Age Group', 'Educational Level']
            },
            'toys-games': {
                name: 'Toys & Games',
                tags: ['Action Figures', 'Board Games', 'Educational Toys', 'Video Games', 'Outdoor Toys', 'Baby Toys', 'Collectibles'],
                attributes: ['Age Group', 'Brand', 'Condition', 'Battery Required']
            },
            'health-beauty': {
                name: 'Health & Beauty',
                tags: ['Skincare', 'Makeup', 'Hair Care', 'Fragrances', 'Health Supplements', 'Fitness', 'Personal Care'],
                attributes: ['Brand', 'Type', 'Size', 'Expiry Date', 'Gender']
            },
            'baby-kids': {
                name: 'Baby & Kids',
                tags: ['Baby Clothes', 'Kids Clothes', 'Toys', 'Strollers', 'Car Seats', 'Feeding', 'Nursery', 'Maternity'],
                attributes: ['Age Group', 'Size', 'Brand', 'Gender', 'Safety Standards']
            },
            'pets': {
                name: 'Pets & Animals',
                tags: ['Dogs', 'Cats', 'Pet Supplies', 'Fish & Aquariums', 'Birds', 'Small Animals', 'Horses', 'Pet Services'],
                attributes: ['Pet Type', 'Breed', 'Age', 'Gender', 'Vaccination Status']
            },
            'music-instruments': {
                name: 'Music & Instruments',
                tags: ['Guitars', 'Keyboards', 'Drums', 'Wind Instruments', 'Audio Equipment', 'DJ Equipment', 'Sheet Music'],
                attributes: ['Instrument Type', 'Brand', 'Model', 'Condition', 'Skill Level']
            }
        }
    },
    motors: {
        name: 'Motors',
        icon: Car,
        color: 'red',
        listingTypes: ['auction', 'classified'],
        defaultDuration: 90,
        fees: { listingFee: 49, successFeeRate: 0.02, maxSuccessFee: 99 },
        subcategories: {
            'cars': {
                name: 'Cars',
                tags: ['Sedans', 'Hatchbacks', 'SUVs', 'Utes', 'Wagons', 'Convertibles', 'Sports Cars', 'Electric Vehicles'],
                attributes: ['Make', 'Model', 'Year', 'Mileage', 'Engine Size', 'Transmission', 'Fuel Type', 'Body Type', 'Doors', 'Color', 'Registration', 'WOF', 'Financing Available'],
                required: ['Make', 'Model', 'Year', 'Mileage']
            },
            'motorcycles': {
                name: 'Motorcycles',
                tags: ['Road Bikes', 'Dirt Bikes', 'Cruisers', 'Sports Bikes', 'Touring', 'Scooters', 'Mopeds', 'Quads'],
                attributes: ['Make', 'Model', 'Year', 'Engine Size', 'Type', 'Color', 'Registration', 'WOF']
            },
            'boats-marine': {
                name: 'Boats & Marine',
                tags: ['Power Boats', 'Sailing Boats', 'Jet Skis', 'Kayaks', 'Fishing Equipment', 'Marine Parts', 'Trailers'],
                attributes: ['Type', 'Length', 'Year', 'Engine', 'Hull Material', 'Registration']
            },
            'trucks-commercial': {
                name: 'Trucks & Commercial',
                tags: ['Trucks', 'Vans', 'Buses', 'Heavy Machinery', 'Trailers', 'Farm Equipment'],
                attributes: ['Make', 'Model', 'Year', 'Mileage', 'Engine Size', 'GVM', 'Registration', 'RUC']
            },
            'caravans-motorhomes': {
                name: 'Caravans & Motorhomes',
                tags: ['Caravans', 'Motorhomes', 'Camper Trailers', 'Pop Tops', 'Fifth Wheelers'],
                attributes: ['Make', 'Model', 'Year', 'Length', 'Berths', 'Registration', 'WOF']
            },
            'parts-accessories': {
                name: 'Parts & Accessories',
                tags: ['Car Parts', 'Motorcycle Parts', 'Boat Parts', 'Tyres', 'Batteries', 'Tools', 'Audio'],
                attributes: ['Vehicle Type', 'Make', 'Model', 'Year', 'Part Type', 'Condition']
            }
        }
    },
    property: {
        name: 'Property',
        icon: HomeIcon,
        color: 'purple',
        listingTypes: ['classified'],
        defaultDuration: 28,
        fees: { listingFee: 0, successFeeRate: 0 },
        subcategories: {
            'residential-sale': {
                name: 'Residential for Sale',
                tags: ['Houses', 'Apartments', 'Townhouses', 'Units', 'Sections', 'Lifestyle Blocks'],
                attributes: ['Price', 'Bedrooms', 'Bathrooms', 'Property Type', 'Land Area', 'Floor Area', 'Parking', 'Year Built', 'Council Rates']
            },
            'residential-rent': {
                name: 'Residential for Rent',
                tags: ['Houses', 'Apartments', 'Rooms', 'Flatmates Wanted', 'Holiday Rentals'],
                attributes: ['Rent per Week', 'Bedrooms', 'Bathrooms', 'Parking', 'Pets Allowed', 'Furnished', 'Available From']
            },
            'commercial': {
                name: 'Commercial Property',
                tags: ['Offices', 'Retail', 'Industrial', 'Warehouses', 'Development Sites'],
                attributes: ['Price', 'Area', 'Zoning', 'Parking', 'Location Type']
            }
        }
    },
    jobs: {
        name: 'Jobs',
        icon: Briefcase,
        color: 'green',
        listingTypes: ['classified'],
        defaultDuration: 30,
        fees: { listingFee: 0, successFeeRate: 0 },
        subcategories: {
            'it-technology': {
                name: 'IT & Technology',
                tags: ['Software Development', 'Network Administration', 'Cybersecurity', 'Data Analysis', 'Tech Support', 'Project Management'],
                attributes: ['Job Type', 'Experience Level', 'Salary Range', 'Location', 'Work Type']
            },
            'healthcare': {
                name: 'Healthcare',
                tags: ['Nursing', 'Medical', 'Allied Health', 'Administration', 'Support Workers'],
                attributes: ['Position Type', 'Qualifications Required', 'Shift Type', 'Experience Level']
            },
            'trades-construction': {
                name: 'Trades & Construction',
                tags: ['Building', 'Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Roofing'],
                attributes: ['Trade Type', 'Experience Level', 'Qualifications', 'Location']
            },
            'hospitality-tourism': {
                name: 'Hospitality & Tourism',
                tags: ['Restaurants', 'Hotels', 'Tourism', 'Events', 'Bar Work', 'Kitchen'],
                attributes: ['Position Type', 'Experience Level', 'Shift Type', 'Location']
            },
            'education': {
                name: 'Education & Training',
                tags: ['Teaching', 'Early Childhood', 'Training', 'Administration', 'Support'],
                attributes: ['Subject Area', 'Education Level', 'Qualifications Required', 'Contract Type']
            }
        }
    },
    services: {
        name: 'Services',
        icon: Wrench,
        color: 'orange',
        listingTypes: ['classified'],
        defaultDuration: 30,
        fees: { listingFee: 0, successFeeRate: 0.05, maxSuccessFee: 299 },
        subcategories: {
            'home-garden': {
                name: 'Home & Garden',
                tags: ['Cleaning', 'Gardening', 'Handyman', 'Painting', 'Plumbing', 'Electrical'],
                attributes: ['Service Type', 'Area Covered', 'Experience', 'Qualifications', 'Hourly Rate']
            },
            'automotive': {
                name: 'Automotive Services',
                tags: ['Mechanical', 'Panel Beating', 'Detailing', 'Tyres', 'WOF', 'Servicing'],
                attributes: ['Service Type', 'Vehicle Types', 'Location', 'Qualifications']
            },
            'business-professional': {
                name: 'Business & Professional',
                tags: ['Accounting', 'Legal', 'Marketing', 'IT Support', 'Consulting', 'Design'],
                attributes: ['Service Type', 'Industry Experience', 'Qualifications', 'Rate Structure']
            },
            'events-entertainment': {
                name: 'Events & Entertainment',
                tags: ['DJ Services', 'Photography', 'Catering', 'Party Planning', 'Musicians', 'Venues'],
                attributes: ['Service Type', 'Event Types', 'Package Options', 'Equipment Included']
            }
        }
    },
    community: {
        name: 'Community',
        icon: Gift,
        color: 'pink',
        listingTypes: ['classified'],
        defaultDuration: 14,
        fees: { listingFee: 0, successFeeRate: 0 },
        subcategories: {
            'free-stuff': {
                name: 'Free Stuff',
                tags: ['Furniture', 'Electronics', 'Clothes', 'Books', 'Garden', 'Building Materials'],
                attributes: ['Item Type', 'Condition', 'Pickup Only', 'Available Until']
            },
            'wanted': {
                name: 'Wanted',
                tags: ['Cars', 'Electronics', 'Furniture', 'Collectibles', 'Services', 'Property'],
                attributes: ['Item Type', 'Budget', 'Condition Preference', 'Urgency']
            },
            'lost-found': {
                name: 'Lost & Found',
                tags: ['Pets', 'Personal Items', 'Electronics', 'Jewellery', 'Documents'],
                attributes: ['Item Type', 'Location Lost/Found', 'Date', 'Reward Offered']
            }
        }
    }
};

export const LISTINGS_LIMIT = 20;

export const NZ_REGIONS = [
    'Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Bay of Plenty',
    'Otago', 'Manawatu-Wanganui', 'Hawke\'s Bay', 'Taranaki', 'Southland',
    'Northland', 'Nelson', 'Marlborough', 'Gisborne', 'Tasman', 'West Coast'
];

export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count > 0) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
};
