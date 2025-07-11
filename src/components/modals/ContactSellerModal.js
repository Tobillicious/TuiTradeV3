// src/components/modals/ContactSellerModal.js
import { useState, useEffect } from 'react';
import { X, MessageCircle, CheckCircle } from 'lucide-react';
import { addDoc, collection, doc, updateDoc, increment, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../ui/Loaders';
import { formatPrice } from '../../lib/utils';

const ContactSellerModal = ({ isOpen, onClose, item }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (isOpen) {
            setMessage('');
            setIsLoading(false);
            setIsSent(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        try {
            // Check if conversation already exists
            const conversationsRef = collection(db, 'conversations');
            const existingConversationQuery = query(
                conversationsRef,
                where('participants', 'array-contains', currentUser.uid),
                where('listing.id', '==', item.id)
            );

            const existingConversations = await getDocs(existingConversationQuery);
            let conversationId;

            if (existingConversations.empty) {
                // Create new conversation
                const conversationData = {
                    participants: [currentUser.uid, item.userId],
                    participantEmails: [currentUser.email, item.userEmail],
                    listing: {
                        id: item.id,
                        title: item.title,
                        price: item.price,
                        imageUrl: item.imageUrl
                    },
                    createdAt: serverTimestamp(),
                    lastMessage: {
                        text: message.trim(),
                        senderId: currentUser.uid,
                        timestamp: serverTimestamp()
                    }
                };

                const conversationDoc = await addDoc(conversationsRef, conversationData);
                conversationId = conversationDoc.id;
            } else {
                conversationId = existingConversations.docs[0].id;

                // Update last message
                await updateDoc(doc(db, 'conversations', conversationId), {
                    'lastMessage.text': message.trim(),
                    'lastMessage.senderId': currentUser.uid,
                    'lastMessage.timestamp': serverTimestamp()
                });
            }

            // Add message to conversation
            const messagesRef = collection(db, 'conversations', conversationId, 'messages');
            await addDoc(messagesRef, {
                senderId: currentUser.uid,
                senderEmail: currentUser.email,
                message: message.trim(),
                timestamp: serverTimestamp(),
                read: false
            });

            // Update listing inquiry count
            await updateDoc(doc(db, 'listings', item.id), {
                inquiries: increment(1)
            });

            setIsSent(true);
            showNotification('Message sent successfully!', 'success');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Contact Seller</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                        <img
                            src={item.imageUrl || 'https://placehold.co/100x100/e2e8f0/cbd5e0?text=TuiTrade'}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                        <div>
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-green-600 font-bold">{formatPrice(item.price)}</p>
                        </div>
                    </div>

                    {isSent ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                            <p className="text-gray-600">The seller will receive your message and should respond soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Message
                                </label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                                        placeholder="Hi! I'm interested in your item. Is it still available?"
                                        rows={4}
                                        required
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Be polite and specific about your interest in the item.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !message.trim()}
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <LoadingSpinner />
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactSellerModal;
