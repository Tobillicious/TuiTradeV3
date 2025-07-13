// Admin Dashboard - Analytics and User Tracking
// Real-time metrics, user analytics, and system monitoring

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Users, Activity, ShoppingCart, DollarSign, 
    TrendingUp, Eye,
    Clock, Globe, Smartphone,
    ArrowUp, ArrowDown,
    RefreshCw
} from 'lucide-react';


const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalListings: 0,
        totalOrders: 0,
        totalRevenue: 0,
        conversionRate: 0,
        avgOrderValue: 0,
        trafficToday: 0
    });

    const [realtimeData, setRealtimeData] = useState({
        onlineUsers: 0,
        activeListings: 0,
        pendingOrders: 0,
        recentActivity: []
    });

    const [chartData, setChartData] = useState({
        userGrowth: [],
        revenueGrowth: [],
        categoryBreakdown: [],
        deviceTypes: []
    });

    const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d, 90d
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchUserMetrics(),
                fetchListingMetrics(),
                fetchOrderMetrics(),
                fetchRevenueMetrics(),
                fetchTrafficMetrics()
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
            setLastUpdated(new Date());
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        setupRealtimeListeners();
        
        // Refresh data every 5 minutes
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [timeRange, fetchDashboardData]);

    const fetchUserMetrics = async () => {
        try {
            // In a real app, these would be actual Firebase queries
            // For now, we'll use mock data that simulates real metrics
            const mockUserMetrics = {
                totalUsers: 12847,
                activeUsers: 3241,
                newUsersToday: 156,
                userGrowth: [
                    { date: '2024-01-01', users: 8500 },
                    { date: '2024-01-02', users: 8650 },
                    { date: '2024-01-03', users: 8800 },
                    { date: '2024-01-04', users: 9100 },
                    { date: '2024-01-05', users: 9400 },
                    { date: '2024-01-06', users: 9750 },
                    { date: '2024-01-07', users: 10200 }
                ]
            };

            setMetrics(prev => ({
                ...prev,
                totalUsers: mockUserMetrics.totalUsers,
                activeUsers: mockUserMetrics.activeUsers
            }));

            setChartData(prev => ({
                ...prev,
                userGrowth: mockUserMetrics.userGrowth
            }));
        } catch (error) {
            console.error('Error fetching user metrics:', error);
        }
    };

    const fetchListingMetrics = async () => {
        try {
            const mockListingMetrics = {
                totalListings: 45623,
                activeListings: 38945,
                newListingsToday: 234,
                categoryBreakdown: [
                    { category: 'Marketplace', count: 15234, percentage: 33.4 },
                    { category: 'Motors', count: 12456, percentage: 27.3 },
                    { category: 'Real Estate', count: 8765, percentage: 19.2 },
                    { category: 'Jobs', count: 5432, percentage: 11.9 },
                    { category: 'Digital Goods', count: 2456, percentage: 5.4 },
                    { category: 'Community', count: 1280, percentage: 2.8 }
                ]
            };

            setMetrics(prev => ({
                ...prev,
                totalListings: mockListingMetrics.totalListings
            }));

            setChartData(prev => ({
                ...prev,
                categoryBreakdown: mockListingMetrics.categoryBreakdown
            }));
        } catch (error) {
            console.error('Error fetching listing metrics:', error);
        }
    };

    const fetchOrderMetrics = async () => {
        try {
            const mockOrderMetrics = {
                totalOrders: 8934,
                completedOrders: 7245,
                pendingOrders: 1689,
                conversionRate: 6.8,
                avgOrderValue: 285.50
            };

            setMetrics(prev => ({
                ...prev,
                totalOrders: mockOrderMetrics.totalOrders,
                conversionRate: mockOrderMetrics.conversionRate,
                avgOrderValue: mockOrderMetrics.avgOrderValue
            }));
        } catch (error) {
            console.error('Error fetching order metrics:', error);
        }
    };

    const fetchRevenueMetrics = async () => {
        try {
            const mockRevenueMetrics = {
                totalRevenue: 2548900,
                revenueGrowth: [
                    { date: '2024-01-01', revenue: 15000 },
                    { date: '2024-01-02', revenue: 18500 },
                    { date: '2024-01-03', revenue: 22000 },
                    { date: '2024-01-04', revenue: 19500 },
                    { date: '2024-01-05', revenue: 25000 },
                    { date: '2024-01-06', revenue: 28500 },
                    { date: '2024-01-07', revenue: 32000 }
                ]
            };

            setMetrics(prev => ({
                ...prev,
                totalRevenue: mockRevenueMetrics.totalRevenue
            }));

            setChartData(prev => ({
                ...prev,
                revenueGrowth: mockRevenueMetrics.revenueGrowth
            }));
        } catch (error) {
            console.error('Error fetching revenue metrics:', error);
        }
    };

    const fetchTrafficMetrics = async () => {
        try {
            const mockTrafficMetrics = {
                trafficToday: 15674,
                deviceTypes: [
                    { device: 'Mobile', count: 8934, percentage: 57.0 },
                    { device: 'Desktop', count: 5123, percentage: 32.7 },
                    { device: 'Tablet', count: 1617, percentage: 10.3 }
                ]
            };

            setMetrics(prev => ({
                ...prev,
                trafficToday: mockTrafficMetrics.trafficToday
            }));

            setChartData(prev => ({
                ...prev,
                deviceTypes: mockTrafficMetrics.deviceTypes
            }));
        } catch (error) {
            console.error('Error fetching traffic metrics:', error);
        }
    };

    const setupRealtimeListeners = () => {
        // Mock realtime data updates
        const interval = setInterval(() => {
            setRealtimeData(prev => ({
                ...prev,
                onlineUsers: Math.floor(Math.random() * 500) + 200,
                activeListings: Math.floor(Math.random() * 1000) + 5000,
                pendingOrders: Math.floor(Math.random() * 50) + 100,
                recentActivity: [
                    { id: 1, type: 'new_user', message: 'New user registered', time: new Date() },
                    { id: 2, type: 'new_listing', message: 'New listing created', time: new Date(Date.now() - 60000) },
                    { id: 3, type: 'order_placed', message: 'Order placed', time: new Date(Date.now() - 120000) },
                    { id: 4, type: 'payment_received', message: 'Payment received', time: new Date(Date.now() - 180000) }
                ]
            }));
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-NZ').format(num);
    };

    const MetricCard = ({ title, value, icon: Icon, change, changeType = 'positive' }) => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {change && (
                        <div className={`flex items-center mt-2 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                            {changeType === 'positive' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                            <span className="text-sm ml-1">{change}</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                    <Icon size={24} className="text-gray-600" />
                </div>
            </div>
        </div>
    );

    const RealtimeCard = ({ title, value, icon: Icon, status = 'normal' }) => (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <div className={`flex items-center mt-1 ${status === 'online' ? 'text-green-600' : 'text-blue-600'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${status === 'online' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <span className="text-xs">{status === 'online' ? 'Live' : 'Active'}</span>
                    </div>
                </div>
                <Icon size={20} className="text-gray-600" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">TuiTrade Analytics & Monitoring</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={fetchDashboardData}
                            disabled={isLoading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>
                    </div>
                </div>

                {/* Last Updated */}
                <div className="mb-6">
                    <p className="text-sm text-gray-500">
                        Last updated: {lastUpdated.toLocaleString('en-NZ')}
                    </p>
                </div>

                {/* Realtime Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <RealtimeCard
                        title="Online Users"
                        value={formatNumber(realtimeData.onlineUsers)}
                        icon={Users}
                        status="online"
                    />
                    <RealtimeCard
                        title="Active Listings"
                        value={formatNumber(realtimeData.activeListings)}
                        icon={Eye}
                        status="active"
                    />
                    <RealtimeCard
                        title="Pending Orders"
                        value={formatNumber(realtimeData.pendingOrders)}
                        icon={Clock}
                        status="active"
                    />
                    <RealtimeCard
                        title="Traffic Today"
                        value={formatNumber(metrics.trafficToday)}
                        icon={Globe}
                        status="active"
                    />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Users"
                        value={formatNumber(metrics.totalUsers)}
                        icon={Users}
                        change="+12.5%"
                        changeType="positive"
                    />
                    <MetricCard
                        title="Total Listings"
                        value={formatNumber(metrics.totalListings)}
                        icon={ShoppingCart}
                        change="+8.3%"
                        changeType="positive"
                    />
                    <MetricCard
                        title="Total Orders"
                        value={formatNumber(metrics.totalOrders)}
                        icon={Activity}
                        change="+15.2%"
                        changeType="positive"
                    />
                    <MetricCard
                        title="Total Revenue"
                        value={formatCurrency(metrics.totalRevenue)}
                        icon={DollarSign}
                        change="+22.8%"
                        changeType="positive"
                    />
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <MetricCard
                        title="Conversion Rate"
                        value={`${metrics.conversionRate}%`}
                        icon={TrendingUp}
                        change="+0.8%"
                        changeType="positive"
                    />
                    <MetricCard
                        title="Avg Order Value"
                        value={formatCurrency(metrics.avgOrderValue)}
                        icon={DollarSign}
                        change="+$15.20"
                        changeType="positive"
                    />
                    <MetricCard
                        title="Active Users"
                        value={formatNumber(metrics.activeUsers)}
                        icon={Users}
                        change="+5.4%"
                        changeType="positive"
                    />
                </div>

                {/* Charts and Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Category Breakdown */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                        <div className="space-y-3">
                            {chartData.categoryBreakdown.map((category, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{category.category}</span>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${category.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12">
                                            {category.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Device Types */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Device Types</h3>
                        <div className="space-y-3">
                            {chartData.deviceTypes.map((device, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Smartphone size={16} className="text-gray-600" />
                                        <span className="text-sm font-medium">{device.device}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-gray-600">
                                            {formatNumber(device.count)}
                                        </span>
                                        <span className="text-sm text-gray-600 w-12">
                                            {device.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {realtimeData.recentActivity.map((activity, index) => (
                            <div key={activity.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm">{activity.message}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {activity.time.toLocaleTimeString('en-NZ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;