// src/components/pages/OrdersPage.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders, ORDER_STATUS, PAYMENT_STATUS } from '../../lib/orders';
import { formatPrice, timeAgo } from '../../lib/utils';
import { FullPageLoader } from '../ui/Loaders';
import { 
    Package, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Truck, 
    Home, 
    ChevronRight,
    Eye,
    MessageCircle
} from 'lucide-react';

const OrdersPage = ({ onNavigate }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'seller'
    
    const { currentUser } = useAuth();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const userOrders = await getUserOrders(currentUser.uid, activeTab);
            setOrders(userOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser, activeTab]);

    useEffect(() => {
        if (currentUser) {
            fetchOrders();
        }
    }, [currentUser, fetchOrders]);

    const getStatusIcon = (status) => {
        switch (status) {
            case ORDER_STATUS.PENDING:
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case ORDER_STATUS.CONFIRMED:
            case ORDER_STATUS.PROCESSING:
                return <Package className="w-5 h-5 text-blue-500" />;
            case ORDER_STATUS.SHIPPED:
                return <Truck className="w-5 h-5 text-purple-500" />;
            case ORDER_STATUS.DELIVERED:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case ORDER_STATUS.CANCELLED:
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case ORDER_STATUS.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case ORDER_STATUS.CONFIRMED:
            case ORDER_STATUS.PROCESSING:
                return 'bg-blue-100 text-blue-800';
            case ORDER_STATUS.SHIPPED:
                return 'bg-purple-100 text-purple-800';
            case ORDER_STATUS.DELIVERED:
                return 'bg-green-100 text-green-800';
            case ORDER_STATUS.CANCELLED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case PAYMENT_STATUS.COMPLETED:
                return 'bg-green-100 text-green-800';
            case PAYMENT_STATUS.PENDING:
            case PAYMENT_STATUS.PROCESSING:
                return 'bg-yellow-100 text-yellow-800';
            case PAYMENT_STATUS.FAILED:
                return 'bg-red-100 text-red-800';
            case PAYMENT_STATUS.REFUNDED:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <FullPageLoader message="Loading your orders..." />;
    }

    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        Home
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">Orders</span>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">View and manage your purchases and sales</p>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('buyer')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'buyer'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                My Purchases
                            </button>
                            <button
                                onClick={() => setActiveTab('seller')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'seller'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                My Sales
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No {activeTab === 'buyer' ? 'purchases' : 'sales'} yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {activeTab === 'buyer' 
                                ? "Start shopping to see your orders here"
                                : "List items to start selling"
                            }
                        </p>
                        <button
                            onClick={() => onNavigate(activeTab === 'buyer' ? 'home' : 'create-listing')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {activeTab === 'buyer' ? 'Start Shopping' : 'Create Listing'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(order.orderStatus)}
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {order.itemTitle}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Order #{order.id.slice(-8)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatPrice(order.totalAmount)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {order.createdAt ? timeAgo(order.createdAt) : 'Recently'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Order Status</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Payment Status</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                {activeTab === 'buyer' ? 'Seller' : 'Buyer'}
                                            </p>
                                            <p className="text-sm text-gray-900">
                                                {activeTab === 'buyer' ? order.sellerEmail : order.buyerEmail}
                                            </p>
                                        </div>
                                    </div>

                                    {order.trackingNumber && (
                                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm font-medium text-blue-900">Tracking Information</p>
                                            <p className="text-sm text-blue-700">
                                                Tracking Number: {order.trackingNumber}
                                            </p>
                                            {order.carrier && (
                                                <p className="text-sm text-blue-700">
                                                    Carrier: {order.carrier}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {order.shippingAddress && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Shipping Address</p>
                                            <div className="text-sm text-gray-600">
                                                <p>{order.shippingAddress.line1}</p>
                                                <p>
                                                    {order.shippingAddress.city}, {order.shippingAddress.postal_code}
                                                </p>
                                                <p>{order.shippingAddress.country}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => onNavigate('item-detail', { itemId: order.itemId })}
                                                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                <Eye size={16} />
                                                <span>View Item</span>
                                            </button>
                                            <button
                                                onClick={() => onNavigate('messages')}
                                                className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
                                            >
                                                <MessageCircle size={16} />
                                                <span>Message {activeTab === 'buyer' ? 'Seller' : 'Buyer'}</span>
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Last updated: {order.updatedAt ? timeAgo(order.updatedAt) : 'Recently'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;