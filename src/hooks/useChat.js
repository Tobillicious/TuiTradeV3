// Custom hook for real-time chat functionality with offer support
// Manages chat state, messages, and real-time updates

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    addDoc,
    updateDoc,
    serverTimestamp,
    where,
    limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export const useChat = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [chatInfo, setChatInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    // Fetch chat data and messages in real-time
    useEffect(() => {
        if (!chatId || !currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Listener for the chat document itself (for typing indicators, etc.)
            const chatDocRef = doc(db, 'chats', chatId);
            const unsubscribeChatInfo = onSnapshot(chatDocRef, (doc) => {
                if (doc.exists()) {
                    setChatInfo({ id: doc.id, ...doc.data() });
                } else {
                    setError('Chat not found');
                }
                setLoading(false);
            }, (error) => {
                console.error('Error fetching chat info:', error);
                setError('Failed to load chat');
                setLoading(false);
            });

            // Listener for the messages subcollection
            const messagesColRef = collection(db, 'chats', chatId, 'messages');
            const q = query(messagesColRef, orderBy('timestamp', 'asc'));
            const unsubscribeMessages = onSnapshot(q, (snapshot) => {
                const newMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate()
                }));
                setMessages(newMessages);
            }, (error) => {
                console.error('Error fetching messages:', error);
                setError('Failed to load messages');
            });

            // Cleanup listeners on unmount
            return () => {
                unsubscribeChatInfo();
                unsubscribeMessages();
            };
        } catch (error) {
            console.error('Error setting up chat listeners:', error);
            setError('Failed to initialize chat');
            setLoading(false);
        }
    }, [chatId, currentUser]);

    // Send a text message
    const sendMessage = useCallback(async (text) => {
        if (!chatId || !currentUser || !text.trim()) return;

        try {
            const messageData = {
                type: 'text',
                text: text.trim(),
                senderId: currentUser.uid,
                senderEmail: currentUser.email,
                timestamp: serverTimestamp(),
                status: 'sent'
            };

            await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

            // Update chat's last message
            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: messageData,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error('Failed to send message');
        }
    }, [chatId, currentUser]);

    // Make an offer
    const makeOffer = useCallback(async (offerAmount, itemId, itemTitle) => {
        if (!chatId || !currentUser || !offerAmount) return;

        try {
            const offerData = {
                type: 'offer',
                senderId: currentUser.uid,
                senderEmail: currentUser.email,
                offerAmount: parseFloat(offerAmount),
                itemId,
                itemTitle,
                offerStatus: 'pending',
                timestamp: serverTimestamp(),
                status: 'sent'
            };

            await addDoc(collection(db, 'chats', chatId, 'messages'), offerData);

            // Update chat's last message
            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: {
                    type: 'offer',
                    text: `Made an offer of $${offerAmount}`,
                    senderId: currentUser.uid,
                    timestamp: serverTimestamp()
                },
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error making offer:', error);
            throw new Error('Failed to make offer');
        }
    }, [chatId, currentUser]);

    // Respond to an offer (accept/reject)
    const respondToOffer = useCallback(async (messageId, response) => {
        if (!chatId || !currentUser || !messageId || !response) return;

        try {
            const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
            await updateDoc(messageRef, {
                offerStatus: response,
                respondedAt: serverTimestamp(),
                responderId: currentUser.uid
            });

            // Add a system message about the offer response
            const systemMessage = {
                type: 'system',
                text: `Offer ${response === 'accepted' ? 'accepted' : 'rejected'}`,
                offerResponse: response,
                timestamp: serverTimestamp(),
                status: 'sent'
            };

            await addDoc(collection(db, 'chats', chatId, 'messages'), systemMessage);

            // Update chat's last message
            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: systemMessage,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error responding to offer:', error);
            throw new Error('Failed to respond to offer');
        }
    }, [chatId, currentUser]);

    // Withdraw an offer
    const withdrawOffer = useCallback(async (messageId) => {
        if (!chatId || !currentUser || !messageId) return;

        try {
            const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
            await updateDoc(messageRef, {
                offerStatus: 'withdrawn',
                withdrawnAt: serverTimestamp()
            });

            // Add a system message about the withdrawal
            const systemMessage = {
                type: 'system',
                text: 'Offer withdrawn',
                offerResponse: 'withdrawn',
                timestamp: serverTimestamp(),
                status: 'sent'
            };

            await addDoc(collection(db, 'chats', chatId, 'messages'), systemMessage);

            // Update chat's last message
            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: systemMessage,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error withdrawing offer:', error);
            throw new Error('Failed to withdraw offer');
        }
    }, [chatId, currentUser]);

    // Update typing indicator
    const updateTypingStatus = useCallback(async (isTyping) => {
        if (!chatId || !currentUser) return;

        try {
            await updateDoc(doc(db, 'chats', chatId), {
                [`typing.${currentUser.uid}`]: isTyping,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating typing status:', error);
        }
    }, [chatId, currentUser]);

    // Mark messages as read
    const markMessagesAsRead = useCallback(async () => {
        if (!chatId || !currentUser) return;

        try {
            // Get unread messages from this user
            const messagesColRef = collection(db, 'chats', chatId, 'messages');
            const q = query(
                messagesColRef,
                where('senderId', '!=', currentUser.uid),
                where('status', '!=', 'read'),
                orderBy('timestamp', 'desc'),
                limit(50)
            );

            const snapshot = await onSnapshot(q, (snapshot) => {
                const updatePromises = snapshot.docs.map(doc =>
                    updateDoc(doc.ref, { status: 'read' })
                );
                Promise.all(updatePromises).catch(error => {
                    console.error('Error marking messages as read:', error);
                });
            });

            return () => snapshot();
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }, [chatId, currentUser]);

    return {
        messages,
        chatInfo,
        loading,
        error,
        sendMessage,
        makeOffer,
        respondToOffer,
        withdrawOffer,
        updateTypingStatus,
        markMessagesAsRead
    };
};

// Hook for managing chat list
export const useChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            const chatsRef = collection(db, 'chats');
            const q = query(
                chatsRef,
                where('participants', 'array-contains', currentUser.uid),
                orderBy('updatedAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const chatData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    lastMessage: {
                        ...doc.data().lastMessage,
                        timestamp: doc.data().lastMessage?.timestamp?.toDate()
                    }
                }));
                setChats(chatData);
                setLoading(false);
            }, (error) => {
                console.error('Error loading chats:', error);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Error setting up chat list listener:', error);
            setLoading(false);
        }
    }, [currentUser]);

    return { chats, loading };
}; 