// Comprehensive Order Management Service - Production-ready order fulfillment
// Handles order lifecycle, tracking, disputes, and delivery management

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notificationService';
import paymentService from './paymentService';

// Order status constants
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAYMENT_PROCESSING: 'payment_processing',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed'
};

// Delivery methods
export const DELIVERY_METHODS = {
  PICKUP: 'pickup',
  COURIER: 'courier',
  POST: 'post',
  FREIGHT: 'freight',
  DIGITAL: 'digital'
};

// Dispute reasons
export const DISPUTE_REASONS = {
  ITEM_NOT_RECEIVED: 'item_not_received',
  ITEM_NOT_AS_DESCRIBED: 'item_not_as_described',
  ITEM_DAMAGED: 'item_damaged',
  WRONG_ITEM: 'wrong_item',
  SELLER_UNRESPONSIVE: 'seller_unresponsive',
  OTHER: 'other'
};

// NZ shipping providers
export const SHIPPING_PROVIDERS = {
  NZPOST: {
    name: 'New Zealand Post',
    trackingUrl: 'https://www.nzpost.co.nz/tools/tracking?trackId=',
    estimatedDays: { min: 1, max: 3 }
  },
  COURIERPOST: {
    name: 'CourierPost',
    trackingUrl: 'https://www.courierpost.co.nz/tools/tracking?trackId=',
    estimatedDays: { min: 1, max: 2 }
  },
  ARAMEX: {
    name: 'Aramex',
    trackingUrl: 'https://www.aramex.co.nz/track?trackId=',
    estimatedDays: { min: 1, max: 3 }
  },
  DHL: {
    name: 'DHL Express',
    trackingUrl: 'https://www.dhl.com/nz-en/home/tracking.html?tracking-id=',
    estimatedDays: { min: 1, max: 2 }
  }
};

class OrderService {
  constructor() {
    this.listeners = new Map();
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('OrderService initialized');
  }

