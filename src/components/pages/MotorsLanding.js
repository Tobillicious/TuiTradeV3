// Motors Landing Page
// Cars, motorcycles, boats, and automotive parts

import React from 'react';
import { Car, Shield, Wrench, Users, Award, CheckCircle, FileText, MapPin } from 'lucide-react';
import CategoryLandingPage from './CategoryLandingPage';

const MotorsLanding = ({ onNavigate }) => {
    const motorsData = {
        category: 'motors',
        title: 'Motors',
        description: 'Find your perfect ride! Cars, motorcycles, boats, and parts from trusted dealers and private sellers across New Zealand.',
        heroImage: 'https://images.unsplash.com/photo-1494976688754-90f929ac2c0e?w=1200&h=600&fit=crop',
        heroGradient: 'from-red-600 to-orange-600',
        
        stats: {
            totalListings: '15,000+',
            totalSellers: '3,200+',
            dailyViews: '85K+',
            successRate: '92%'
        },

        features: [
            {
                icon: FileText,
                title: 'Vehicle History',
                description: 'Comprehensive vehicle reports including ownership history, accident records, and maintenance logs.'
            },
            {
                icon: Award,
                title: 'Certified Dealers',
                description: 'Verified motor dealers with professional warranties and after-sales support across NZ.'
            },
            {
                icon: MapPin,
                title: 'Local Inspections',
                description: 'Arrange professional vehicle inspections with certified mechanics in your area.'
            }
        ],

        popularSubcategories: [
            {
                id: 'cars',
                name: 'Cars',
                icon: '🚗',
                description: 'Sedans, hatchbacks, SUVs, and luxury vehicles',
                count: '8.5K'
            },
            {
                id: 'motorcycles',
                name: 'Motorcycles',
                icon: '🏍️',
                description: 'Sport bikes, cruisers, dirt bikes, and scooters',
                count: '2.1K'
            },
            {
                id: 'boats',
                name: 'Boats & Marine',
                icon: '⛵',
                description: 'Powerboats, sailboats, jet skis, and marine equipment',
                count: '1.8K'
            },
            {
                id: 'commercial',
                name: 'Commercial Vehicles',
                icon: '🚚',
                description: 'Trucks, vans, trailers, and work vehicles',
                count: '1.3K'
            },
            {
                id: 'parts',
                name: 'Parts & Accessories',
                icon: '🔧',
                description: 'Genuine and aftermarket parts for all vehicles',
                count: '3.2K'
            },
            {
                id: 'classic',
                name: 'Classic & Vintage',
                icon: '🏛️',
                description: 'Restored classics and vintage collectible vehicles',
                count: '650'
            },
            {
                id: 'recreational',
                name: 'Recreational',
                icon: '🏕️',
                description: 'Campers, RVs, ATVs, and outdoor adventure vehicles',
                count: '890'
            },
            {
                id: 'aviation',
                name: 'Aviation',
                icon: '✈️',
                description: 'Aircraft, helicopters, and aviation equipment',
                count: '125'
            }
        ],

        trendingSearches: [
            'Toyota Camry',
            'Ford Ranger',
            'Honda Civic',
            'Mazda CX-5',
            'BMW 3 Series',
            'Harley Davidson',
            'Jet Ski',
            'Caravan'
        ],

        successStories: [
            {
                user: 'Mike from Hamilton',
                story: 'Sold my Toyota Hilux for asking price within 3 days. The vehicle verification system gave buyers confidence.',
                rating: 5
            },
            {
                user: 'Sarah from Tauranga',
                story: 'Found my dream classic Mustang through the platform. The detailed history report was invaluable.',
                rating: 5
            },
            {
                user: 'David from Dunedin',
                story: 'Great experience buying my first motorcycle. The seller was verified and the bike was exactly as described.',
                rating: 5
            }
        ]
    };

    return <CategoryLandingPage {...motorsData} onNavigate={onNavigate} />;
};

export default MotorsLanding;