// Advanced Messaging Service for TuiTrade
// Context-aware messaging with relationship-based permissions and features
// Supports: Marketplace, Professional, Community, Personal, and Inner Circle conversations

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  runTransaction
} from 'firebase/firestore';
import {
  ref,
  push,
  onValue,
  off,
  serverTimestamp as rtServerTimestamp,
  onDisconnect
} from 'firebase/database';
import { db, realtimeDb } from './firebase';
import { createNotification } from './notificationService';
import { storage } from './firebase'; // Added storage import
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Added storage imports

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
  ORDER_UPDATE: 'order_update',
  OFFER: 'offer',
  LOCATION: 'location',
  LISTING_SHARE: 'listing_share',
  PAYMENT_REQUEST: 'payment_request',
  EVENT_INVITE: 'event_invite',
  CV_SHARE: 'cv_share',
  VOICE: 'voice'
};

// Conversation types
export const CONVERSATION_TYPES = {
  ITEM_INQUIRY: 'item_inquiry',
  ORDER_DISCUSSION: 'order_discussion',
  SUPPORT: 'support',
  GENERAL: 'general'
};

// Message contexts for relationship-based messaging
export const MESSAGE_CONTEXTS = {
  MARKETPLACE: {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Buying and selling conversations',
    features: ['listing-preview', 'price-negotiation', 'payment-integration', 'delivery-tracking'],
    permissions: ['public', 'acquaintance', 'business-contact'],
    autoArchiveAfter: 30, // days
    encryption: false
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    description: 'Job and business communications',
    features: ['cv-sharing', 'interview-scheduling', 'reference-requests', 'portfolio-sharing'],
    permissions: ['public', 'business-contact', 'friend'],
    autoArchiveAfter: 90,
    encryption: false
  },
  COMMUNITY: {
    id: 'community',
    name: 'Community',
    description: 'Neighbourhood and local discussions',
    features: ['event-coordination', 'local-recommendations', 'safety-alerts', 'group-messaging'],
    permissions: ['public', 'neighbour', 'friend'],
    autoArchiveAfter: 60,
    encryption: false
  },
  PERSONAL: {
    id: 'personal',
    name: 'Personal',
    description: 'Friends and social conversations',
    features: ['photo-sharing', 'reactions', 'voice-messages', 'location-sharing'],
    permissions: ['friend', 'inner-circle'],
    autoArchiveAfter: 365,
    encryption: false
  },
  INNER_CIRCLE: {
    id: 'inner-circle',
    name: 'Inner Circle',
    description: 'Close friends and family',
    features: ['end-to-end-encryption', 'disappearing-messages', 'priority-notifications', 'unlimited-media'],
    permissions: ['inner-circle'],
    autoArchiveAfter: null, // Never
    encryption: true
  }
};

// Message status
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

// File upload constraints
export const FILE_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'text/plain', 'application/msword'],
    archive: ['application/zip', 'application/x-rar-compressed']
  }
};

class MessagingService {
  constructor() {
    this.conversations = new Map();
    this.messageListeners = new Map();
    this.typingListeners = new Map();
    this.presenceListeners = new Map();
    this.isInitialized = false;
    this.currentUserId = null;
  }

  initialize(userId) {
    if (this.isInitialized) return;

    this.currentUserId = userId;
    this.setupPresence(userId);
    this.isInitialized = true;
    console.log('MessagingService initialized for user:', userId);
  }