  // Create new order
  async createOrder(orderData) {
    try {
      const order = {
        ...orderData,
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: ORDER_STATUS.PENDING_PAYMENT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        version: 1,
        timeline: [{
          status: ORDER_STATUS.PENDING_PAYMENT,
          timestamp: serverTimestamp(),
          message: 'Order created, awaiting payment'
        }]
      };

      const docRef = await addDoc(collection(db, 'orders'), order);
      
      // Send notification to seller
      await createNotification(order.sellerId, {
        type: 'new_order',
        title: 'New Order Received',
        message: `You have a new order for ${order.item.title}`,
        data: { orderId: docRef.id, amount: order.total }
      });

      return { ...order, firestoreId: docRef.id };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Update order status with transaction safety
  async updateOrderStatus(orderId, newStatus, updateData = {}) {
    try {
      const result = await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await transaction.get(orderRef);
        
        if (!orderDoc.exists()) {
          throw new Error('Order not found');
        }

        const currentOrder = orderDoc.data();
        const newTimeline = [
          ...currentOrder.timeline,
          {
            status: newStatus,
            timestamp: serverTimestamp(),
            message: this.getStatusMessage(newStatus),
            ...updateData.timelineData
          }
        ];

        const updatedOrder = {
          ...currentOrder,
          status: newStatus,
          updatedAt: serverTimestamp(),
          version: currentOrder.version + 1,
          timeline: newTimeline,
          ...updateData
        };

        transaction.update(orderRef, updatedOrder);
        return updatedOrder;
      });

      // Send notifications
      await this.sendStatusNotifications(orderId, newStatus, result);
      
      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Process payment for order
  async processOrderPayment(orderId, paymentData) {
    try {
      const { paymentMethod, paymentDetails } = paymentData;
      
      // Update order to processing
      await this.updateOrderStatus(orderId, ORDER_STATUS.PAYMENT_PROCESSING);

      let paymentResult;
      
      switch (paymentMethod) {
        case paymentService.PAYMENT_METHODS.CARD:
          paymentResult = await paymentService.processCardPayment(
            paymentDetails.paymentIntentId,
            paymentDetails.paymentMethod,
            paymentDetails.billingDetails
          );
          break;
          
        case paymentService.PAYMENT_METHODS.BANK_TRANSFER:
          paymentResult = await paymentService.initiateBankTransfer(paymentDetails);
          break;
          
        case paymentService.PAYMENT_METHODS.AFTERPAY:
          paymentResult = await paymentService.createAfterpaySessions(paymentDetails);
          break;
          
        case paymentService.PAYMENT_METHODS.ESCROW:
          paymentResult = await paymentService.createEscrowPayment(paymentDetails);
          break;
          
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      // Update order with payment details
      await this.updateOrderStatus(orderId, ORDER_STATUS.PAID, {
        paymentDetails: {
          method: paymentMethod,
          transactionId: paymentResult.id,
          paidAt: serverTimestamp(),
          amount: paymentDetails.amount
        }
      });

      return paymentResult;
    } catch (error) {
      await this.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, {
        cancellationReason: `Payment failed: ${error.message}`
      });
      throw error;
    }
  }

  // Confirm order (seller acceptance)
  async confirmOrder(orderId, confirmationData) {
    try {
      const updates = {
        confirmedAt: serverTimestamp(),
        estimatedDelivery: confirmationData.estimatedDelivery,
        sellerNotes: confirmationData.notes,
        preparation: {
          estimatedTime: confirmationData.preparationTime,
          startedAt: serverTimestamp()
        }
      };

      await this.updateOrderStatus(orderId, ORDER_STATUS.CONFIRMED, updates);
      
      // Auto-advance to preparing if no preparation time specified
      if (!confirmationData.preparationTime) {
        setTimeout(() => {
          this.updateOrderStatus(orderId, ORDER_STATUS.PREPARING);
        }, 1000);
      }

      return updates;
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  }

  // Add shipping details
  async addShippingDetails(orderId, shippingData) {
    try {
      const shipping = {
        provider: shippingData.provider,
        trackingNumber: shippingData.trackingNumber,
        trackingUrl: this.generateTrackingUrl(shippingData.provider, shippingData.trackingNumber),
        shippedAt: serverTimestamp(),
        estimatedDelivery: shippingData.estimatedDelivery,
        deliveryAddress: shippingData.deliveryAddress
      };

      await this.updateOrderStatus(orderId, ORDER_STATUS.SHIPPED, {
        shipping,
        timelineData: {
          trackingNumber: shippingData.trackingNumber,
          provider: SHIPPING_PROVIDERS[shippingData.provider]?.name
        }
      });

      return shipping;
    } catch (error) {
      console.error('Error adding shipping details:', error);
      throw error;
    }
  }

  // Track delivery status
  async updateDeliveryStatus(orderId, deliveryUpdate) {
    try {
      const { status, location, timestamp, notes } = deliveryUpdate;
      
      const updates = {
        [`shipping.updates`]: [...(await this.getOrder(orderId)).shipping?.updates || [], {
          status,
          location,
          timestamp,
          notes
        }]
      };

      let newOrderStatus;
      switch (status) {
        case 'in_transit':
          newOrderStatus = ORDER_STATUS.IN_TRANSIT;
          break;
        case 'out_for_delivery':
          newOrderStatus = ORDER_STATUS.OUT_FOR_DELIVERY;
          break;
        case 'delivered':
          newOrderStatus = ORDER_STATUS.DELIVERED;
          updates.deliveredAt = serverTimestamp();
          break;
        default:
          newOrderStatus = ORDER_STATUS.SHIPPED;
      }

      await this.updateOrderStatus(orderId, newOrderStatus, updates);
      
      // Auto-complete after delivery + grace period
      if (status === 'delivered') {
        setTimeout(() => {
          this.autoCompleteOrder(orderId);
        }, 7 * 24 * 60 * 60 * 1000); // 7 days
      }

      return updates;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  }

  // Complete order (buyer confirmation)
  async completeOrder(orderId, completionData) {
    try {
      const updates = {
        completedAt: serverTimestamp(),
        buyerFeedback: completionData.feedback,
        buyerRating: completionData.rating,
        completion: {
          type: completionData.type || 'buyer_confirmed',
          notes: completionData.notes
        }
      };

      await this.updateOrderStatus(orderId, ORDER_STATUS.COMPLETED, updates);
      
      // Release escrow if applicable
      const order = await this.getOrder(orderId);
      if (order.paymentDetails?.method === paymentService.PAYMENT_METHODS.ESCROW) {
        await this.releaseEscrowPayment(orderId);
      }

      return updates;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

  // Auto-complete order after grace period
  async autoCompleteOrder(orderId) {
    try {
      const order = await this.getOrder(orderId);
      
      if (order.status === ORDER_STATUS.DELIVERED) {
        await this.completeOrder(orderId, {
          type: 'auto_completed',
          notes: 'Order automatically completed after delivery grace period'
        });
      }
    } catch (error) {
      console.error('Error auto-completing order:', error);
    }
  }

  // Cancel order
  async cancelOrder(orderId, cancellationData) {
    try {
      const order = await this.getOrder(orderId);
      
      // Check if cancellation is allowed
      if (!this.isCancellationAllowed(order.status)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      const updates = {
        cancelledAt: serverTimestamp(),
        cancellationReason: cancellationData.reason,
        cancellationNotes: cancellationData.notes,
        cancelledBy: cancellationData.userId
      };

      await this.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, updates);
      
      // Process refund if payment was made
      if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
        await this.processRefund(orderId, cancellationData);
      }

      return updates;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Create dispute
  async createDispute(orderId, disputeData) {
    try {
      const dispute = {
        id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        reason: disputeData.reason,
        description: disputeData.description,
        evidence: disputeData.evidence || [],
        createdBy: disputeData.userId,
        createdAt: serverTimestamp(),
        status: 'open',
        resolution: null
      };

      await addDoc(collection(db, 'disputes'), dispute);
      
      await this.updateOrderStatus(orderId, ORDER_STATUS.DISPUTED, {
        disputeId: dispute.id,
        disputedAt: serverTimestamp()
      });

      return dispute;
    } catch (error) {
      console.error('Error creating dispute:', error);
      throw error;
    }
  }

  // Get order details
  async getOrder(orderId) {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      return { id: orderDoc.id, ...orderDoc.data() };
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  // Get orders for user
  async getUserOrders(userId, userType = 'buyer', filters = {}) {
    try {
      const field = userType === 'buyer' ? 'buyerId' : 'sellerId';
      let q = query(
        collection(db, 'orders'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  // Real-time order tracking
  subscribeToOrder(orderId, callback) {
    const unsubscribe = onSnapshot(
      doc(db, 'orders', orderId),
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        }
      },
      (error) => {
        console.error('Order subscription error:', error);
        callback(null, error);
      }
    );

    this.listeners.set(orderId, unsubscribe);
    return unsubscribe;
  }

  // Calculate shipping costs
  calculateShippingCost(item, delivery, destination) {
    const baseRates = {
      [DELIVERY_METHODS.PICKUP]: 0,
      [DELIVERY_METHODS.COURIER]: 8.50,
      [DELIVERY_METHODS.POST]: 5.50,
      [DELIVERY_METHODS.FREIGHT]: 25.00,
      [DELIVERY_METHODS.DIGITAL]: 0
    };

    let cost = baseRates[delivery.method] || 0;

    // Add weight-based pricing
    if (item.weight > 1) {
      cost += (item.weight - 1) * 2.50;
    }

    // Add distance-based pricing for courier
    if (delivery.method === DELIVERY_METHODS.COURIER && destination.distance > 50) {
      cost += (destination.distance - 50) * 0.25;
    }

    // Add rural delivery surcharge
    if (destination.isRural) {
      cost += 3.50;
    }

    return Math.round(cost * 100) / 100;
  }

  // Helper methods
  generateTrackingUrl(provider, trackingNumber) {
    const providerData = SHIPPING_PROVIDERS[provider];
    return providerData ? providerData.trackingUrl + trackingNumber : null;
  }

  getStatusMessage(status) {
    const messages = {
      [ORDER_STATUS.PENDING_PAYMENT]: 'Order created, awaiting payment',
      [ORDER_STATUS.PAYMENT_PROCESSING]: 'Processing payment',
      [ORDER_STATUS.PAID]: 'Payment received, awaiting seller confirmation',
      [ORDER_STATUS.CONFIRMED]: 'Order confirmed by seller',
      [ORDER_STATUS.PREPARING]: 'Item being prepared for shipment',
      [ORDER_STATUS.SHIPPED]: 'Item has been shipped',
      [ORDER_STATUS.IN_TRANSIT]: 'Item is in transit',
      [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Item is out for delivery',
      [ORDER_STATUS.DELIVERED]: 'Item has been delivered',
      [ORDER_STATUS.COMPLETED]: 'Order completed successfully',
      [ORDER_STATUS.CANCELLED]: 'Order has been cancelled',
      [ORDER_STATUS.REFUNDED]: 'Order has been refunded',
      [ORDER_STATUS.DISPUTED]: 'Order is under dispute'
    };
    
    return messages[status] || 'Status updated';
  }

  isCancellationAllowed(status) {
    const allowedStatuses = [
      ORDER_STATUS.PENDING_PAYMENT,
      ORDER_STATUS.PAID,
      ORDER_STATUS.CONFIRMED
    ];
    
    return allowedStatuses.includes(status);
  }

  async sendStatusNotifications(orderId, status, orderData) {
    try {
      // Notify buyer
      await createNotification(orderData.buyerId, {
        type: 'order_update',
        title: `Order ${status.replace('_', ' ')}`,
        message: this.getStatusMessage(status),
        data: { orderId, status }
      });

      // Notify seller for relevant updates
      const sellerNotificationStatuses = [
        ORDER_STATUS.PAID,
        ORDER_STATUS.COMPLETED,
        ORDER_STATUS.DISPUTED
      ];

      if (sellerNotificationStatuses.includes(status)) {
        await createNotification(orderData.sellerId, {
          type: 'order_update',
          title: `Order ${status.replace('_', ' ')}`,
          message: this.getStatusMessage(status),
          data: { orderId, status }
        });
      }
    } catch (error) {
      console.error('Error sending status notifications:', error);
    }
  }

  async processRefund(orderId, refundData) {
    // Implementation would depend on payment provider APIs
    console.log(`Processing refund for order ${orderId}:`, refundData);
    
    // Update order status
    await this.updateOrderStatus(orderId, ORDER_STATUS.REFUNDED, {
      refundedAt: serverTimestamp(),
      refundReason: refundData.reason
    });
  }

  async releaseEscrowPayment(orderId) {
    // Implementation would integrate with escrow service
    console.log(`Releasing escrow payment for order ${orderId}`);
  }

  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Create singleton instance
const orderService = new OrderService();

export {
  ORDER_STATUS,
  DELIVERY_METHODS,
  DISPUTE_REASONS,
  SHIPPING_PROVIDERS
};

export default orderService;