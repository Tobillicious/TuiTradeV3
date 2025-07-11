// src/components/modals/ShoppingCartModal.js
import { X, ShoppingCart, Shield, CreditCard } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { formatPrice } from '../../lib/utils';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const ShoppingCartModal = ({ isOpen, onClose, cartItems, onRemoveFromCart, onClearCart, onBuyNow }) => {
    const { showNotification } = useNotification();
    const { currentUser } = useAuth();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

    const handleCheckout = () => {
        setIsConfirming(true);
    };

    const handlePlaceOrder = async () => {
        if (!currentUser) {
            showNotification('Please log in to place an order.', 'error');
            setIsConfirming(false);
            return;
        }
        setIsPlacingOrder(true);
        try {
            const orderData = {
                buyerId: currentUser.uid,
                buyerEmail: currentUser.email,
                items: cartItems,
                total: totalPrice,
                status: 'pending',
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, 'orders'), orderData);
            onClearCart();
            showNotification('Order placed! You can view it in your order history.', 'success');
            setIsConfirming(false);
            onClose();
        } catch (err) {
            showNotification('Failed to place order. Please try again.', 'error');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleRemoveItem = (itemId) => {
        onRemoveFromCart(itemId);
    };

    const handleClearCart = () => {
        onClearCart();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <ShoppingCart className="mr-2" size={24} />
                        Shopping Cart ({cartItems.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Your cart is empty</p>
                            <p className="text-gray-400">Start shopping to add items to your cart</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                        <img
                                            src={item.imageUrl || 'https://placehold.co/100x100/e2e8f0/cbd5e0?text=TuiTrade'}
                                            alt={item.title}
                                            className="w-16 h-16 object-cover rounded-lg mr-4"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                            <p className="text-green-600 font-bold">{formatPrice(item.price)}</p>
                                            <p className="text-sm text-gray-500">{item.location}</p>
                                        </div>
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <button
                                                onClick={() => {
                                                    onBuyNow && onBuyNow(item);
                                                    onClose();
                                                }}
                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                                            >
                                                <CreditCard size={14} className="mr-1" />
                                                Buy Now
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                                    <span className="text-2xl font-bold text-green-600">{formatPrice(totalPrice)}</span>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <Shield className="mr-2" size={20} />
                                        Secure Checkout
                                    </button>
                                    <button
                                        onClick={handleClearCart}
                                        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                    >
                                        Clear Cart
                                    </button>
                                </div>

                                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center text-green-700">
                                        <Shield className="mr-2 flex-shrink-0" size={16} />
                                        <span className="text-sm">
                                            Your payment is protected with buyer protection
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isConfirming && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Confirm Order</h3>
                        <p className="mb-4">Are you sure you want to place this order for <span className="font-semibold">{formatPrice(totalPrice)}</span>?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsConfirming(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold">Cancel</button>
                            <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50">
                                {isPlacingOrder ? 'Placing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingCartModal;
