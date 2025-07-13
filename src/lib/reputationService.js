// src/lib/reputationService.js
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Fetches and consolidates a user's reputation data from across TuiTrade.
 *
 * @param {string} userId The ID of the user to fetch reputation for.
 * @returns {Promise<object>} An object containing the user's consolidated reputation.
 */
export const fetchUserReputation = async (userId) => {
  if (!userId) {
    return null;
  }

  try {
    // 1. Fetch Seller Reviews to calculate average rating and total trades
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('sellerId', '==', userId)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);

    const reviews = reviewsSnapshot.docs.map(doc => doc.data());

    let averageSellerRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageSellerRating = totalRating / reviews.length;
    }

    // For now, we'll use review count as a proxy for total trades.
    // This can be enhanced later with a dedicated 'trades' collection.
    const totalTrades = reviews.length;

    // 2. Generate badges based on performance
    const badges = [];
    if (totalTrades > 10) {
      badges.push({ 
        id: 'powerSeller', 
        name: 'Power Seller', 
        description: 'Completed 10+ successful trades', 
        color: '#FFD700' 
      });
    }
    if (averageSellerRating > 4) {
      badges.push({ 
        id: 'topRated', 
        name: 'Top Rated', 
        description: 'Maintains excellent seller rating', 
        color: '#00FF00' 
      });
    }
    if (totalTrades > 50) {
      badges.push({ 
        id: 'veteran', 
        name: 'Veteran Trader', 
        description: 'Completed 50+ successful trades', 
        color: '#FF6B35' 
      });
    }

    // 3. Fetch User Account Info for "memberSince"
    // This part requires fetching the user document itself.
    // We will mock this for now to avoid circular dependencies with auth.
    const memberSince = new Date(); // Placeholder

    return {
      averageSellerRating: parseFloat(averageSellerRating.toFixed(1)),
      totalTrades,
      badges,
      memberSince,
    };

  } catch (error) {
    console.error("Error fetching user reputation:", error);
    // Return a default object on error to prevent UI crashes
    return {
      averageSellerRating: 0,
      totalTrades: 0,
      badges: [],
      memberSince: new Date(),
      error: 'Failed to fetch reputation data.',
    };
  }
};

/**
 * Calculates reputation score based on various metrics
 */
export const calculateReputationScore = (reputation) => {
  if (!reputation) return 0;
  
  let score = 0;
  
  // Base score from rating (0-50 points)
  score += (reputation.averageSellerRating / 5) * 50;
  
  // Bonus for number of trades (0-30 points)
  score += Math.min(reputation.totalTrades * 2, 30);
  
  // Bonus for badges (0-20 points)
  score += reputation.badges.length * 5;
  
  return Math.round(score);
};

/**
 * Gets reputation level based on score
 */
export const getReputationLevel = (score) => {
  if (score >= 90) return { level: 'Legendary', color: '#FFD700', description: 'Exceptional reputation' };
  if (score >= 80) return { level: 'Excellent', color: '#00FF00', description: 'Very high reputation' };
  if (score >= 70) return { level: 'Good', color: '#87CEEB', description: 'Good reputation' };
  if (score >= 50) return { level: 'Fair', color: '#FFA500', description: 'Fair reputation' };
  return { level: 'New', color: '#808080', description: 'Building reputation' };
};
