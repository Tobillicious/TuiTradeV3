// src/components/modals/CheckoutModal.js
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../../lib/stripe';
import CheckoutForm from '../payments/CheckoutForm';
import { X, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';

const CheckoutModal = ({ isOpen, onClose, item, onSuccess }) => {
    const [stripeError, setStripeError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            stripePromise.then(stripeInstance => {
                if (stripeInstance) {
                    setStripeError(false);
                } else {
                    setStripeError(true);
                }
            }).catch(() => {
                setStripeError(true);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSuccess = (result) => {
        onSuccess(result);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    {stripeError ? (
                        <div className="text-center py-8">
                            <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Payment System Unavailable</h3>
                            <p className="text-gray-500 mb-6">
                                The payment system is currently not configured. Please contact the seller directly to arrange payment.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 text-left">
                                <h4 className="font-semibold text-gray-700 mb-2">Item Details:</h4>
                                <p className="text-sm text-gray-600">{item?.title}</p>
                                <p className="text-lg font-bold text-green-600">${item?.price}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                item={item}
                                onSuccess={handleSuccess}
                                onCancel={onClose}
                            />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;