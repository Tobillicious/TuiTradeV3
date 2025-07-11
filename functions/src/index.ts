import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import * as cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

// CORS configuration
const corsHandler = cors({
  origin: true,
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Helper function to verify Firebase auth token
const verifyAuthToken = async (authHeader: string | undefined) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid auth header');
  }
  
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Unauthorized: Invalid token');
  }
};

// Create Payment Intent
export const createPaymentIntent = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Verify authentication
      const authUser = await verifyAuthToken(req.headers.authorization);
      
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const {
        amount,
        currency,
        itemId,
        sellerId,
        buyerId,
        customerDetails
      } = req.body;

      // Validate required fields
      if (!amount || !currency || !itemId || !sellerId || !buyerId || !customerDetails) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Verify the buyer matches the authenticated user
      if (buyerId !== authUser.uid) {
        res.status(403).json({ error: 'Unauthorized: User mismatch' });
        return;
      }

      // Verify the item exists and is available
      const itemDoc = await db.collection('listings').doc(itemId).get();
      if (!itemDoc.exists) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      const itemData = itemDoc.data();
      if (itemData?.status === 'sold') {
        res.status(400).json({ error: 'Item is no longer available' });
        return;
      }

      // Verify the seller exists
      const sellerDoc = await db.collection('users').doc(sellerId).get();
      if (!sellerDoc.exists) {
        res.status(404).json({ error: 'Seller not found' });
        return;
      }

      // Create order record first
      const orderRef = db.collection('orders').doc();
      const orderData = {
        id: orderRef.id,
        itemId: itemId,
        itemTitle: itemData?.title || 'Unknown Item',
        sellerId: sellerId,
        buyerId: buyerId,
        amount: amount,
        currency: currency,
        status: 'pending',
        paymentStatus: 'pending',
        customerDetails: customerDetails,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await orderRef.set(orderData);

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        metadata: {
          orderId: orderRef.id,
          itemId: itemId,
          sellerId: sellerId,
          buyerId: buyerId,
        },
        description: `Purchase of ${itemData?.title || 'Item'} on TuiTrade`,
        receipt_email: customerDetails.email,
      });

      // Update order with payment intent ID
      await orderRef.update({
        paymentIntentId: paymentIntent.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        orderId: orderRef.id,
      });

    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Stripe Webhook Handler
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err}`);
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  const itemId = paymentIntent.metadata.itemId;
  
  if (!orderId || !itemId) {
    console.error('Missing metadata in payment intent');
    return;
  }

  // Update order status
  await db.collection('orders').doc(orderId).update({
    status: 'completed',
    paymentStatus: 'completed',
    paidAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Mark item as sold
  await db.collection('listings').doc(itemId).update({
    status: 'sold',
    soldAt: admin.firestore.FieldValue.serverTimestamp(),
    soldTo: paymentIntent.metadata.buyerId,
  });

  console.log(`Payment successful for order ${orderId}`);
};

// Handle failed payment
const handlePaymentFailure = async (paymentIntent: Stripe.PaymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  
  if (!orderId) {
    console.error('Missing orderId in payment intent metadata');
    return;
  }

  // Update order status
  await db.collection('orders').doc(orderId).update({
    status: 'failed',
    paymentStatus: 'failed',
    failedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Payment failed for order ${orderId}`);
};

// Get order details (for order confirmation)
export const getOrder = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Verify authentication
      const authUser = await verifyAuthToken(req.headers.authorization);
      
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const orderId = req.query.orderId as string;
      if (!orderId) {
        res.status(400).json({ error: 'Missing orderId parameter' });
        return;
      }

      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const orderData = orderDoc.data();
      
      // Verify user has access to this order
      if (orderData?.buyerId !== authUser.uid && orderData?.sellerId !== authUser.uid) {
        res.status(403).json({ error: 'Unauthorized: Access denied' });
        return;
      }

      res.status(200).json(orderData);

    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});