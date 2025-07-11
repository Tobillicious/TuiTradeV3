// src/components/payments/CheckoutForm.js
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatPrice } from '../../lib/utils';
import { formatAmountForStripe } from '../../lib/stripe';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

const CheckoutForm = ({ item, onSuccess, onCancel }) => {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        email: '',
        address: {
            line1: '',
            city: '',
            postal_code: '',
            country: 'NZ'
        }
    });

    const stripe = useStripe();
    const elements = useElements();
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    const handleCustomerDetailsChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setCustomerDetails(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setCustomerDetails(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setError('Stripe has not loaded yet. Please try again.');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // Get the Firebase auth token
            const token = await currentUser.getIdToken();
            
            // Determine the Cloud Functions URL based on environment
            const functionsUrl = process.env.REACT_APP_FUNCTIONS_URL || 
                                  'https://us-central1-your-project-id.cloudfunctions.net';
            
            // Create payment intent on the backend
            const response = await fetch(`${functionsUrl}/createPaymentIntent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: formatAmountForStripe(item.price),
                    currency: 'nzd',
                    itemId: item.id,
                    sellerId: item.userId,
                    buyerId: currentUser.uid,
                    customerDetails
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret, orderId } = await response.json();

            // Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: customerDetails.name,
                        email: customerDetails.email,
                        address: customerDetails.address,
                    },
                },
            });

            if (stripeError) {
                setError(stripeError.message);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // Update order in Firebase
                await updateDoc(doc(db, 'orders', orderId), {
                    paymentStatus: 'completed',
                    paymentIntentId: paymentIntent.id,
                    paidAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                // Update item status if it's a fixed-price item
                if (item.listingType !== 'auction') {
                    await updateDoc(doc(db, 'listings', item.id), {
                        status: 'sold',
                        soldAt: serverTimestamp(),
                        soldTo: currentUser.uid
                    });
                }

                showNotification('Payment successful! Your order has been confirmed.', 'success');
                onSuccess({ orderId, paymentIntent });
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError('An error occurred while processing your payment. Please try again.');
            showNotification('Payment failed. Please try again.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
                padding: '12px',
            },
            invalid: {
                color: '#9e2146',
            },
        },
        hidePostalCode: false,
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(item.price)}</p>
                    <p className="text-sm text-gray-600">Seller: {item.sellerName || 'Unknown'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Billing Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={customerDetails.name}
                            onChange={(e) => handleCustomerDetailsChange('name', e.target.value)}
                            className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                        
                        <input
                            type="email"
                            placeholder="Email"
                            value={customerDetails.email}
                            onChange={(e) => handleCustomerDetailsChange('email', e.target.value)}
                            className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                        
                        <input
                            type="text"
                            placeholder="Address"
                            value={customerDetails.address.line1}
                            onChange={(e) => handleCustomerDetailsChange('address.line1', e.target.value)}
                            className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                        
                        <input
                            type="text"
                            placeholder="City"
                            value={customerDetails.address.city}
                            onChange={(e) => handleCustomerDetailsChange('address.city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                        
                        <input
                            type="text"
                            placeholder="Postal Code"
                            value={customerDetails.address.postal_code}
                            onChange={(e) => handleCustomerDetailsChange('address.postal_code', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
                </div>

                {/* Card Details */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Card Details
                    </label>
                    <div className="p-3 border border-gray-300 rounded-lg">
                        <CardElement options={cardElementOptions} />
                    </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <Lock className="w-4 h-4 mt-0.5 text-blue-600" />
                    <div>
                        <p className="font-medium text-blue-900">Secure Payment</p>
                        <p>Your payment information is encrypted and secure. We never store your card details.</p>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    
                    <button
                        type="submit"
                        disabled={!stripe || processing}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                        {processing ? 'Processing...' : `Pay ${formatPrice(item.price)}`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CheckoutForm;