  // Setup user presence tracking
  setupPresence(userId) {
    if (!realtimeDb) return;

    const presenceRef = ref(realtimeDb, `presence/${userId}`);
    const connectedRef = ref(realtimeDb, '.info/connected');

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // User is online
        const presenceData = {
          online: true,
          lastSeen: rtServerTimestamp(),
          timestamp: Date.now()
        };

        // Set online status
        updateDoc(presenceRef, presenceData);

        // Setup disconnect handler
        onDisconnect(presenceRef).update({
          online: false,
          lastSeen: rtServerTimestamp(),
          timestamp: Date.now()
        });
      }
    });
  }

  // Create or get conversation
  async createConversation(participantIds, conversationType, metadata = {}) {
    try {
      // Check if conversation already exists
      const existingConversation = await this.findExistingConversation(participantIds, metadata);
      if (existingConversation) {
        return existingConversation;
      }

      const conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        participants: participantIds,
        type: conversationType,
        metadata,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
        unreadCounts: participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
        archived: participantIds.reduce((acc, id) => ({ ...acc, [id]: false }), {}),
        muted: participantIds.reduce((acc, id) => ({ ...acc, [id]: false }), {})
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversation);
      const createdConversation = { ...conversation, firestoreId: docRef.id };

      this.conversations.set(docRef.id, createdConversation);
      return createdConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  // Find existing conversation between participants
  async findExistingConversation(participantIds, metadata = {}) {
    try {
      let q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', participantIds[0])
      );

      const snapshot = await getDocs(q);

      for (const doc of snapshot.docs) {
        const conv = doc.data();

        // Check if all participants match
        const allParticipantsMatch = participantIds.every(id => conv.participants.includes(id)) &&
          conv.participants.length === participantIds.length;

        // For item inquiries, also check item ID
        if (allParticipantsMatch && metadata.itemId) {
          if (conv.metadata?.itemId === metadata.itemId) {
            return { id: doc.id, ...conv, firestoreId: doc.id };
          }
        } else if (allParticipantsMatch && !metadata.itemId) {
          return { id: doc.id, ...conv, firestoreId: doc.id };
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding existing conversation:', error);
      return null;
    }
  }

  // Send message
  async sendMessage(conversationId, messageData) {
    try {
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        senderId: this.currentUserId,
        type: messageData.type || MESSAGE_TYPES.TEXT,
        content: messageData.content,
        metadata: messageData.metadata || {},
        timestamp: serverTimestamp(),
        status: MESSAGE_STATUS.SENDING,
        edited: false,
        reactions: {}
      };

      // Add to Firestore for persistence
      const messageRef = await addDoc(collection(db, 'messages'), message);
      const savedMessage = { ...message, firestoreId: messageRef.id };

      // Add to Realtime Database for instant delivery
      if (realtimeDb) {
        const rtMessage = {
          ...savedMessage,
          timestamp: rtServerTimestamp()
        };
        await push(ref(realtimeDb, `conversations/${conversationId}/messages`), rtMessage);
      }

      // Update conversation last message
      await this.updateConversationLastMessage(conversationId, savedMessage);

      // Send notifications to other participants
      await this.sendMessageNotifications(conversationId, savedMessage);

      // Update message status to sent
      await this.updateMessageStatus(messageRef.id, MESSAGE_STATUS.SENT);

      return savedMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  // Subscribe to conversation messages
  subscribeToMessages(conversationId, callback, options = {}) {
    try {
      // Use Realtime Database for instant updates
      if (realtimeDb) {
        const messagesRef = ref(realtimeDb, `conversations/${conversationId}/messages`);
        const rtQuery = options.limit ?
          query(messagesRef, orderBy('timestamp', 'desc'), limit(options.limit)) :
          query(messagesRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onValue(rtQuery, (snapshot) => {
          const messages = [];
          snapshot.forEach((childSnapshot) => {
            messages.unshift({ id: childSnapshot.key, ...childSnapshot.val() });
          });
          callback(messages);
        });

        this.messageListeners.set(conversationId, unsubscribe);
        return () => {
          off(messagesRef);
          this.messageListeners.delete(conversationId);
        };
      }

      // Fallback to Firestore
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        ...(options.limit ? [limit(options.limit)] : [])
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(messages.reverse());
      });

      this.messageListeners.set(conversationId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return () => { };
    }
  }

  // Subscribe to user conversations
  subscribeToConversations(userId, callback) {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const conversations = [];

        for (const doc of snapshot.docs) {
          const conv = { id: doc.id, ...doc.data() };

          // Get participant details
          const participantDetails = await this.getParticipantDetails(conv.participants);
          conv.participantDetails = participantDetails;

          conversations.push(conv);
        }

        callback(conversations);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to conversations:', error);
      return () => { };
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId, messageIds) {
    try {
      const batch = [];

      // Update message statuses
      for (const messageId of messageIds) {
        batch.push(
          updateDoc(doc(db, 'messages', messageId), {
            status: MESSAGE_STATUS.READ,
            readAt: serverTimestamp(),
            readBy: arrayUnion(this.currentUserId)
          })
        );
      }

      await Promise.all(batch);

      // Reset unread count for this user
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCounts.${this.currentUserId}`]: 0
      });

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Typing indicators
  startTyping(conversationId) {
    if (!realtimeDb) return;

    const typingRef = ref(realtimeDb, `typing/${conversationId}/${this.currentUserId}`);
    updateDoc(typingRef, {
      typing: true,
      timestamp: rtServerTimestamp()
    });

    // Auto-stop typing after 5 seconds
    setTimeout(() => this.stopTyping(conversationId), 5000);
  }

  stopTyping(conversationId) {
    if (!realtimeDb) return;

    const typingRef = ref(realtimeDb, `typing/${conversationId}/${this.currentUserId}`);
    updateDoc(typingRef, {
      typing: false,
      timestamp: rtServerTimestamp()
    });
  }

  subscribeToTyping(conversationId, callback) {
    if (!realtimeDb) return () => { };

    const typingRef = ref(realtimeDb, `typing/${conversationId}`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const typingUsers = [];
      const data = snapshot.val();

      if (data) {
        Object.entries(data).forEach(([userId, typingData]) => {
          if (typingData.typing && userId !== this.currentUserId) {
            // Check if typing is recent (within 10 seconds)
            const timeDiff = Date.now() - (typingData.timestamp || 0);
            if (timeDiff < 10000) {
              typingUsers.push(userId);
            }
          }
        });
      }

      callback(typingUsers);
    });

    this.typingListeners.set(conversationId, unsubscribe);
    return unsubscribe;
  }

  // File upload handling
  async uploadFile(file, conversationId) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Real Firebase Storage integration
      const fileRef = storageRef(storage, `conversations/${conversationId}/files/${Date.now()}_${file.name}`);

      // Upload file to Firebase Storage
      const uploadResult = await uploadBytes(fileRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: downloadURL,
        uploadedAt: new Date().toISOString(),
        storagePath: uploadResult.ref.fullPath
      };

      return fileData;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Message reactions
  async addReaction(messageId, emoji) {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const currentReactions = messageDoc.data().reactions || {};
      const userReactions = currentReactions[this.currentUserId] || [];

      // Toggle reaction
      const updatedReactions = userReactions.includes(emoji)
        ? userReactions.filter(r => r !== emoji)
        : [...userReactions, emoji];

      await updateDoc(messageRef, {
        [`reactions.${this.currentUserId}`]: updatedReactions
      });

      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  // Search messages
  async searchMessages(query, conversationId = null) {
    try {
      // This would use full-text search in production
      // For now, simple query implementation
      let q = collection(db, 'messages');

      if (conversationId) {
        q = query(q, where('conversationId', '==', conversationId));
      }

      const snapshot = await getDocs(q);
      const messages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(message =>
          message.content?.toLowerCase().includes(query.toLowerCase()) ||
          message.metadata?.fileName?.toLowerCase().includes(query.toLowerCase())
        );

      return messages;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  // Archive conversation
  async archiveConversation(conversationId, archived = true) {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`archived.${this.currentUserId}`]: archived,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  // Mute conversation
  async muteConversation(conversationId, muted = true) {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`muted.${this.currentUserId}`]: muted,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error muting conversation:', error);
      throw error;
    }
  }

  // Helper methods
  async updateConversationLastMessage(conversationId, message) {
    try {
      const updates = {
        lastMessage: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          timestamp: message.timestamp,
          type: message.type
        },
        updatedAt: serverTimestamp()
      };

      // Increment unread counts for other participants
      const conversation = await getDoc(doc(db, 'conversations', conversationId));
      if (conversation.exists()) {
        const convData = conversation.data();
        const otherParticipants = convData.participants.filter(id => id !== this.currentUserId);

        otherParticipants.forEach(participantId => {
          updates[`unreadCounts.${participantId}`] = (convData.unreadCounts?.[participantId] || 0) + 1;
        });
      }

      await updateDoc(doc(db, 'conversations', conversationId), updates);
    } catch (error) {
      console.error('Error updating conversation last message:', error);
    }
  }

  async updateMessageStatus(messageId, status) {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        status,
        [`${status}At`]: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  async sendMessageNotifications(conversationId, message) {
    try {
      const conversation = await getDoc(doc(db, 'conversations', conversationId));
      if (!conversation.exists()) return;

      const convData = conversation.data();
      const otherParticipants = convData.participants.filter(id => id !== this.currentUserId);

      for (const participantId of otherParticipants) {
        // Check if conversation is muted
        if (convData.muted?.[participantId]) continue;

        await createNotification(participantId, {
          type: 'new_message',
          title: 'New Message',
          message: this.getNotificationText(message),
          data: {
            conversationId,
            messageId: message.id,
            senderId: message.senderId
          }
        });
      }
    } catch (error) {
      console.error('Error sending message notifications:', error);
    }
  }

  async getParticipantDetails(participantIds) {
    try {
      const details = {};

      for (const id of participantIds) {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          details[id] = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: userData.profilePicture,
            online: false // Would check presence
          };
        }
      }

      return details;
    } catch (error) {
      console.error('Error getting participant details:', error);
      return {};
    }
  }

  validateFile(file) {
    if (file.size > FILE_CONSTRAINTS.maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    const isAllowedType = Object.values(FILE_CONSTRAINTS.allowedTypes)
      .flat()
      .includes(file.type);

    if (!isAllowedType) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }

  getNotificationText(message) {
    switch (message.type) {
      case MESSAGE_TYPES.TEXT:
        return message.content.length > 50
          ? message.content.substring(0, 50) + '...'
          : message.content;
      case MESSAGE_TYPES.IMAGE:
        return 'Sent an image';
      case MESSAGE_TYPES.FILE:
        return `Sent a file: ${message.metadata?.fileName || 'document'}`;
      case MESSAGE_TYPES.OFFER:
        return 'Made an offer';
      default:
        return 'Sent a message';
    }
  }

  cleanup() {
    // Clean up all listeners
    this.messageListeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') unsubscribe();
    });
    this.messageListeners.clear();

    this.typingListeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') unsubscribe();
    });
    this.typingListeners.clear();

    this.presenceListeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') unsubscribe();
    });
    this.presenceListeners.clear();

    this.conversations.clear();
    this.isInitialized = false;
    this.currentUserId = null;
  }
}

// Create singleton instance
const messagingService = new MessagingService();

export {
  MESSAGE_TYPES,
  CONVERSATION_TYPES,
  MESSAGE_STATUS,
  FILE_CONSTRAINTS
};

export default messagingService;