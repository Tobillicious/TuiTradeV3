// src/components/pages/SellerDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, timeAgo } from '../../lib/utils';
import {
    TrendingUp,
    Eye,
    MessageCircle,
    DollarSign,
    Package,
    Clock,
    Star,
    Calendar,
    BarChart3,
    Activity,
    Target,
    Award,
    AlertCircle
} from 'lucide-react';

const SellerDashboard = ({ onNavigate }) => {
    const [dashboardData, setDashboardData] = useState({
        listings: [],
        auctions: [],
        analytics: {
            totalListings: 0,
            activeListings: 0,
            totalViews: 0,
            totalInquiries: 0,
            totalRevenue: 0,
            averagePrice: 0,
            conversionRate: 0,
            responseRate: 0
        },
        recentActivity: [],
        performance: {
            thisMonth: { sales: 0, revenue: 0, views: 0 },
            lastMonth: { sales: 0, revenue: 0, views: 0 },
            growth: { sales: 0, revenue: 0, views: 0 }
        }
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30'); // days

    const { currentUser } = useAuth();

    const calculateAnalytics = useCallback((items) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

        const activeItems = items.filter(item => item.status === 'active');

        const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0);
        const totalInquiries = items.reduce((sum, item) => sum + (item.inquiries || 0), 0);

        // Calculate revenue from completed auctions and sold items
        const soldItems = items.filter(item => item.status === 'sold' || (item.type === 'auction' && item.currentWinner));
        const totalRevenue = soldItems.reduce((sum, item) => {
            if (item.type === 'auction') {
                return sum + (item.currentBid || 0);
            }
            return sum + (item.price || 0);
        }, 0);

        const averagePrice = items.length > 0 ?
            items.reduce((sum, item) => sum + (item.price || item.startingBid || 0), 0) / items.length : 0;

        const conversionRate = totalInquiries > 0 ? (soldItems.length / totalInquiries) * 100 : 0;
        const responseRate = 85; // Placeholder - would need message response tracking

        return {
            totalListings: items.length,
            activeListings: activeItems.length,
            totalViews,
            totalInquiries,
            totalRevenue,
            averagePrice,
            conversionRate,
            responseRate
        };
    }, [timeRange]);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch user's listings
            const listingsQuery = query(
                collection(db, 'listings'),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );
            const listingsSnapshot = await getDocs(listingsQuery);
            const listings = listingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                type: 'listing'
            }));

            // Fetch user's auctions
            const auctionsQuery = query(
                collection(db, 'auctions'),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );
            const auctionsSnapshot = await getDocs(auctionsQuery);
            const auctions = auctionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                endTime: doc.data().endTime?.toDate(),
                type: 'auction'
            }));

            // Calculate analytics
            const allItems = [...listings, ...auctions];
            const analytics = calculateAnalytics(allItems);
            const performance = calculatePerformance(allItems);
            const recentActivity = generateRecentActivity(allItems);

            setDashboardData({
                listings,
                auctions,
                analytics,
                performance,
                recentActivity
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser, calculateAnalytics]);

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser, timeRange, fetchDashboardData]);


    const calculatePerformance = (items) => {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonthItems = items.filter(item => item.createdAt >= thisMonthStart);
        const lastMonthItems = items.filter(item =>
            item.createdAt >= lastMonthStart && item.createdAt <= lastMonthEnd
        );

        const thisMonth = {
            sales: thisMonthItems.filter(item => item.status === 'sold').length,
            revenue: thisMonthItems.reduce((sum, item) => sum + (item.price || item.currentBid || 0), 0),
            views: thisMonthItems.reduce((sum, item) => sum + (item.views || 0), 0)
        };

        const lastMonth = {
            sales: lastMonthItems.filter(item => item.status === 'sold').length,
            revenue: lastMonthItems.reduce((sum, item) => sum + (item.price || item.currentBid || 0), 0),
            views: lastMonthItems.reduce((sum, item) => sum + (item.views || 0), 0)
        };

        const growth = {
            sales: lastMonth.sales > 0 ? ((thisMonth.sales - lastMonth.sales) / lastMonth.sales) * 100 : 0,
            revenue: lastMonth.revenue > 0 ? ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100 : 0,
            views: lastMonth.views > 0 ? ((thisMonth.views - lastMonth.views) / lastMonth.views) * 100 : 0
        };

        return { thisMonth, lastMonth, growth };
    };

    const generateRecentActivity = (items) => {
        // Generate activity feed based on recent actions
        const activities = [];

        items.slice(0, 10).forEach(item => {
            activities.push({
                id: `created-${item.id}`,
                type: item.type === 'auction' ? 'auction-created' : 'listing-created',
                title: item.title,
                timestamp: item.createdAt,
                data: item
            });

            if (item.type === 'auction' && item.bidCount > 0) {
                activities.push({
                    id: `bid-${item.id}`,
                    type: 'bid-received',
                    title: item.title,
                    timestamp: item.lastBidTime || item.createdAt,
                    data: { ...item, bidCount: item.bidCount }
                });
            }
        });

        return activities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 15);
    };

    if (loading) {
        return (
            <div className="bg-gray-50 flex-grow flex items-center justify-center">
                <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
                    <p className="text-gray-600">Track your sales performance and manage your listings</p>
                </div>

                {/* Time Range Selector */}
                <div className="mb-6">
                    <div className="flex space-x-2">
                        {['7', '30', '90', '365'].map(days => (
                            <button
                                key={days}
                                onClick={() => setTimeRange(days)}
                                className={`px-4 py-2 rounded-lg transition-colors ${timeRange === days
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {days === '365' ? '1 Year' : `${days} Days`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Revenue"
                        value={formatPrice(dashboardData.analytics.totalRevenue)}
                        icon={DollarSign}
                        growth={dashboardData.performance.growth.revenue}
                        color="green"
                    />
                    <MetricCard
                        title="Active Listings"
                        value={dashboardData.analytics.activeListings}
                        icon={Package}
                        subtitle={`of ${dashboardData.analytics.totalListings} total`}
                        color="blue"
                    />
                    <MetricCard
                        title="Total Views"
                        value={dashboardData.analytics.totalViews.toLocaleString()}
                        icon={Eye}
                        growth={dashboardData.performance.growth.views}
                        color="purple"
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${dashboardData.analytics.conversionRate.toFixed(1)}%`}
                        icon={Target}
                        subtitle="Inquiries to sales"
                        color="orange"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Chart */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Performance Overview</h2>
                                <BarChart3 className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">
                                        {dashboardData.performance.thisMonth.sales}
                                    </p>
                                    <p className="text-sm text-gray-600">Sales This Month</p>
                                    {dashboardData.performance.growth.sales !== 0 && (
                                        <p className={`text-xs ${dashboardData.performance.growth.sales > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {dashboardData.performance.growth.sales > 0 ? '+' : ''}
                                            {dashboardData.performance.growth.sales.toFixed(1)}% vs last month
                                        </p>
                                    )}
                                </div>

                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {formatPrice(dashboardData.performance.thisMonth.revenue)}
                                    </p>
                                    <p className="text-sm text-gray-600">Revenue This Month</p>
                                    {dashboardData.performance.growth.revenue !== 0 && (
                                        <p className={`text-xs ${dashboardData.performance.growth.revenue > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {dashboardData.performance.growth.revenue > 0 ? '+' : ''}
                                            {dashboardData.performance.growth.revenue.toFixed(1)}% vs last month
                                        </p>
                                    )}
                                </div>

                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">
                                        {dashboardData.performance.thisMonth.views.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Views This Month</p>
                                    {dashboardData.performance.growth.views !== 0 && (
                                        <p className={`text-xs ${dashboardData.performance.growth.views > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {dashboardData.performance.growth.views > 0 ? '+' : ''}
                                            {dashboardData.performance.growth.views.toFixed(1)}% vs last month
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => onNavigate('create-listing')}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    New Listing
                                </button>
                                <button
                                    onClick={() => onNavigate('listings')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Manage Listings
                                </button>
                                <button
                                    onClick={() => onNavigate('messages')}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Messages
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Recent Activity</h2>
                                <Activity className="w-5 h-5 text-gray-400" />
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {dashboardData.recentActivity.length > 0 ? (
                                    dashboardData.recentActivity.map(activity => (
                                        <ActivityItem key={activity.id} activity={activity} />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="w-8 h-8 mx-auto mb-2" />
                                        <p>No recent activity</p>
                                        <p className="text-sm">Create your first listing to get started!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Insights */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Performing Items */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-yellow-500" />
                            Top Performing Items
                        </h3>
                        <div className="space-y-3">
                            {[...dashboardData.listings, ...dashboardData.auctions]
                                .sort((a, b) => (b.views || 0) - (a.views || 0))
                                .slice(0, 5)
                                .map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.views || 0} views • {item.inquiries || 0} inquiries
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                {formatPrice(item.price || item.currentBid || item.startingBid)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Seller Tips */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Star className="w-5 h-5 mr-2 text-blue-500" />
                            Seller Tips
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-medium text-gray-900">Add high-quality photos</p>
                                    <p className="text-sm text-gray-600">Listings with 3+ photos get 40% more views</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-medium text-gray-900">Respond quickly to inquiries</p>
                                    <p className="text-sm text-gray-600">Fast responses increase sales by 25%</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-medium text-gray-900">Use competitive pricing</p>
                                    <p className="text-sm text-gray-600">Check similar items to price competitively</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, growth, subtitle, color }) => {
    const colorClasses = {
        green: 'text-green-600 bg-green-100',
        blue: 'text-blue-600 bg-blue-100',
        purple: 'text-purple-600 bg-purple-100',
        orange: 'text-orange-600 bg-orange-100'
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {growth !== undefined && (
                    <div className={`text-sm font-medium ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                        {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-gray-600">{title}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
};

const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'listing-created':
                return <Package className="w-4 h-4 text-green-600" />;
            case 'auction-created':
                return <Clock className="w-4 h-4 text-blue-600" />;
            case 'bid-received':
                return <TrendingUp className="w-4 h-4 text-purple-600" />;
            case 'message-received':
                return <MessageCircle className="w-4 h-4 text-orange-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case 'listing-created':
                return 'Listed item';
            case 'auction-created':
                return 'Started auction';
            case 'bid-received':
                return `Received ${activity.data.bidCount} bid${activity.data.bidCount !== 1 ? 's' : ''} on`;
            case 'message-received':
                return 'Received message about';
            default:
                return 'Activity on';
        }
    };

    return (
        <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                    <span className="font-medium">{getActivityText(activity)}</span>
                    <span className="ml-1 truncate">{activity.title}</span>
                </p>
                <p className="text-xs text-gray-500">{timeAgo(activity.timestamp)}</p>
            </div>
        </div>
    );
};

export default SellerDashboard;