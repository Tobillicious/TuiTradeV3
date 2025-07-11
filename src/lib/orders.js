// src/lib/orders.js
import { collection, addDoc, doc, updateDoc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Order status enum
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

// Payment status enum
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

// Create a new order
export const createOrder = async (orderData) => {
    try {
        const order = {
            // Buyer information
            buyerId: orderData.buyerId,
            buyerEmail: orderData.buyerEmail,
            
            // Seller information
            sellerId: orderData.sellerId,
            sellerEmail: orderData.sellerEmail,
            
            // Item information
            itemId: orderData.itemId,
            itemTitle: orderData.itemTitle,
            itemDescription: orderData.itemDescription,
            itemImages: orderData.itemImages || [],
            itemCategory: orderData.itemCategory,
            
            // Pricing
            itemPrice: orderData.itemPrice,
            serviceFee: orderData.serviceFee || 0,
            totalAmount: orderData.totalAmount,
            currency: orderData.currency || 'NZD',
            
            // Shipping information
            shippingAddress: orderData.shippingAddress,
            shippingMethod: orderData.shippingMethod || 'standard',
            shippingCost: orderData.shippingCost || 0,
            
            // Status tracking
            orderStatus: ORDER_STATUS.PENDING,
            paymentStatus: PAYMENT_STATUS.PENDING,
            
            // Timestamps
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            
            // Payment tracking
            paymentIntentId: null,
            transactionId: null,
            
            // Delivery tracking
            trackingNumber: null,
            estimatedDelivery: null,
            actualDelivery: null,
            
            // Additional data
            notes: orderData.notes || '',
            metadata: orderData.metadata || {}
        };

        const docRef = await addDoc(collection(db, 'orders'), order);
        return { id: docRef.id, ...order };
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

// Update order status
export const updateOrderStatus = async (orderId, status, additionalData = {}) => {
    try {
        const updateData = {
            orderStatus: status,
            updatedAt: serverTimestamp(),
            ...additionalData
        };

        // Add status-specific timestamps
        switch (status) {
            case ORDER_STATUS.CONFIRMED:
                updateData.confirmedAt = serverTimestamp();
                break;
            case ORDER_STATUS.PROCESSING:
                updateData.processingAt = serverTimestamp();
                break;
            case ORDER_STATUS.SHIPPED:
                updateData.shippedAt = serverTimestamp();
                break;
            case ORDER_STATUS.DELIVERED:
                updateData.deliveredAt = serverTimestamp();
                break;
            case ORDER_STATUS.CANCELLED:
                updateData.cancelledAt = serverTimestamp();
                break;
            default:
                // No specific timestamp for other statuses
                break;
        }

        await updateDoc(doc(db, 'orders', orderId), updateData);
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

// Update payment status
export const updatePaymentStatus = async (orderId, status, paymentData = {}) => {
    try {
        const updateData = {
            paymentStatus: status,
            updatedAt: serverTimestamp(),
            ...paymentData
        };

        // Add payment-specific timestamps
        switch (status) {
            case PAYMENT_STATUS.COMPLETED:
                updateData.paidAt = serverTimestamp();
                break;
            case PAYMENT_STATUS.FAILED:
                updateData.failedAt = serverTimestamp();
                break;
            case PAYMENT_STATUS.REFUNDED:
                updateData.refundedAt = serverTimestamp();
                break;
            default:
                // No specific timestamp for other payment statuses
                break;
        }

        await updateDoc(doc(db, 'orders', orderId), updateData);
        return true;
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
};

// Get order by ID
export const getOrder = async (orderId) => {
    try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
            return { id: orderDoc.id, ...orderDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

// Get orders for a user (buyer or seller)
export const getUserOrders = async (userId, role = 'buyer') => {
    try {
        const field = role === 'buyer' ? 'buyerId' : 'sellerId';
        const q = query(
            collection(db, 'orders'),
            where(field, '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            confirmedAt: doc.data().confirmedAt?.toDate(),
            processingAt: doc.data().processingAt?.toDate(),
            shippedAt: doc.data().shippedAt?.toDate(),
            deliveredAt: doc.data().deliveredAt?.toDate(),
            paidAt: doc.data().paidAt?.toDate()
        }));
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
};

// Calculate service fee (TuiTrade's commission)
export const calculateServiceFee = (itemPrice, listingType = 'fixed-price') => {
    const baseFee = 0.05; // 5% base fee
    
    // Different fees for different listing types
    const feeRates = {
        'fixed-price': 0.05, // 5%
        'auction': 0.075,    // 7.5%
        'classified': 0.03   // 3%
    };
    
    const rate = feeRates[listingType] || baseFee;
    const fee = itemPrice * rate;
    
    // Minimum fee of $1 NZD
    return Math.max(fee, 1.00);
};

// Calculate total order amount
export const calculateOrderTotal = (itemPrice, shippingCost = 0, listingType = 'fixed-price') => {
    const serviceFee = calculateServiceFee(itemPrice, listingType);
    return {
        itemPrice,
        serviceFee,
        shippingCost,
        totalAmount: itemPrice + serviceFee + shippingCost
    };
};

// Add tracking information
export const addTrackingInfo = async (orderId, trackingNumber, carrier, estimatedDelivery = null) => {
    try {
        const updateData = {
            trackingNumber,
            carrier,
            updatedAt: serverTimestamp()
        };

        if (estimatedDelivery) {
            updateData.estimatedDelivery = estimatedDelivery;
        }

        await updateDoc(doc(db, 'orders', orderId), updateData);
        return true;
    } catch (error) {
        console.error('Error adding tracking info:', error);
        throw error;
    }
};

// Mark order as delivered
export const markAsDelivered = async (orderId) => {
    try {
        await updateOrderStatus(orderId, ORDER_STATUS.DELIVERED, {
            actualDelivery: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error marking order as delivered:', error);
        throw error;
    }
};

// Cancel order
export const cancelOrder = async (orderId, reason = '') => {
    try {
        await updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, {
            cancellationReason: reason
        });
        return true;
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
};

// Get order statistics for seller dashboard
export const getOrderStats = async (sellerId, timeRange = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeRange);

        const q = query(
            collection(db, 'orders'),
            where('sellerId', '==', sellerId),
            where('createdAt', '>=', cutoffDate)
        );

        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const stats = {
            totalOrders: orders.length,
            totalRevenue: 0,
            completedOrders: 0,
            pendingOrders: 0,
            averageOrderValue: 0
        };

        orders.forEach(order => {
            stats.totalRevenue += order.itemPrice || 0;
            
            if (order.orderStatus === ORDER_STATUS.DELIVERED) {
                stats.completedOrders++;
            } else if ([ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(order.orderStatus)) {
                stats.pendingOrders++;
            }
        });

        stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

        return stats;
    } catch (error) {
        console.error('Error fetching order stats:', error);
        throw error;
    }
};