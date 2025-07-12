// Jobs Landing Page - Seek.co.nz Style Employment Portal
// Complete job marketplace with advanced search and filtering

import React from 'react';
import { Target, Award, Clock } from 'lucide-react';
import CategoryLandingPage from './CategoryLandingPage';

const JobsLanding = ({ onNavigate }) => {
    const jobsData = {
        category: 'jobs',
        title: 'Jobs',
        description: 'Your next career opportunity awaits! Discover thousands of job openings from Aotearoa\'s top employers.',
        subtitle: 'Kia kaha, kia maia - Be strong, be brave in your career journey!',
        heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop',
        heroGradient: 'from-green-600 to-teal-600',

        stats: {
            totalListings: '12,000+',
            totalSellers: '2,500+',
            dailyViews: '35K+',
            successRate: '87%'
        },

        features: [
            {
                icon: Target,
                title: 'Smart Job Matching',
                description: 'AI-powered job recommendations based on your skills, experience, and career goals.'
            },
            {
                icon: Award,
                title: 'Verified Employers',
                description: 'All employers are verified with company profiles, reviews, and salary transparency.'
            },
            {
                icon: Clock,
                title: 'Real-time Alerts',
                description: 'Get instant notifications for new jobs matching your criteria and application status updates.'
            }
        ],

        popularSubcategories: [
            {
                id: 'technology',
                name: 'Technology',
                icon: '💻',
                description: 'Software development, IT support, and digital roles',
                count: '2.8K'
            },
            {
                id: 'healthcare',
                name: 'Healthcare',
                icon: '🏥',
                description: 'Medical, nursing, and allied health positions',
                count: '1.9K'
            },
            {
                id: 'education',
                name: 'Education',
                icon: '🎓',
                description: 'Teaching, training, and educational support roles',
                count: '1.5K'
            },
            {
                id: 'finance',
                name: 'Finance',
                icon: '💰',
                description: 'Accounting, banking, and financial services',
                count: '1.2K'
            },
            {
                id: 'trades',
                name: 'Trades & Services',
                icon: '🔨',
                description: 'Construction, electrical, plumbing, and skilled trades',
                count: '1.8K'
            },
            {
                id: 'hospitality',
                name: 'Hospitality & Tourism',
                icon: '🏨',
                description: 'Hotel, restaurant, and tourism industry roles',
                count: '1.1K'
            },
            {
                id: 'sales',
                name: 'Sales & Marketing',
                icon: '📈',
                description: 'Business development, marketing, and sales positions',
                count: '950'
            },
            {
                id: 'administration',
                name: 'Administration',
                icon: '📋',
                description: 'Office support, HR, and administrative roles',
                count: '780'
            }
        ],

        trendingSearches: [
            'Software Developer',
            'Registered Nurse',
            'Primary Teacher',
            'Electrician',
            'Marketing Manager',
            'Accountant',
            'Chef',
            'Customer Service'
        ],

        successStories: [
            {
                user: 'Alex from Tāmaki Makaurau (Auckland)',
                story: 'Landed my dream software developer role within 2 weeks of signing up. The skill matching was spot on!',
                rating: 5
            },
            {
                user: 'Maria from Te Whanganui-a-Tara (Wellington)',
                story: 'Found a great nursing position with excellent benefits. The employer verification gave me confidence.',
                rating: 5
            },
            {
                user: 'John from Ōtautahi (Christchurch)',
                story: 'Switched careers into tech at age 40. The platform helped me find employers open to career changers.',
                rating: 5
            }
        ]
    };

    return <CategoryLandingPage {...jobsData} onNavigate={onNavigate} />;
};

export default JobsLanding;