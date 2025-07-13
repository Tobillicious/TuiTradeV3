// src/components/ui/EnhancedMessaging.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { timeAgo } from '../../lib/utils';
import { MessageCircle, Send, Paperclip, Smile, MoreVertical, Check, CheckCheck, Clock, User, X } from 'lucide-react';
import { useTeReo, TeReoText } from './TeReoToggle';

const EnhancedMessaging = ({ conversationId, onNavigate }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const { getText } = useTeReo();

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversation details
    useEffect(() => {
        if (!conversationId || !currentUser) return;

        const loadConversation = async () => {
            try {
                const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
                if (conversationDoc.exists()) {
                    setConversation(conversationDoc.data());
                }
            } catch (error) {
                console.error('Error loading conversation:', error);
            }
        };

        loadConversation();
    }, [conversationId, currentUser]);

    // Load messages
    useEffect(() => {
        if (!conversationId || !currentUser) return;

        setLoading(true);
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messageData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
            setMessages(messageData);
            setLoading(false);

            // Mark messages as read
            snapshot.docs.forEach(doc => {
                if (!doc.data().read && doc.data().senderId !== currentUser.uid) {
                    updateDoc(doc.ref, { read: true, readAt: serverTimestamp() }).catch(error => {
                        console.warn('Error marking message as read:', error);
                    });
                }
            });
        }, (error) => {
            console.error('Error loading messages:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [conversationId, currentUser]);

    // Listen for typing indicators
    useEffect(() => {
        if (!conversationId || !currentUser) return;

        const typingRef = doc(db, 'conversations', conversationId, 'typing', currentUser.uid);

        // Listen for other users typing
        const unsubscribe = onSnapshot(collection(db, 'conversations', conversationId, 'typing'), (snapshot) => {
            const typingUsers = new Set();
            snapshot.docs.forEach(doc => {
                if (doc.id !== currentUser.uid && doc.data().isTyping) {
                    typingUsers.add(doc.id);
                }
            });
            setTypingUsers(typingUsers);
        });

        return () => unsubscribe();
    }, [conversationId, currentUser]);

    // Handle typing indicator
    const handleTyping = useCallback(async (isUserTyping) => {
        if (!conversationId || !currentUser) return;

        try {
            const typingRef = doc(db, 'conversations', conversationId, 'typing', currentUser.uid);
            await updateDoc(typingRef, {
                isTyping: isUserTyping,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.warn('Error updating typing status:', error);
        }
    }, [conversationId, currentUser]);

    // Debounced typing indicator
    useEffect(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (isTyping) {
            handleTyping(true);
            typingTimeoutRef.current = setTimeout(() => {
                handleTyping(false);
                setIsTyping(false);
            }, 3000);
        } else {
            handleTyping(false);
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [isTyping, handleTyping]);

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !conversationId || !currentUser) return;

        setSending(true);
        setIsTyping(false);

        try {
            const messageData = {
                text: newMessage.trim(),
                senderId: currentUser.uid,
                senderEmail: currentUser.email,
                timestamp: serverTimestamp(),
                read: false,
                status: 'sending'
            };

            const messageRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);

            // Update message status to sent
            await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageRef.id), {
                status: 'sent'
            });

            // Update conversation's last message
            await updateDoc(doc(db, 'conversations', conversationId), {
                lastMessage: {
                    text: newMessage.trim(),
                    senderId: currentUser.uid,
                    timestamp: serverTimestamp()
                }
            });

            setNewMessage('');
            showNotification('Message sent', 'success');
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Failed to send message', 'error');
        } finally {
            setSending(false);
        }
    };

    // Handle input change with typing indicator
    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        if (!isTyping) {
            setIsTyping(true);
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Get message status icon
    const getMessageStatus = (message) => {
        if (message.senderId !== currentUser.uid) return null;

        switch (message.status) {
            case 'sending':
                return <Clock size={12} className="text-gray-400" />;
            case 'sent':
                return <Check size={12} className="text-gray-400" />;
            case 'delivered':
                return <CheckCheck size={12} className="text-gray-400" />;
            case 'read':
                return <CheckCheck size={12} className="text-blue-500" />;
            default:
                return <Clock size={12} className="text-gray-400" />;
        }
    };

    // Get other participant info
    const getOtherParticipant = () => {
        if (!conversation) return null;
        const otherId = conversation.participants.find(p => p !== currentUser.uid);
        return {
            id: otherId,
            name: conversation.otherDisplayName || 'Unknown User',
            avatar: conversation.otherAvatar
        };
    };

    if (!conversationId || !currentUser) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                        <TeReoText english="Select a conversation to start messaging" teReoKey="selectConversation" />
                    </p>
                </div>
            </div>
        );
    }

    const otherParticipant = getOtherParticipant();

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => onNavigate('messages')}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            {otherParticipant?.avatar ? (
                                <img src={otherParticipant.avatar} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                                <User size={20} className="text-gray-600" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{otherParticipant?.name}</h3>
                            {typingUsers.size > 0 && (
                                <p className="text-sm text-blue-600">
                                    <TeReoText english="typing..." teReoKey="typing" />
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={20} className="text-gray-600" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">
                            <TeReoText english="No messages yet" teReoKey="noMessages" />
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            <TeReoText english="Start the conversation!" teReoKey="startConversation" />
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="max-w-xs lg:max-w-md">
                                <div
                                    className={`px-4 py-2 rounded-lg ${message.senderId === currentUser.uid
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className={`text-xs ${message.senderId === currentUser.uid ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {message.timestamp ? timeAgo(message.timestamp) : 'Just now'}
                                        </span>
                                        {getMessageStatus(message)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder={getText('Type your message...', 'typeMessage')}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={1}
                            disabled={sending}
                        />
                        <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                            <button
                                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <Paperclip size={16} className="text-gray-400" />
                            </button>
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <Smile size={16} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
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
        </div>
    );
};

export default EnhancedMessaging; 