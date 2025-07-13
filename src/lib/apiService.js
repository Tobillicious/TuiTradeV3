// API Service for User Interaction Tracking and Personalized Feeds
// Handles all backend communication for personalization features

import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const functions = getFunctions();

// User Interaction Tracking
export const INTERACTION_TYPES = {
  VIEW: 'view',
  CLICK: 'click',
  WATCHLIST_ADD: 'watchlist_add',
  WATCHLIST_REMOVE: 'watchlist_remove',
  PURCHASE: 'purchase',
  SEARCH: 'search',
  CATEGORY_BROWSE: 'category_browse'
};

/**
 * Track user interaction with an item
 * @param {string} itemId - The item being interacted with
 * @param {string} categoryId - The category of the item
 * @param {string} interactionType - Type of interaction (from INTERACTION_TYPES)
 * @param {Object} additionalData - Any additional data to track
 */
export const trackUserInteraction = async (itemId, categoryId, interactionType, additionalData = {}) => {
  try {
    // Store interaction in Firestore for real-time access
    const interactionData = {
      itemId,
      categoryId,
      interactionType,
      timestamp: serverTimestamp(),
      ...additionalData
    };

    // Add to userInteractions collection
    await addDoc(collection(db, 'userInteractions'), interactionData);

    // Also call Cloud Function for processing (if available)
    try {
      const trackInteraction = httpsCallable(functions, 'trackUserInteraction');
      await trackInteraction({ itemId, categoryId, interactionType, additionalData });
    } catch (error) {
      console.warn('Cloud Function not available, using Firestore only:', error);
    }

    console.log('Interaction tracked:', interactionType, itemId);
  } catch (error) {
    console.error('Error tracking interaction:', error);
    // Don't throw error to avoid breaking user experience
  }
};

/**
 * Get user's personalized feed
 * @param {number} limit - Number of items to return
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} - Array of personalized items
 */
export const getPersonalizedFeed = async (limit = 20, filters = {}) => {
  try {
    // Try Cloud Function first
    try {
      const generateFeed = httpsCallable(functions, 'generatePersonalizedFeed');
      const result = await generateFeed({ limit, filters });
      return result.data.items || [];
    } catch (error) {
      console.warn('Cloud Function not available, using local algorithm:', error);
    }

    // Fallback to local algorithm
    return await getLocalPersonalizedFeed(limit, filters);
  } catch (error) {
    console.error('Error getting personalized feed:', error);
    return [];
  }
};

/**
 * Local fallback algorithm for personalized feed
 * @param {number} limit - Number of items to return
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} - Array of items
 */
const getLocalPersonalizedFeed = async (limit, filters) => {
  try {
    // For now, return recent items as fallback
    // This will be enhanced with local user preference calculation
    const recentItems = await getRecentListings(limit);

    // Simple local scoring based on user's recent interactions
    const userInteractions = await getUserRecentInteractions();
    const scoredItems = recentItems.map(item => ({
      ...item,
      relevanceScore: calculateLocalRelevanceScore(item, userInteractions)
    }));

    // Sort by relevance score
    scoredItems.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scoredItems.slice(0, limit);
  } catch (error) {
    console.error('Error in local feed generation:', error);
    return [];
  }
};

/**
 * Get recent listings from Firestore
 * @param {number} limit - Number of items to return
 * @returns {Promise<Array>} - Array of recent items
 */
const getRecentListings = async (limit = 20) => {
  try {
    const listingsRef = collection(db, 'listings');
    const q = query(
      listingsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recent listings:', error);
    return [];
  }
};

/**
 * Get user's recent interactions for local scoring
 * @returns {Promise<Array>} - Array of recent interactions
 */
const getUserRecentInteractions = async () => {
  try {
    // Get current user from localStorage or context
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];

    const interactionsRef = collection(db, 'userInteractions');
    const q = query(
      interactionsRef,
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return [];
  }
};

/**
 * Calculate local relevance score for an item
 * @param {Object} item - The item to score
 * @param {Array} userInteractions - User's recent interactions
 * @returns {number} - Relevance score
 */
const calculateLocalRelevanceScore = (item, userInteractions) => {
  let score = 0;

  // Base score from item popularity
  score += (item.viewCount || 0) * 0.1;
  score += (item.watchlistCount || 0) * 0.5;

  // Boost score based on user's category preferences
  const categoryInteractions = userInteractions.filter(
    interaction => interaction.categoryId === item.categoryId
  );

  if (categoryInteractions.length > 0) {
    score += categoryInteractions.length * 2;
  }

  // Boost score for items from sellers the user has interacted with
  const sellerInteractions = userInteractions.filter(
    interaction => interaction.sellerId === item.userId
  );

  if (sellerInteractions.length > 0) {
    score += sellerInteractions.length * 1.5;
  }

  return score;
};

/**
 * Update user profile with calculated preferences
 * @param {Object} preferences - User's calculated preferences
 */
export const updateUserProfile = async (preferences) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const profileRef = doc(db, 'users', currentUser.uid, 'profile', 'preferences');
    await setDoc(profileRef, {
      ...preferences,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};

/**
 * Get user's current profile preferences
 * @returns {Promise<Object|null>} - User's preferences or null
 */
export const getUserProfile = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return null;

    const profileRef = doc(db, 'users', currentUser.uid, 'profile', 'preferences');
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      return profileSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Convenience functions for common interactions
export const trackItemView = (itemId, categoryId, additionalData = {}) => {
  return trackUserInteraction(itemId, categoryId, INTERACTION_TYPES.VIEW, additionalData);
};

export const trackItemClick = (itemId, categoryId, additionalData = {}) => {
  return trackUserInteraction(itemId, categoryId, INTERACTION_TYPES.CLICK, additionalData);
};

export const trackWatchlistAdd = (itemId, categoryId, additionalData = {}) => {
  return trackUserInteraction(itemId, categoryId, INTERACTION_TYPES.WATCHLIST_ADD, additionalData);
};

export const trackPurchase = (itemId, categoryId, additionalData = {}) => {
  return trackUserInteraction(itemId, categoryId, INTERACTION_TYPES.PURCHASE, additionalData);
};

export const trackSearch = (query, resultsCount, additionalData = {}) => {
  return trackUserInteraction(null, null, INTERACTION_TYPES.SEARCH, {
    query,
    resultsCount,
    ...additionalData
  });
};

export const trackCategoryBrowse = (categoryId, additionalData = {}) => {
  return trackUserInteraction(null, categoryId, INTERACTION_TYPES.CATEGORY_BROWSE, additionalData);
};