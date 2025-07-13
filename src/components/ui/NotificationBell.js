// src/components/ui/NotificationBell.js
import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Settings, MessageCircle, ShoppingCart, Star, Package, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import pushNotificationService from '../../lib/pushNotificationService';
import { timeAgo } from '../../lib/utils';
import { useTeReo, TeReoText } from './TeReoToggle';

const NotificationBell = ({ onNavigate }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const { getText } = useTeReo();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load notifications when user is authenticated
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        setIsLoading(true);

        // Load notifications
        const unsubscribeNotifications = pushNotificationService.getUserNotifications(
            currentUser.uid,
            (notifications) => {
                setNotifications(notifications);
                setIsLoading(false);
            }
        );

        // Load unread count
        const unsubscribeUnreadCount = pushNotificationService.getUnreadCount(
            currentUser.uid,
            (count) => {
                setUnreadCount(count);
            }
        );

        return () => {
            if (unsubscribeNotifications) unsubscribeNotifications();
            if (unsubscribeUnreadCount) unsubscribeUnreadCount();
        };
    }, [currentUser]);

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await pushNotificationService.markNotificationAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.type === 'message') {
            onNavigate('messages');
        } else if (notification.type === 'listing') {
            onNavigate('item-detail', { id: notification.listingId });
        } else if (notification.type === 'auction') {
            onNavigate('auction', { id: notification.auctionId });
        } else if (notification.type === 'order') {
            onNavigate('orders');
        }

        setIsOpen(false);
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await pushNotificationService.markAllNotificationsAsRead(currentUser.uid);
            showNotification('All notifications marked as read', 'success');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            showNotification('Failed to mark notifications as read', 'error');
        }
    };

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'message':
                return <MessageCircle size={16} className="text-blue-500" />;
            case 'order':
                return <ShoppingCart size={16} className="text-green-500" />;
            case 'listing':
                return <Package size={16} className="text-purple-500" />;
            case 'auction':
                return <Star size={16} className="text-yellow-500" />;
            case 'system':
                return <Settings size={16} className="text-gray-500" />;
            default:
                return <Bell size={16} className="text-gray-500" />;
        }
    };

    // Get notification color based on type
    const getNotificationColor = (type) => {
        switch (type) {
            case 'message':
                return 'border-l-blue-500 bg-blue-50';
            case 'order':
                return 'border-l-green-500 bg-green-50';
            case 'listing':
                return 'border-l-purple-500 bg-purple-50';
            case 'auction':
                return 'border-l-yellow-500 bg-yellow-50';
            case 'system':
                return 'border-l-gray-500 bg-gray-50';
            default:
                return 'border-l-gray-500 bg-gray-50';
        }
    };

    if (!currentUser) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            <TeReoText english="Notifications" teReoKey="notifications" />
                        </h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <TeReoText english="Mark all read" teReoKey="markAllRead" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">
                                    <TeReoText english="Loading notifications..." teReoKey="loadingNotifications" />
                                </p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">
                                    <TeReoText english="No notifications yet" teReoKey="noNotifications" />
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    <TeReoText english="We'll notify you when something happens" teReoKey="notificationHint" />
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notification.body}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-400">
                                                        {notification.createdAt ? timeAgo(notification.createdAt) : 'Just now'}
                                                    </span>
                                                    {notification.data?.action && (
                                                        <span className="text-xs text-blue-600 font-medium">
                                                            {notification.data.action}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => onNavigate('notifications')}
                                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium text-center"
                            >
                                <TeReoText english="View all notifications" teReoKey="viewAllNotifications" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell; 