// Payment Service - Stripe Integration for TuiTrade
// Handles card processing, NZ bank transfers, and Afterpay integration

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Check if we're in development
const isDevelopment = process.env.NODE_ENV === 'development';

// Payment methods supported in New Zealand
export const PAYMENT_METHODS = {
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    AFTERPAY: 'afterpay',
    CASH_PICKUP: 'cash_pickup',
    ESCROW: 'escrow'
};

// New Zealand bank transfer details
export const NZ_BANK_DETAILS = {
    accountName: 'TuiTrade Limited',
    accountNumber: '12-3456-0789012-00',
    bankCode: 'ANZ',
    swiftCode: 'ANZBNZ22',
    reference: 'Required for verification'
};

// Afterpay limits for NZ
export const AFTERPAY_LIMITS = {
    MIN_AMOUNT: 1,
    MAX_AMOUNT: 2000,
    SUPPORTED_CURRENCIES: ['NZD']
};

// Mock API function for development
const mockApiCall = async (endpoint, data) => {
    if (isDevelopment) {
        console.warn(`🔧 Mock API call to ${endpoint}:`, data);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return mock responses
        switch (endpoint) {
            case '/api/create-payment-intent':
                return {
                    clientSecret: 'pi_mock_secret_' + Date.now(),
                    id: 'pi_mock_' + Date.now()
                };
            case '/api/initiate-bank-transfer':
                return {
                    transferReference: 'TXN' + Date.now(),
                    bankDetails: NZ_BANK_DETAILS,
                    status: 'pending'
                };
            case '/api/create-afterpay-session':
                return {
                    redirectCheckoutUrl: 'https://mock-afterpay.com/checkout',
                    sessionId: 'ap_mock_' + Date.now()
                };
            case '/api/create-escrow-payment':
                return {
                    escrowId: 'escrow_mock_' + Date.now(),
                    status: 'pending',
                    instructions: 'Payment held in escrow until delivery confirmation'
                };
            default:
                throw new Error(`Mock API endpoint not implemented: ${endpoint}`);
        }
    }

    throw new Error(`API endpoint not available: ${endpoint}`);
};

// Payment processing functions
export const createPaymentIntent = async (amount, currency = 'NZD', metadata = {}) => {
    try {
        if (isDevelopment && !process.env.REACT_APP_API_BASE_URL) {
            return await mockApiCall('/api/create-payment-intent', {
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                metadata: {
                    ...metadata,
                    platform: 'tuitrade',
                    country: 'NZ'
                }
            });
        }

        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                metadata: {
                    ...metadata,
                    platform: 'tuitrade',
                    country: 'NZ'
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

export const processCardPayment = async (paymentIntentId, paymentMethod, billingDetails) => {
    try {
        const stripe = await stripePromise;

        if (!stripe) {
            throw new Error('Stripe not initialized');
        }

        const result = await stripe.confirmCardPayment(paymentIntentId, {
            payment_method: {
                card: paymentMethod,
                billing_details: billingDetails
            }
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        return result.paymentIntent;
    } catch (error) {
        console.error('Error processing card payment:', error);
        throw error;
    }
};

export const initiateBankTransfer = async (orderDetails) => {
    try {
        const transferReference = generateTransferReference(orderDetails);

        if (isDevelopment && !process.env.REACT_APP_API_BASE_URL) {
            return await mockApiCall('/api/initiate-bank-transfer', {
                ...orderDetails,
                transferReference,
                bankDetails: NZ_BANK_DETAILS
            });
        }

        const response = await fetch('/api/initiate-bank-transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...orderDetails,
                transferReference,
                bankDetails: NZ_BANK_DETAILS
            })
        });

        if (!response.ok) {
            throw new Error('Failed to initiate bank transfer');
        }

        return await response.json();
    } catch (error) {
        console.error('Error initiating bank transfer:', error);
        throw error;
    }
};

export const verifyBankTransfer = async (transferReference, transactionId) => {
    try {
        if (isDevelopment && !process.env.REACT_APP_API_BASE_URL) {
            return await mockApiCall('/api/verify-bank-transfer', {
                transferReference,
                transactionId
            });
        }

        const response = await fetch('/api/verify-bank-transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transferReference,
                transactionId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to verify bank transfer');
        }

        return await response.json();
    } catch (error) {
        console.error('Error verifying bank transfer:', error);
        throw error;
    }
};

export const createAfterpaySessions = async (orderDetails) => {
    try {
        const { amount, currency, items } = orderDetails;

        // Check Afterpay limits
        if (amount < AFTERPAY_LIMITS.MIN_AMOUNT || amount > AFTERPAY_LIMITS.MAX_AMOUNT) {
            throw new Error(`Afterpay amount must be between $${AFTERPAY_LIMITS.MIN_AMOUNT} and $${AFTERPAY_LIMITS.MAX_AMOUNT}`);
        }

        if (!AFTERPAY_LIMITS.SUPPORTED_CURRENCIES.includes(currency)) {
            throw new Error(`Afterpay does not support ${currency}`);
        }

        if (isDevelopment && !process.env.REACT_APP_API_BASE_URL) {
            return await mockApiCall('/api/create-afterpay-session', {
                amount: {
                    amount: (amount * 100).toString(),
                    currency: currency
                },
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity || 1,
                    price: {
                        amount: (item.price * 100).toString(),
                        currency: currency
                    }
                }))
            });
        }

        const response = await fetch('/api/create-afterpay-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: {
                    amount: (amount * 100).toString(), // Convert to cents as string
                    currency: currency
                },
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity || 1,
                    price: {
                        amount: (item.price * 100).toString(),
                        currency: currency
                    }
                }))
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create Afterpay session');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating Afterpay session:', error);
        throw error;
    }
};

