// Enhanced Checkout Modal with Multiple Payment Methods
// Supports Stripe, Bank Transfer, Afterpay, and Escrow

import React, { useState, useEffect } from 'react';
import { 
    X, CreditCard, Building, ShoppingBag, Shield, 
    AlertCircle, CheckCircle
} from 'lucide-react';
import { 
    PAYMENT_METHODS, 
    NZ_BANK_DETAILS,
    AFTERPAY_LIMITS,
    calculatePaymentFees,
    validatePaymentMethod,
    initiateBankTransfer,
    createAfterpaySessions,
    createEscrowPayment
} from '../../lib/paymentService';
import { formatPrice } from '../../lib/utils';

const EnhancedCheckoutModal = ({ isOpen, onClose, item, onSuccess, currentUser }) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS.CARD);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('select-method'); // select-method, payment-details, processing, confirmation
    const [paymentDetails, setPaymentDetails] = useState({});
    const [billingInfo, setBillingInfo] = useState({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: '',
        address: '',
        city: '',
        postcode: ''
    });

    useEffect(() => {
        if (isOpen) {
            setStep('select-method');
            setError(null);
            setPaymentDetails({});
        }
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const paymentFees = calculatePaymentFees(item.price, selectedPaymentMethod);
    const validation = validatePaymentMethod(selectedPaymentMethod, item.price);

    const paymentMethods = [
        {
            id: PAYMENT_METHODS.CARD,
            name: 'Credit/Debit Card',
            icon: CreditCard,
            description: 'Visa, Mastercard, American Express',
            fees: 'Processing fee: 2.9% + 30¢',
            instant: true,
            available: true
        },
        {
            id: PAYMENT_METHODS.BANK_TRANSFER,
            name: 'Bank Transfer',
            icon: Building,
            description: 'Direct bank transfer (1-2 business days)',
            fees: 'No fees',
            instant: false,
            available: true
        },
        {
            id: PAYMENT_METHODS.AFTERPAY,
            name: 'Afterpay',
            icon: ShoppingBag,
            description: 'Buy now, pay later in 4 installments',
            fees: 'No fees for buyers',
            instant: true,
            available: item.price >= AFTERPAY_LIMITS.MIN_AMOUNT && item.price <= AFTERPAY_LIMITS.MAX_AMOUNT
        },
        {
            id: PAYMENT_METHODS.ESCROW,
            name: 'Escrow Service',
            icon: Shield,
            description: 'Protected payment held until delivery',
            fees: 'Service fee: 3.5%',
            instant: false,
            available: item.price >= 100
        }
    ];

    const handlePaymentMethodSelect = (method) => {
        setSelectedPaymentMethod(method);
        setError(null);
    };

    const handleProceedToPayment = () => {
        const methodValidation = validatePaymentMethod(selectedPaymentMethod, item.price);
        if (!methodValidation.isValid) {
            setError(methodValidation.errors.join('. '));
            return;
        }
        setStep('payment-details');
    };

    const handlePaymentSubmit = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            switch (selectedPaymentMethod) {
                case PAYMENT_METHODS.CARD:
                    await handleCardPayment();
                    break;
                case PAYMENT_METHODS.BANK_TRANSFER:
                    await handleBankTransfer();
                    break;
                case PAYMENT_METHODS.AFTERPAY:
                    await handleAfterpayPayment();
                    break;
                case PAYMENT_METHODS.ESCROW:
                    await handleEscrowPayment();
                    break;
                default:
                    throw new Error('Invalid payment method');
            }
        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCardPayment = async () => {
        // For now, simulate card payment
        setStep('processing');
        setTimeout(() => {
            setStep('confirmation');
            onSuccess({ 
                method: 'card', 
                transactionId: 'card_' + Date.now(),
                amount: paymentFees.total
            });
        }, 2000);
    };

    const handleBankTransfer = async () => {
        const transferResult = await initiateBankTransfer({
            itemId: item.id,
            amount: item.price,
            currency: 'NZD',
            buyerEmail: billingInfo.email,
            sellerEmail: item.userEmail
        });

        setPaymentDetails(transferResult);
        setStep('confirmation');
    };

    const handleAfterpayPayment = async () => {
        const afterpaySession = await createAfterpaySessions({
            amount: item.price,
            currency: 'NZD',
            items: [{
                name: item.title,
                price: item.price,
                quantity: 1
            }]
        });

        // Redirect to Afterpay
        window.location.href = afterpaySession.redirectCheckoutUrl;
    };

    const handleEscrowPayment = async () => {
        const escrowResult = await createEscrowPayment({
            itemId: item.id,
            amount: item.price,
            currency: 'NZD',
            buyerEmail: billingInfo.email,
            sellerEmail: item.userEmail
        });

        setPaymentDetails(escrowResult);
        setStep('confirmation');
    };

    const renderPaymentMethodSelection = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Choose Payment Method</h2>
            
            {/* Item Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.location}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{formatPrice(item.price)}</p>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 mb-6">
                {paymentMethods.map((method) => (
                    <button
                        key={method.id}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                        disabled={!method.available}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                            selectedPaymentMethod === method.id
                                ? 'border-green-500 bg-green-50'
                                : method.available
                                ? 'border-gray-200 hover:border-gray-300'
                                : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        }`}
                    >
                        <div className="flex items-center space-x-4">
                            <method.icon 
                                className={`w-6 h-6 ${
                                    selectedPaymentMethod === method.id ? 'text-green-600' : 'text-gray-600'
                                }`} 
                            />
                            <div className="flex-1 text-left">
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                                    {method.instant && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Instant
                                        </span>
                                    )}
                                    {!method.available && (
                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                            Not Available
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{method.description}</p>
                                <p className="text-sm text-gray-500">{method.fees}</p>
                            </div>
                            {selectedPaymentMethod === method.id && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Item Price</span>
                        <span>{formatPrice(item.price)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Payment Fee</span>
                        <span>{formatPrice(paymentFees.fee)}</span>
                    </div>
                    <div className="border-t pt-2">
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{formatPrice(paymentFees.total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Validation Errors */}
            {!validation.isValid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <div>
                            <h4 className="font-semibold text-red-800">Payment Method Not Available</h4>
                            <ul className="text-sm text-red-700 mt-1">
                                {validation.errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
                <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleProceedToPayment}
                    disabled={!validation.isValid}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );

    const renderPaymentDetails = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            
            {/* Billing Information */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={billingInfo.name}
                            onChange={(e) => setBillingInfo({...billingInfo, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="John Smith"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            value={billingInfo.email}
                            onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={billingInfo.phone}
                            onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="021 123 4567"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            value={billingInfo.city}
                            onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Auckland"
                        />
                    </div>
                </div>
            </div>

            {/* Payment Method Specific Details */}
            {selectedPaymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-3">Bank Transfer Instructions</h4>
                    <div className="text-sm text-blue-800 space-y-2">
                        <p><strong>Account Name:</strong> {NZ_BANK_DETAILS.accountName}</p>
                        <p><strong>Account Number:</strong> {NZ_BANK_DETAILS.accountNumber}</p>
                        <p><strong>Bank:</strong> {NZ_BANK_DETAILS.bankCode}</p>
                        <p><strong>Reference:</strong> Will be provided after confirmation</p>
                    </div>
                </div>
            )}

            {selectedPaymentMethod === PAYMENT_METHODS.ESCROW && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-purple-900 mb-3">Escrow Service</h4>
                    <div className="text-sm text-purple-800 space-y-2">
                        <p>• Payment held securely until you receive and approve the item</p>
                        <p>• 7-day inspection period</p>
                        <p>• Full refund if item doesn't match description</p>
                        <p>• Platform-mediated dispute resolution</p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
                <button
                    onClick={() => setStep('select-method')}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={handlePaymentSubmit}
                    disabled={isProcessing || !billingInfo.name || !billingInfo.email}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(paymentFees.total)}`}
                </button>
            </div>
        </div>
    );

    const renderProcessing = () => (
        <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
    );

    const renderConfirmation = () => (
        <div className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Initiated Successfully!</h3>
            
            {selectedPaymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <h4 className="font-semibold text-blue-900 mb-3">Next Steps</h4>
                    <div className="text-sm text-blue-800 space-y-2">
                        <p>1. Transfer {formatPrice(item.price)} to the account details provided</p>
                        <p>2. Use reference: <strong>{paymentDetails.transferReference}</strong></p>
                        <p>3. Payment will be verified within 1-2 business days</p>
                        <p>4. You'll receive confirmation once verified</p>
                    </div>
                </div>
            )}

            {selectedPaymentMethod === PAYMENT_METHODS.ESCROW && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-left">
                    <h4 className="font-semibold text-purple-900 mb-3">Escrow Payment Created</h4>
                    <div className="text-sm text-purple-800 space-y-2">
                        <p>• Payment of {formatPrice(paymentFees.total)} is held in escrow</p>
                        <p>• Seller will be notified to ship the item</p>
                        <p>• You have 7 days to inspect and approve after delivery</p>
                        <p>• Funds will be released to seller upon your approval</p>
                    </div>
                </div>
            )}

            <button
                onClick={onClose}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
                Done
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {step === 'select-method' && renderPaymentMethodSelection()}
                {step === 'payment-details' && renderPaymentDetails()}
                {step === 'processing' && renderProcessing()}
                {step === 'confirmation' && renderConfirmation()}
            </div>
        </div>
    );
};

export default EnhancedCheckoutModal;