// =============================================
// pushNotificationService.js - Push Notification Logic
// ----------------------------------------------------
// Handles push notification registration, delivery, and management
// for real-time user notifications. Integrates with NotificationBell and context.
// =============================================
// src/lib/pushNotificationService.js
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

class PushNotificationService {
    constructor() {
        this.messaging = null;
        this.isSupported = false;
        this.currentUser = null;
        this.listeners = new Set();
        this.notificationCallbacks = new Set();
        this.init();
    }

    async init() {
        try {
            this.isSupported = await isSupported();
            if (this.isSupported) {
                this.messaging = getMessaging();
                console.log('🔔 Push notifications supported');
            } else {
                console.warn('⚠️ Push notifications not supported in this browser');
            }
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    // Request permission and get FCM token
    async requestPermission() {
        if (!this.isSupported || !this.messaging) {
            console.warn('Push notifications not supported');
            return null;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(this.messaging, {
                    vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
                });
                console.log('🔔 Push notification token obtained:', token);
                return token;
            } else {
                console.warn('Notification permission denied');
                return null;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return null;
        }
    }

    // Save FCM token to user's profile
    async saveTokenToUser(token, userId) {
        if (!token || !userId) return;

        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                fcmToken: token,
                notificationSettings: {
                    enabled: true,
                    lastUpdated: new Date()
                }
            });
            console.log('✅ FCM token saved to user profile');
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    }

    // Listen for foreground messages
    onForegroundMessage(callback) {
        if (!this.isSupported || !this.messaging) return;

        const unsubscribe = onMessage(this.messaging, (payload) => {
            console.log('📨 Foreground message received:', payload);

            // Show custom notification
            this.showCustomNotification(payload);

            // Call callback
            if (callback) callback(payload);
        });

        this.listeners.add(unsubscribe);
        return unsubscribe;
    }

    // Show custom notification
    showCustomNotification(payload) {
        const { notification, data } = payload;

        if (Notification.permission === 'granted') {
            const customNotification = new Notification(notification.title, {
                body: notification.body,
                icon: '/logo192.png',
                badge: '/logo192.png',
                tag: data?.tag || 'tuitrade-notification',
                data: data,
                requireInteraction: data?.requireInteraction === 'true',
                actions: this.parseNotificationActions(data?.actions)
            });

            // Handle notification click
            customNotification.onclick = (event) => {
                event.preventDefault();
                this.handleNotificationClick(data);
                customNotification.close();
            };

            // Auto-close after 5 seconds unless requireInteraction is true
            if (data?.requireInteraction !== 'true') {
                setTimeout(() => {
                    customNotification.close();
                }, 5000);
            }
        }
    }

    // Parse notification actions from data
    parseNotificationActions(actionsString) {
        if (!actionsString) return [];

        try {
            const actions = JSON.parse(actionsString);
            return actions.map(action => ({
                action: action.action,
                title: action.title,
                icon: action.icon
            }));
        } catch (error) {
            console.warn('Error parsing notification actions:', error);
            return [];
        }
    }

    // Handle notification click
    handleNotificationClick(data) {
        // Notify all registered callbacks
        this.notificationCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in notification callback:', error);
            }
        });

        // Handle specific notification types
        if (data?.type === 'message') {
            // Navigate to messages page
            window.location.href = '/messages';
        } else if (data?.type === 'listing') {
            // Navigate to listing detail
            window.location.href = `/item/${data.listingId}`;
        } else if (data?.type === 'auction') {
            // Navigate to auction
            window.location.href = `/auction/${data.auctionId}`;
        } else if (data?.type === 'order') {
            // Navigate to order detail
            window.location.href = `/orders/${data.orderId}`;
        }
    }

    // Register notification click handler
    onNotificationClick(callback) {
        this.notificationCallbacks.add(callback);
        return () => {
            this.notificationCallbacks.delete(callback);
        };
    }

    // Send notification to specific user
    async sendNotificationToUser(userId, notification) {
        try {
            const notificationRef = doc(db, 'notifications', `${userId}_${Date.now()}`);
            await setDoc(notificationRef, {
                userId,
                ...notification,
                createdAt: new Date(),
                read: false
            });
            console.log('✅ Notification sent to user:', userId);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    // Send notification to multiple users
    async sendNotificationToUsers(userIds, notification) {
        const promises = userIds.map(userId =>
            this.sendNotificationToUser(userId, notification)
        );
        await Promise.all(promises);
    }

    // Mark notification as read
    async markNotificationAsRead(notificationId) {
        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                read: true,
                readAt: new Date()
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Mark all notifications as read for user
    async markAllNotificationsAsRead(userId) {
        try {
            // This would require a batch update in a real implementation
            // For now, we'll just log the action
            console.log('Marking all notifications as read for user:', userId);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    // Get user's notifications
    getUserNotifications(userId, callback) {
        if (!userId) return;

        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            if (callback) callback(notifications);
        });

        this.listeners.add(unsubscribe);
        return unsubscribe;
    }

    // Get unread notification count
    getUnreadCount(userId, callback) {
        if (!userId) return;

        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (callback) callback(snapshot.size);
        });

        this.listeners.add(unsubscribe);
        return unsubscribe;
    }

    // Update user's notification settings
    async updateNotificationSettings(userId, settings) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                notificationSettings: {
                    ...settings,
                    lastUpdated: new Date()
                }
            });
            console.log('✅ Notification settings updated');
        } catch (error) {
            console.error('Error updating notification settings:', error);
        }
    }

    // Subscribe to topic (for category-based notifications)
    async subscribeToTopic(token, topic) {
        if (!token || !topic) return;

        try {
            // In a real implementation, this would call Firebase Functions
            // to subscribe the token to the topic
            console.log(`Subscribing to topic: ${topic}`);

            // For now, we'll just log the action
            // In production, you'd call a Cloud Function like:
            // await fetch('/api/notifications/subscribe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ token, topic })
            // });
        } catch (error) {
            console.error('Error subscribing to topic:', error);
        }
    }

    // Unsubscribe from topic
    async unsubscribeFromTopic(token, topic) {
        if (!token || !topic) return;

        try {
            console.log(`Unsubscribing from topic: ${topic}`);
            // Similar to subscribeToTopic, this would call Firebase Functions
        } catch (error) {
            console.error('Error unsubscribing from topic:', error);
        }
    }

    // Cleanup all listeners
    cleanup() {
        this.listeners.forEach(unsubscribe => {
            try {
                unsubscribe();
            } catch (error) {
                console.warn('Error cleaning up notification listener:', error);
            }
        });
        this.listeners.clear();
        this.notificationCallbacks.clear();
    }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

// React hook for push notifications
export const usePushNotifications = () => {
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            // Request permission and save token
            pushNotificationService.requestPermission().then(token => {
                if (token) {
                    pushNotificationService.saveTokenToUser(token, currentUser.uid);
                }
            });

            // Set up foreground message listener
            const unsubscribe = pushNotificationService.onForegroundMessage((payload) => {
                console.log('Received foreground message:', payload);
            });

            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [currentUser]);

    return pushNotificationService;
};

export default pushNotificationService; 