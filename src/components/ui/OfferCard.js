// OfferCard Component for displaying and managing offers in chat
// Handles offer display, acceptance, rejection, and withdrawal

import React, { useState } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, AlertCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTeReo } from './TeReoToggle';

const OfferCard = ({
    message,
    onRespondToOffer,
    onWithdrawOffer,
    onProceedToCheckout,
    itemPrice
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { currentUser } = useAuth();
    const { getText } = useTeReo();

    const isSender = message.senderId === currentUser?.uid;
    const isPending = message.offerStatus === 'pending';
    const isAccepted = message.offerStatus === 'accepted';
    const isRejected = message.offerStatus === 'rejected';
    const isWithdrawn = message.offerStatus === 'withdrawn';

    const handleRespond = async (response) => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            await onRespondToOffer(message.id, response);
        } catch (error) {
            console.error('Error responding to offer:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            await onWithdrawOffer(message.id);
        } catch (error) {
            console.error('Error withdrawing offer:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProceedToCheckout = () => {
        if (onProceedToCheckout) {
            onProceedToCheckout(message);
        }
    };

    const getStatusColor = () => {
        if (isAccepted) return 'bg-green-50 border-green-200';
        if (isRejected) return 'bg-red-50 border-red-200';
        if (isWithdrawn) return 'bg-gray-50 border-gray-200';
        return 'bg-blue-50 border-blue-200';
    };

    const getStatusIcon = () => {
        if (isAccepted) return <CheckCircle className="w-5 h-5 text-green-600" />;
        if (isRejected) return <XCircle className="w-5 h-5 text-red-600" />;
        if (isWithdrawn) return <AlertCircle className="w-5 h-5 text-gray-600" />;
        return <Clock className="w-5 h-5 text-blue-600" />;
    };

    const getStatusText = () => {
        if (isAccepted) return getText('Offer Accepted! | Tono i whakaaetia!', 'offer_accepted');
        if (isRejected) return getText('Offer Rejected | Tono i whakakāhoretia', 'offer_rejected');
        if (isWithdrawn) return getText('Offer Withdrawn | Tono i unuhia', 'offer_withdrawn');
        return getText('Offer Pending | Tono e tatari ana', 'offer_pending');
    };

    const getSavingsText = () => {
        if (!itemPrice || !message.offerAmount) return null;
        const savings = itemPrice - message.offerAmount;
        if (savings <= 0) return null;
        return getText(`Save $${savings.toFixed(2)} | Tiaki $${savings.toFixed(2)}`, 'save_amount');
    };

    return (
        <div className={`rounded-lg border-2 p-4 ${getStatusColor()} transition-all duration-300`}>
            {/* Offer Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <span className="font-semibold text-gray-900">{getStatusText()}</span>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                        ${message.offerAmount?.toFixed(2)}
                    </div>
                    {itemPrice && (
                        <div className="text-sm text-gray-500 line-through">
                            ${itemPrice.toFixed(2)}
                        </div>
                    )}
                </div>
            </div>

            {/* Offer Details */}
            <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span>
                        {isSender
                            ? getText('Your offer for', 'your_offer_for')
                            : getText('Offer received for', 'offer_received_for')
                        }
                    </span>
                </div>
                <div className="text-sm text-gray-700">
                    {message.itemTitle || getText('This item', 'this_item')}
                </div>
                {getSavingsText() && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                        {getSavingsText()}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {isPending && (
                <div className="space-y-2">
                    {!isSender ? (
                        // Receiver actions
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleRespond('accepted')}
                                disabled={isProcessing}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {isProcessing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {getText('Accept Offer | Whakaaetia', 'accept_offer')}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleRespond('rejected')}
                                disabled={isProcessing}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {isProcessing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        {getText('Reject | Whakakāhore', 'reject_offer')}
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        // Sender actions
                        <button
                            onClick={handleWithdraw}
                            disabled={isProcessing}
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {getText('Withdraw Offer | Unuhia te Tono', 'withdraw_offer')}
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Accepted Offer Actions */}
            {isAccepted && (
                <div className="space-y-2">
                    <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                        <div className="text-sm text-green-800 font-medium mb-2">
                            {getText('Great! The offer has been accepted.', 'offer_accepted_message')}
                        </div>
                        <div className="text-xs text-green-700">
                            {getText('You can now proceed to checkout with the agreed price.', 'proceed_to_checkout_message')}
                        </div>
                    </div>
                    <button
                        onClick={handleProceedToCheckout}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {getText('Proceed to Checkout | Haere ki te Taki', 'proceed_to_checkout')}
                    </button>
                </div>
            )}

            {/* Rejected Offer Message */}
            {isRejected && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-800 font-medium mb-1">
                        {getText('Offer was not accepted', 'offer_not_accepted')}
                    </div>
                    <div className="text-xs text-red-700">
                        {getText('You can continue negotiating or make a new offer.', 'continue_negotiating')}
                    </div>
                </div>
            )}

            {/* Withdrawn Offer Message */}
            {isWithdrawn && (
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                    <div className="text-sm text-gray-800 font-medium mb-1">
                        {getText('Offer was withdrawn', 'offer_withdrawn_message')}
                    </div>
                    <div className="text-xs text-gray-700">
                        {getText('You can make a new offer if you\'re still interested.', 'make_new_offer')}
                    </div>
                </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-500 mt-3 text-center">
                {message.timestamp ? new Date(message.timestamp).toLocaleString() : getText('Just now', 'just_now')}
            </div>
        </div>
    );
};

export default OfferCard; 