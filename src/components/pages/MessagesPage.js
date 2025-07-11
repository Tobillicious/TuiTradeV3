// src/components/pages/MessagesPage.js
import { useState, useEffect } from 'react';
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

    // Load conversations
    useEffect(() => {
        if (!currentUser) return;

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
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch participant info for conversations
    useEffect(() => {
        if (!conversations.length) return;
        const fetchParticipants = async () => {
            const updated = await Promise.all(conversations.map(async (conv) => {
                const otherId = conv.participants.find(p => p !== currentUser.uid);
                if (!otherId) return conv;
                const userDoc = await getDoc(doc(db, 'users', otherId));
                const profile = userDoc.exists() ? userDoc.data().profile : {};
                return {
                    ...conv,
                    otherDisplayName: profile?.displayName || conv.participantEmails?.find(e => e !== currentUser.email) || 'Unknown',
                    otherAvatar: profile?.avatar || null
                };
            }));
            setConversations(updated);
        };
        fetchParticipants();
        // eslint-disable-next-line
    }, [conversations.length]);

    // Track unread message counts
    useEffect(() => {
        if (!conversations.length) return;
        const unsubscribes = conversations.map(conv => {
            const messagesRef = collection(db, 'conversations', conv.id, 'messages');
            const q = query(messagesRef, where('read', '==', false), where('senderId', '!=', currentUser.uid));
            return onSnapshot(q, (snapshot) => {
                setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: snapshot.size } : c));
            });
        });
        return () => unsubscribes.forEach(unsub => unsub());
    }, [conversations, currentUser.uid]);

    // In-app notification for new messages
    useEffect(() => {
        if (!conversations.length) return;
        const unsubscribes = conversations.map(conv => {
            const messagesRef = collection(db, 'conversations', conv.id, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'desc'), where('read', '==', false));
            return onSnapshot(q, (snapshot) => {
                if (snapshot.size > 0 && (!selectedConversation || selectedConversation.id !== conv.id)) {
                    const latest = snapshot.docs[0].data();
                    if (latest.senderId !== currentUser.uid) {
                        showNotification(`New message from ${conv.otherDisplayName || 'a user'}`, 'info');
                    }
                }
            });
        });
        return () => unsubscribes.forEach(unsub => unsub());
    }, [conversations, selectedConversation, currentUser.uid, showNotification]);

    // Load messages for selected conversation
    useEffect(() => {
        if (!selectedConversation) return;

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
                    updateDoc(doc.ref, { read: true });
                }
            });
        });

        return () => unsubscribe();
    }, [selectedConversation, currentUser]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            const messagesRef = collection(db, 'conversations', selectedConversation.id, 'messages');
            const messageData = {
                senderId: currentUser.uid,
                senderEmail: currentUser.email,
                message: newMessage.trim(),
                timestamp: serverTimestamp(),
                read: false
            };

            await addDoc(messagesRef, messageData);

            // Update conversation last message
            await updateDoc(doc(db, 'conversations', selectedConversation.id), {
                'lastMessage.text': newMessage.trim(),
                'lastMessage.senderId': currentUser.uid,
                'lastMessage.timestamp': serverTimestamp()
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Failed to send message', 'error');
        } finally {
            setSending(false);
        }
    };


    const getConversationTitle = (conversation) => {
        if (conversation.listing) {
            return conversation.listing.title;
        }
        return conversation.otherDisplayName || conversation.participantEmails?.find(email => email !== currentUser.email) || 'Unknown User';
    };

    if (loading) return <FullPageLoader message="Loading messages..." />;

    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        Home
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">Messages</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

                <div className="bg-white rounded-lg shadow-md overflow-hidden flex h-[600px]">
                    {/* Conversations List */}
                    <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r border-gray-200`}>
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900">Conversations</h2>
                        </div>
                        <div className="overflow-y-auto h-full">
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center">
                                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No conversations yet</p>
                                    <p className="text-sm text-gray-400 mt-2">Start by contacting sellers on items you're interested in</p>
                                </div>
                            ) : (
                                conversations.map(conversation => (
                                    <button
                                        key={conversation.id}
                                        onClick={() => setSelectedConversation(conversation)}
                                        className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${selectedConversation?.id === conversation.id ? 'bg-green-50 border-r-4 border-r-green-600' : ''}`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {conversation.otherAvatar ? (
                                                <img
                                                    src={conversation.otherAvatar}
                                                    alt={conversation.otherDisplayName}
                                                    className="w-12 h-12 object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold text-xl">
                                                    {conversation.otherDisplayName?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {getConversationTitle(conversation)}
                                                    </p>
                                                    {conversation.lastMessage?.timestamp && (
                                                        <span className="text-xs text-gray-500">
                                                            {timeAgo(conversation.lastMessage.timestamp)}
                                                        </span>
                                                    )}
                                                </div>
                                                {conversation.listing?.price && (
                                                    <p className="text-sm text-green-600 font-semibold">
                                                        {formatPrice(conversation.listing.price)}
                                                    </p>
                                                )}
                                                {conversation.lastMessage?.text && (
                                                    <p className="text-sm text-gray-500 truncate mt-1">
                                                        {conversation.lastMessage.senderId === currentUser.uid ? 'You: ' : ''}
                                                        {conversation.lastMessage.text}
                                                    </p>
                                                )}
                                            </div>
                                            {conversation.unreadCount > 0 && (
                                                <span className="ml-2 bg-green-600 text-white rounded-full px-2 py-1 text-xs font-bold">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Messages View */}
                    <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1 flex flex-col`}>
                        {selectedConversation ? (
                            <>
                                {/* Conversation Header */}
                                <div className="p-4 border-b border-gray-200 flex items-center">
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="lg:hidden mr-3 p-1 hover:bg-gray-100 rounded"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="flex items-center space-x-3">
                                        {selectedConversation.listing?.imageUrl && (
                                            <img
                                                src={selectedConversation.listing.imageUrl}
                                                alt={selectedConversation.listing.title}
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {getConversationTitle(selectedConversation)}
                                            </h3>
                                            {selectedConversation.listing?.price && (
                                                <p className="text-sm text-green-600 font-semibold">
                                                    {formatPrice(selectedConversation.listing.price)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map(message => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === currentUser.uid
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-200 text-gray-900'
                                                    }`}
                                            >
                                                <p className="text-sm">{message.message}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className={`text-xs ${message.senderId === currentUser.uid ? 'text-green-100' : 'text-gray-500'
                                                        }`}>
                                                        {message.timestamp ? timeAgo(message.timestamp) : 'Sending...'}
                                                    </span>
                                                    {message.senderId === currentUser.uid && (
                                                        <div className="flex items-center ml-2">
                                                            {message.read ? (
                                                                <Eye size={12} className="text-green-100" />
                                                            ) : (
                                                                <Clock size={12} className="text-green-100" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Message Input */}
                                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            disabled={sending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !newMessage.trim()}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
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