export const createEscrowPayment = async (orderDetails) => {
    try {
        if (isDevelopment && !process.env.REACT_APP_API_BASE_URL) {
            return await mockApiCall('/api/create-escrow-payment', {
                ...orderDetails,
                escrowTerms: {
                    holdPeriod: 7,
                    releaseConditions: 'item_received_and_approved',
                    disputeResolution: 'platform_mediation'
                }
            });
        }

        const response = await fetch('/api/create-escrow-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...orderDetails,
                escrowTerms: {
                    holdPeriod: 7, // 7 days default
                    releaseConditions: 'item_received_and_approved',
                    disputeResolution: 'platform_mediation'
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create escrow payment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating escrow payment:', error);
        throw error;
    }
};

// Helper functions
export const generateTransferReference = (orderDetails) => {
    const timestamp = Date.now().toString().slice(-6);
    const orderPrefix = orderDetails.orderId ? orderDetails.orderId.slice(-4) : '0000';
    return `TT${orderPrefix}${timestamp}`;
};

export const calculatePaymentFees = (amount, method) => {
    switch (method) {
        case PAYMENT_METHODS.CARD:
            return {
                fee: Math.round(amount * 0.029 + 0.30), // 2.9% + 30¢
                total: amount + Math.round(amount * 0.029 + 0.30),
                description: 'Credit/Debit Card (2.9% + 30¢)'
            };
        case PAYMENT_METHODS.BANK_TRANSFER:
            return {
                fee: 0,
                total: amount,
                description: 'Bank Transfer (Free)'
            };
        case PAYMENT_METHODS.AFTERPAY:
            return {
                fee: 0, // Afterpay fees are paid by merchant
                total: amount,
                description: 'Afterpay (No fees for buyers)'
            };
        case PAYMENT_METHODS.ESCROW:
            return {
                fee: Math.round(amount * 0.035), // 3.5% for escrow service
                total: amount + Math.round(amount * 0.035),
                description: 'Escrow Service (3.5%)'
            };
        default:
            return {
                fee: 0,
                total: amount,
                description: 'No additional fees'
            };
    }
};

export const formatNZCurrency = (amount) => {
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 2
    }).format(amount);
};

export const validatePaymentMethod = (method, amount) => {
    const errors = [];

    switch (method) {
        case PAYMENT_METHODS.AFTERPAY:
            if (amount < AFTERPAY_LIMITS.MIN_AMOUNT) {
                errors.push(`Minimum amount for Afterpay is ${formatNZCurrency(AFTERPAY_LIMITS.MIN_AMOUNT)}`);
            }
            if (amount > AFTERPAY_LIMITS.MAX_AMOUNT) {
                errors.push(`Maximum amount for Afterpay is ${formatNZCurrency(AFTERPAY_LIMITS.MAX_AMOUNT)}`);
            }
            break;
        case PAYMENT_METHODS.ESCROW:
            if (amount < 100) {
                errors.push('Minimum amount for escrow service is $100');
            }
            break;
        default:
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Export Stripe for direct use in components
export { stripePromise };

// Payment status constants
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

// Transaction types
export const TRANSACTION_TYPES = {
    PURCHASE: 'purchase',
    REFUND: 'refund',
    ESCROW_HOLD: 'escrow_hold',
    ESCROW_RELEASE: 'escrow_release',
    DISPUTE: 'dispute'
};

export default {
    PAYMENT_METHODS,
    NZ_BANK_DETAILS,
    AFTERPAY_LIMITS,
    createPaymentIntent,
    processCardPayment,
    initiateBankTransfer,
    verifyBankTransfer,
    createAfterpaySessions,
    createEscrowPayment,
    generateTransferReference,
    calculatePaymentFees,
    formatNZCurrency,
    validatePaymentMethod,
    stripePromise,
    PAYMENT_STATUS,
    TRANSACTION_TYPES
};