// src/components/pages/MessagesPage.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatPrice, timeAgo } from '../../lib/utils';
import { FullPageLoader } from '../ui/Loaders';
import { MessageCircle, Send, ArrowLeft, Home, ChevronRight, Clock, Eye } from 'lucide-react';

const MessagesPage = ({ onNavigate }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    // Use refs to track active listeners for proper cleanup
    const listenersRef = useRef(new Set());
    const conversationsRef = useRef(null);
    const messagesRef = useRef(null);

    // Cleanup function for listeners
    const cleanupListeners = useCallback(() => {
        listenersRef.current.forEach(unsubscribe => {
            try {
                unsubscribe();
            } catch (error) {
                console.warn('Error cleaning up listener:', error);
            }
        });
        listenersRef.current.clear();
    }, []);

    // Load conversations
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            const conversationsRef = collection(db, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', 'array-contains', currentUser.uid),
                orderBy('lastMessage.timestamp', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const conversationData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    lastMessage: {
                        ...doc.data().lastMessage,
                        timestamp: doc.data().lastMessage?.timestamp?.toDate()
                    }
                }));
                setConversations(conversationData);
                setLoading(false);
            }, (error) => {
                console.error('Error loading conversations:', error);
                setLoading(false);
            });

            listenersRef.current.add(unsubscribe);
        } catch (error) {
            console.error('Error setting up conversations listener:', error);
            setLoading(false);
        }

        return () => {
            cleanupListeners();
        };
    }, [currentUser, cleanupListeners]);

    // Fetch participant info for conversations
    useEffect(() => {
        if (!conversations.length) return;

        const fetchParticipants = async () => {
            try {
                const updated = await Promise.all(conversations.map(async (conv) => {
                    const otherId = conv.participants.find(p => p !== currentUser.uid);
                    if (!otherId) return conv;

                    try {
                        const userDoc = await getDoc(doc(db, 'users', otherId));
                        const profile = userDoc.exists() ? userDoc.data().profile : {};
                        return {
                            ...conv,
                            otherDisplayName: profile?.displayName || conv.participantEmails?.find(e => e !== currentUser.email) || 'Unknown',
                            otherAvatar: profile?.avatar || null
                        };
                    } catch (error) {
                        console.warn('Error fetching user profile:', error);
                        return conv;
                    }
                }));
                setConversations(updated);
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };

        fetchParticipants();
    }, [conversations.length, currentUser]);

    // Track unread message counts - simplified to prevent listener conflicts
    useEffect(() => {
        if (!conversations.length) return;

        const unsubscribes = [];

        conversations.forEach(conv => {
            try {
                const messagesRef = collection(db, 'conversations', conv.id, 'messages');
                const q = query(
                    messagesRef,
                    where('read', '==', false),
                    where('senderId', '!=', currentUser.uid)
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    setConversations(prev => prev.map(c =>
                        c.id === conv.id ? { ...c, unreadCount: snapshot.size } : c
                    ));
                }, (error) => {
                    console.warn('Error tracking unread messages:', error);
                });

                unsubscribes.push(unsubscribe);
                listenersRef.current.add(unsubscribe);
            } catch (error) {
                console.warn('Error setting up unread messages listener:', error);
            }
        });

        return () => {
            unsubscribes.forEach(unsub => {
                try {
                    unsub();
                    listenersRef.current.delete(unsub);
                } catch (error) {
                    console.warn('Error cleaning up unread listener:', error);
                }
            });
        };
    }, [conversations, currentUser.uid]);

    // Load messages for selected conversation
    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }

        try {
            const messagesRef = collection(db, 'conversations', selectedConversation.id, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'asc'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messageData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate()
                }));
                setMessages(messageData);

                // Mark messages as read
                snapshot.docs.forEach(doc => {
                    if (!doc.data().read && doc.data().senderId !== currentUser.uid) {
                        updateDoc(doc.ref, { read: true }).catch(error => {
                            console.warn('Error marking message as read:', error);
                        });
                    }
                });
            }, (error) => {
                console.error('Error loading messages:', error);
            });

            listenersRef.current.add(unsubscribe);
        } catch (error) {
            console.error('Error setting up messages listener:', error);
        }

        return () => {
            cleanupListeners();
        };
    }, [selectedConversation, currentUser, cleanupListeners]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupListeners();
        };
    }, [cleanupListeners]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !currentUser) return;

        setSending(true);
        try {
            const messageData = {
                text: newMessage.trim(),
                senderId: currentUser.uid,
                senderEmail: currentUser.email,
                timestamp: serverTimestamp(),
                read: false
            };

            await addDoc(collection(db, 'conversations', selectedConversation.id, 'messages'), messageData);

            // Update conversation's last message
            await updateDoc(doc(db, 'conversations', selectedConversation.id), {
                lastMessage: messageData
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Failed to send message', 'error');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) return <FullPageLoader message="Loading messages..." />;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => onNavigate('home')}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    {/* Conversations List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                        </div>
                        <div className="overflow-y-auto h-full">
                            {conversations.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No conversations yet</p>
                                    <p className="text-sm">Start a conversation by viewing an item</p>
                                </div>
                            ) : (
                                conversations.map((conversation) => (
                                    <div
                                        key={conversation.id}
                                        onClick={() => setSelectedConversation(conversation)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {conversation.otherDisplayName || 'Unknown User'}
                                                    </h3>
                                                    {conversation.unreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conversation.lastMessage?.text || 'No messages yet'}
                                                </p>
                                                {conversation.lastMessage?.timestamp && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {timeAgo(conversation.lastMessage.timestamp)}
                                                    </p>
                                                )}
                                            </div>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {selectedConversation ? (
                            <>
                                {/* Conversation Header */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {(selectedConversation.otherDisplayName || 'U')[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {selectedConversation.otherDisplayName || 'Unknown User'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {selectedConversation.participantEmails?.find(e => e !== currentUser.email) || 'No email'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-140px)]">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-gray-500 py-8">
                                            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>No messages yet</p>
                                            <p className="text-sm">Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === currentUser.uid
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.text}</p>
                                                    <p className={`text-xs mt-1 ${message.senderId === currentUser.uid ? 'text-blue-100' : 'text-gray-500'
                                                        }`}>
                                                        {message.timestamp ? timeAgo(message.timestamp) : 'Just now'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-gray-200">
                                    <div className="flex space-x-2">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type your message..."
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            rows={2}
                                            disabled={sending}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim() || sending}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {sending ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Send size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>Select a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;