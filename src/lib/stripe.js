// =============================================
// stripe.js - Stripe Payment Integration
// --------------------------------------
// Provides helpers for initializing and using Stripe for payment processing.
// Used by paymentService and checkout components.
// =============================================
// src/lib/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with error handling
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

let stripePromise = null;

if (stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
} else {
    console.warn('Stripe publishable key not found. Stripe functionality will be disabled.');
    stripePromise = Promise.resolve(null);
}

export default stripePromise;

// Helper function to format amount for Stripe (convert to cents)
export const formatAmountForStripe = (amount, currency = 'nzd') => {
    const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
    return zeroDecimalCurrencies.includes(currency.toLowerCase())
        ? Math.round(amount)
        : Math.round(amount * 100);
};

// Helper function to format amount from Stripe (convert from cents)
export const formatAmountFromStripe = (amount, currency = 'nzd') => {
    const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
    return zeroDecimalCurrencies.includes(currency.toLowerCase())
        ? amount
        : amount / 100;
};