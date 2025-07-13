// Real Admin Service - Firestore integration for admin dashboard
// Replaces mock metrics with actual database operations

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    runTransaction,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Admin permissions
export const ADMIN_PERMISSIONS = {
    VIEW_DASHBOARD: 'view_dashboard',
    MANAGE_USERS: 'manage_users',
    MANAGE_LISTINGS: 'manage_listings',
    MANAGE_JOBS: 'manage_jobs',
    VIEW_ANALYTICS: 'view_analytics',
    MANAGE_SETTINGS: 'manage_settings'
};

class AdminService {
    constructor() {
        this.isInitialized = false;
        this.currentAdminId = null;
    }

    initialize(adminId) {
        this.currentAdminId = adminId;
        this.isInitialized = true;
        console.log('AdminService initialized for admin:', adminId);
    }

    // Check if user has admin permissions
    async checkAdminPermissions(userId, requiredPermissions = []) {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return false;
            }

            const userData = userDoc.data();
            const userPermissions = userData.permissions || [];
            const userRole = userData.role || 'user';

            // Super admin has all permissions
            if (userRole === 'super_admin') {
                return true;
            }

            // Check specific permissions
            if (requiredPermissions.length === 0) {
                return userRole === 'admin' || userPermissions.length > 0;
            }

            return requiredPermissions.every(permission =>
                userPermissions.includes(permission)
            );
        } catch (error) {
            console.error('Error checking admin permissions:', error);
            return false;
        }
    }

    // Get real-time user metrics
    async getUserMetrics() {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);

            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const totalUsers = users.length;
            const activeUsers = users.filter(user => {
                const lastSeen = user.lastSeen?.toDate?.() || user.lastSeen;
                return lastSeen && lastSeen > oneDayAgo;
            }).length;

            const newUsersToday = users.filter(user => {
                const createdAt = user.createdAt?.toDate?.() || user.createdAt;
                return createdAt && createdAt > oneDayAgo;
            }).length;

            // Calculate user growth over the last 7 days
            const userGrowth = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

                const usersOnDay = users.filter(user => {
                    const createdAt = user.createdAt?.toDate?.() || user.createdAt;
                    return createdAt && createdAt >= startOfDay && createdAt < endOfDay;
                }).length;

                userGrowth.push({
                    date: startOfDay.toISOString().split('T')[0],
                    users: usersOnDay
                });
            }

            return {
                totalUsers,
                activeUsers,
                newUsersToday,
                userGrowth
            };
        } catch (error) {
            console.error('Error getting user metrics:', error);
            throw new Error('Failed to get user metrics');
        }
    }

    // Get real-time listing metrics
    async getListingMetrics() {
        try {
            const listingsRef = collection(db, 'listings');
            const snapshot = await getDocs(listingsRef);

            const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const totalListings = listings.length;
            const activeListings = listings.filter(listing => listing.status === 'active').length;
            const newListingsToday = listings.filter(listing => {
                const createdAt = listing.createdAt?.toDate?.() || listing.createdAt;
                return createdAt && createdAt > oneDayAgo;
            }).length;

            // Calculate category breakdown
            const categoryBreakdown = {};
            listings.forEach(listing => {
                const category = listing.category || 'uncategorized';
                categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
            });

            const breakdownArray = Object.entries(categoryBreakdown).map(([category, count]) => ({
                category,
                count,
                percentage: Math.round((count / totalListings) * 100)
            }));

            return {
                totalListings,
                activeListings,
                newListingsToday,
                categoryBreakdown: breakdownArray
            };
        } catch (error) {
            console.error('Error getting listing metrics:', error);
            throw new Error('Failed to get listing metrics');
        }
    }

    // Get real-time order metrics
    async getOrderMetrics() {
        try {
            const ordersRef = collection(db, 'orders');
            const snapshot = await getDocs(ordersRef);

            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const totalOrders = orders.length;
            const completedOrders = orders.filter(order => order.status === 'completed').length;
            const pendingOrders = orders.filter(order => order.status === 'pending').length;

            // Calculate conversion rate (orders / total users)
            const conversionRate = totalOrders > 0 ? (totalOrders / 1000) * 100 : 0; // Assuming 1000 total users for demo

            // Calculate average order value
            const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            return {
                totalOrders,
                completedOrders,
                pendingOrders,
                conversionRate: Math.round(conversionRate * 10) / 10,
                avgOrderValue: Math.round(avgOrderValue * 100) / 100
            };
        } catch (error) {
            console.error('Error getting order metrics:', error);
            throw new Error('Failed to get order metrics');
        }
    }

    // Get real-time revenue metrics
    async getRevenueMetrics() {
        try {
            const ordersRef = collection(db, 'orders');
            const snapshot = await getDocs(ordersRef);

            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const now = new Date();

            const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            // Calculate revenue growth over the last 7 days
            const revenueGrowth = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

                const revenueOnDay = orders
                    .filter(order => {
                        const createdAt = order.createdAt?.toDate?.() || order.createdAt;
                        return createdAt && createdAt >= startOfDay && createdAt < endOfDay;
                    })
                    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

                revenueGrowth.push({
                    date: startOfDay.toISOString().split('T')[0],
                    revenue: Math.round(revenueOnDay * 100) / 100
                });
            }

            return {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                revenueGrowth
            };
        } catch (error) {
            console.error('Error getting revenue metrics:', error);
            throw new Error('Failed to get revenue metrics');
        }
    }

    // Get real-time traffic metrics (simulated)
    async getTrafficMetrics() {
        try {
            // In a real app, this would come from analytics service
            // For now, we'll simulate based on user activity
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);

            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const activeUsers = users.filter(user => {
                const lastSeen = user.lastSeen?.toDate?.() || user.lastSeen;
                return lastSeen && lastSeen > oneDayAgo;
            }).length;

            // Simulate traffic based on active users
            const trafficToday = Math.floor(activeUsers * 3.5); // Assume 3.5 page views per active user

            // Simulate device types (would come from analytics)
            const deviceTypes = [
                { device: 'Mobile', count: Math.floor(trafficToday * 0.57), percentage: 57.0 },
                { device: 'Desktop', count: Math.floor(trafficToday * 0.327), percentage: 32.7 },
                { device: 'Tablet', count: Math.floor(trafficToday * 0.103), percentage: 10.3 }
            ];

            return {
                trafficToday,
                deviceTypes
            };
        } catch (error) {
            console.error('Error getting traffic metrics:', error);
            throw new Error('Failed to get traffic metrics');
        }
    }

    // Get recent activity
    async getRecentActivity(limit = 10) {
        try {
            // Get recent orders
            const ordersRef = collection(db, 'orders');
            const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(limit));
            const ordersSnapshot = await getDocs(ordersQuery);

            // Get recent user registrations
            const usersRef = collection(db, 'users');
            const usersQuery = query(usersRef, orderBy('createdAt', 'desc'), limit(limit));
            const usersSnapshot = await getDocs(usersQuery);

            // Get recent listings
            const listingsRef = collection(db, 'listings');
            const listingsQuery = query(listingsRef, orderBy('createdAt', 'desc'), limit(limit));
            const listingsSnapshot = await getDocs(listingsQuery);

            const activities = [];

            // Process orders
            ordersSnapshot.docs.forEach(doc => {
                const order = doc.data();
                activities.push({
                    id: `order_${doc.id}`,
                    type: 'order_placed',
                    message: `Order placed for $${order.totalAmount || 0}`,
                    time: order.createdAt?.toDate?.() || order.createdAt,
                    data: { orderId: doc.id, amount: order.totalAmount }
                });
            });

            // Process user registrations
            usersSnapshot.docs.forEach(doc => {
                const user = doc.data();
                activities.push({
                    id: `user_${doc.id}`,
                    type: 'new_user',
                    message: `New user registered: ${user.firstName || user.email}`,
                    time: user.createdAt?.toDate?.() || user.createdAt,
                    data: { userId: doc.id, email: user.email }
                });
            });

            // Process listings
            listingsSnapshot.docs.forEach(doc => {
                const listing = doc.data();
                activities.push({
                    id: `listing_${doc.id}`,
                    type: 'new_listing',
                    message: `New listing created: ${listing.title}`,
                    time: listing.createdAt?.toDate?.() || listing.createdAt,
                    data: { listingId: doc.id, title: listing.title }
                });
            });

            // Sort by time and return limited results
            activities.sort((a, b) => b.time - a.time);
            return activities.slice(0, limit);
        } catch (error) {
            console.error('Error getting recent activity:', error);
            throw new Error('Failed to get recent activity');
        }
    }

    // Real-time listeners
    subscribeToUserMetrics(callback) {
        const usersRef = collection(db, 'users');
        return onSnapshot(usersRef, async () => {
            const metrics = await this.getUserMetrics();
            callback(metrics);
        });
    }

    subscribeToListingMetrics(callback) {
        const listingsRef = collection(db, 'listings');
        return onSnapshot(listingsRef, async () => {
            const metrics = await this.getListingMetrics();
            callback(metrics);
        });
    }

    subscribeToOrderMetrics(callback) {
        const ordersRef = collection(db, 'orders');
        return onSnapshot(ordersRef, async () => {
            const metrics = await this.getOrderMetrics();
            callback(metrics);
        });
    }

    subscribeToRecentActivity(callback) {
        const ordersRef = collection(db, 'orders');
        const usersRef = collection(db, 'users');
        const listingsRef = collection(db, 'listings');

        const unsubscribeOrders = onSnapshot(ordersRef, async () => {
            const activity = await this.getRecentActivity();
            callback(activity);
        });

        const unsubscribeUsers = onSnapshot(usersRef, async () => {
            const activity = await this.getRecentActivity();
            callback(activity);
        });

        const unsubscribeListings = onSnapshot(listingsRef, async () => {
            const activity = await this.getRecentActivity();
            callback(activity);
        });

        return () => {
            unsubscribeOrders();
            unsubscribeUsers();
            unsubscribeListings();
        };
    }

    // Admin actions
    async suspendUser(userId, reason = '') {
        try {
            const userRef = doc(db, 'users', userId);
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw new Error('User not found');
                }

                transaction.update(userRef, {
                    status: 'suspended',
                    suspendedAt: serverTimestamp(),
                    suspensionReason: reason,
                    suspendedBy: this.currentAdminId
                });
            });

            return true;
        } catch (error) {
            console.error('Error suspending user:', error);
            throw new Error('Failed to suspend user');
        }
    }

    async unsuspendUser(userId) {
        try {
            const userRef = doc(db, 'users', userId);
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw new Error('User not found');
                }

                transaction.update(userRef, {
                    status: 'active',
                    suspendedAt: null,
                    suspensionReason: null,
                    suspendedBy: null
                });
            });

            return true;
        } catch (error) {
            console.error('Error unsuspending user:', error);
            throw new Error('Failed to unsuspend user');
        }
    }

    async removeListing(listingId, reason = '') {
        try {
            const listingRef = doc(db, 'listings', listingId);
            await runTransaction(db, async (transaction) => {
                const listingDoc = await transaction.get(listingRef);
                if (!listingDoc.exists()) {
                    throw new Error('Listing not found');
                }

                transaction.update(listingRef, {
                    status: 'removed',
                    removedAt: serverTimestamp(),
                    removalReason: reason,
                    removedBy: this.currentAdminId
                });
            });

            return true;
        } catch (error) {
            console.error('Error removing listing:', error);
            throw new Error('Failed to remove listing');
        }
    }

    cleanup() {
        this.isInitialized = false;
        this.currentAdminId = null;
    }
}

// Create singleton instance
const adminService = new AdminService();

export default adminService; 