// Comprehensive Review and Rating Service - Trust and reputation system
// Handles user reviews, ratings, seller verification, and trust metrics

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
  serverTimestamp,
  runTransaction,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notificationService';

// Review types
export const REVIEW_TYPES = {
  SELLER: 'seller',
  BUYER: 'buyer',
  ITEM: 'item',
  SERVICE: 'service'
};

// Rating categories
export const RATING_CATEGORIES = {
  OVERALL: 'overall',
  COMMUNICATION: 'communication',
  ACCURACY: 'accuracy',
  SHIPPING: 'shipping',
  VALUE: 'value'
};

// Review status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  PUBLISHED: 'published',
  FLAGGED: 'flagged',
  REMOVED: 'removed'
};

// Trust levels
export const TRUST_LEVELS = {
  NEW: { level: 'new', minReviews: 0, minRating: 0, badge: '🆕' },
  BRONZE: { level: 'bronze', minReviews: 10, minRating: 4.0, badge: '🥉' },
  SILVER: { level: 'silver', minReviews: 50, minRating: 4.3, badge: '🥈' },
  GOLD: { level: 'gold', minReviews: 100, minRating: 4.5, badge: '🥇' },
  PLATINUM: { level: 'platinum', minReviews: 250, minRating: 4.7, badge: '💎' },
  ELITE: { level: 'elite', minReviews: 500, minRating: 4.8, badge: '👑' }
};

class ReviewService {
  constructor() {
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('ReviewService initialized');
  }

  // Create a review
  async createReview(reviewData) {
    try {
      const review = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        reviewerId: reviewData.reviewerId,
        revieweeId: reviewData.revieweeId,
        orderId: reviewData.orderId,
        itemId: reviewData.itemId,
        type: reviewData.type || REVIEW_TYPES.SELLER,

        // Ratings
        ratings: {
          [RATING_CATEGORIES.OVERALL]: reviewData.rating,
          [RATING_CATEGORIES.COMMUNICATION]: reviewData.communicationRating || reviewData.rating,
          [RATING_CATEGORIES.ACCURACY]: reviewData.accuracyRating || reviewData.rating,
          [RATING_CATEGORIES.SHIPPING]: reviewData.shippingRating || reviewData.rating,
          [RATING_CATEGORIES.VALUE]: reviewData.valueRating || reviewData.rating
        },

        // Review content
        title: reviewData.title || '',
        comment: reviewData.comment || '',
        pros: reviewData.pros || [],
        cons: reviewData.cons || [],

        // Media
        images: reviewData.images || [],
        videos: reviewData.videos || [],

        // Metadata
        transactionValue: reviewData.transactionValue,
        itemCategory: reviewData.itemCategory,
        location: reviewData.location,

        // Status
        status: REVIEW_STATUS.PENDING,
        isVerifiedPurchase: reviewData.isVerifiedPurchase || false,

        // Moderation
        flags: [],
        moderationNotes: '',

        // Engagement
        helpfulVotes: 0,
        unhelpfulVotes: 0,
        replies: [],

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Check if review already exists for this transaction
      const existingReview = await this.findExistingReview(
        reviewData.reviewerId,
        reviewData.revieweeId,
        reviewData.orderId
      );

      if (existingReview) {
        throw new Error('Review already exists for this transaction');
      }

      // Add review to database
      const docRef = await addDoc(collection(db, 'reviews'), review);
      const createdReview = { ...review, firestoreId: docRef.id };

      // Update reviewee's rating statistics
      await this.updateUserRatingStats(reviewData.revieweeId);

      // Send notification to reviewee
      await createNotification(reviewData.revieweeId, {
        type: 'new_review',
        title: 'New Review Received',
        message: `You received a ${reviewData.rating}-star review`,
        data: { reviewId: docRef.id, rating: reviewData.rating }
      });

      // Auto-publish if review passes basic validation
      if (this.shouldAutoPublish(review)) {
        await this.publishReview(docRef.id);
      }

      return createdReview;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Find existing review
  async findExistingReview(reviewerId, revieweeId, orderId) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('reviewerId', '==', reviewerId),
        where('revieweeId', '==', revieweeId),
        where('orderId', '==', orderId)
      );

      const snapshot = await getDocs(q);
      return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error('Error finding existing review:', error);
      return null;
    }
  }

  // Publish review
  async publishReview(reviewId) {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: REVIEW_STATUS.PUBLISHED,
        publishedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error publishing review:', error);
      throw error;
    }
  }

  // Get reviews for a user
  async getUserReviews(userId, options = {}) {
    try {
      const {
        type = 'received', // 'received' or 'given'
        limit: limitCount = 20,
        status = REVIEW_STATUS.PUBLISHED,
        orderByField = 'createdAt',
        orderDirection = 'desc'
      } = options;

      const field = type === 'received' ? 'revieweeId' : 'reviewerId';

      let q = query(
        collection(db, 'reviews'),
        where(field, '==', userId),
        where('status', '==', status),
        orderBy(orderByField, orderDirection)
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get reviewer details for received reviews
      if (type === 'received') {
        for (const review of reviews) {
          const reviewerDoc = await getDoc(doc(db, 'users', review.reviewerId));
          if (reviewerDoc.exists()) {
            review.reviewerDetails = {
              firstName: reviewerDoc.data().firstName,
              lastName: reviewerDoc.data().lastName,
              profileImage: reviewerDoc.data().profileImage
            };
          }
        }
      }

      return reviews;
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  }

  // Get reviews for an item
  async getItemReviews(itemId, options = {}) {
    try {
      const {
        limit: limitCount = 20,
        status = REVIEW_STATUS.PUBLISHED,
        orderByField = 'helpfulVotes',
        orderDirection = 'desc'
      } = options;

      let q = query(
        collection(db, 'reviews'),
        where('itemId', '==', itemId),
        where('status', '==', status),
        orderBy(orderByField, orderDirection)
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get reviewer details
      for (const review of reviews) {
        const reviewerDoc = await getDoc(doc(db, 'users', review.reviewerId));
        if (reviewerDoc.exists()) {
          review.reviewerDetails = {
            firstName: reviewerDoc.data().firstName,
            lastName: reviewerDoc.data().lastName,
            profileImage: reviewerDoc.data().profileImage,
            trustLevel: reviewerDoc.data().trustLevel
          };
        }
      }

      return reviews;
    } catch (error) {
      console.error('Error getting item reviews:', error);
      throw error;
    }
  }

  // Update user rating statistics
  async updateUserRatingStats(userId) {
    try {
      const result = await runTransaction(db, async (transaction) => {
        // Get all published reviews for this user
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('revieweeId', '==', userId),
          where('status', '==', REVIEW_STATUS.PUBLISHED)
        );

        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map(doc => doc.data());

        if (reviews.length === 0) {
          return { totalReviews: 0, averageRating: 0 };
        }

        // Calculate statistics
        const totalReviews = reviews.length;
        const ratingSum = reviews.reduce((sum, review) => sum + review.ratings.overall, 0);
        const averageRating = Math.round((ratingSum / totalReviews) * 10) / 10;

        // Calculate category averages
        const categoryAverages = {};
        Object.values(RATING_CATEGORIES).forEach(category => {
          const categorySum = reviews.reduce((sum, review) => sum + (review.ratings[category] || 0), 0);
          categoryAverages[category] = Math.round((categorySum / totalReviews) * 10) / 10;
        });

        // Calculate trust level
        const trustLevel = this.calculateTrustLevel(totalReviews, averageRating);

        // Calculate response rate (would need message data)
        const responseRate = 95; // Mock value

        // Update user document
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);

        if (userDoc.exists()) {
          transaction.update(userRef, {
            'ratings.totalReviews': totalReviews,
            'ratings.averageRating': averageRating,
            'ratings.categoryAverages': categoryAverages,
            'ratings.responseRate': responseRate,
            'trustLevel': trustLevel,
            'ratings.updatedAt': serverTimestamp()
          });
        }

        return { totalReviews, averageRating, categoryAverages, trustLevel };
      });

      return result;
    } catch (error) {
      console.error('Error updating user rating stats:', error);
      throw error;
    }
  }

  // Calculate trust level
  calculateTrustLevel(totalReviews, averageRating) {
    const levels = Object.values(TRUST_LEVELS).reverse(); // Start from highest

    for (const level of levels) {
      if (totalReviews >= level.minReviews && averageRating >= level.minRating) {
        return level;
      }
    }

    return TRUST_LEVELS.NEW;
  }

  // Vote on review helpfulness
  async voteOnReview(reviewId, userId, isHelpful) {
    try {
      const result = await runTransaction(db, async (transaction) => {
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await transaction.get(reviewRef);

        if (!reviewDoc.exists()) {
          throw new Error('Review not found');
        }

        const reviewData = reviewDoc.data();
        const helpfulVoters = reviewData.helpfulVoters || [];
        const unhelpfulVoters = reviewData.unhelpfulVoters || [];

        // Remove user from both lists first
        const newHelpfulVoters = helpfulVoters.filter(id => id !== userId);
        const newUnhelpfulVoters = unhelpfulVoters.filter(id => id !== userId);

        // Add to appropriate list
        if (isHelpful) {
          newHelpfulVoters.push(userId);
        } else {
          newUnhelpfulVoters.push(userId);
        }

        // Update review
        transaction.update(reviewRef, {
          helpfulVoters: newHelpfulVoters,
          unhelpfulVoters: newUnhelpfulVoters,
          helpfulVotes: newHelpfulVoters.length,
          unhelpfulVotes: newUnhelpfulVoters.length
        });

        return {
          helpfulVotes: newHelpfulVoters.length,
          unhelpfulVotes: newUnhelpfulVoters.length
        };
      });

      return result;
    } catch (error) {
      console.error('Error voting on review:', error);
      throw error;
    }
  }

  // Reply to review
  async replyToReview(reviewId, userId, replyText) {
    try {
      const reply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        authorId: userId,
        text: replyText,
        createdAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'reviews', reviewId), {
        replies: arrayUnion(reply),
        updatedAt: serverTimestamp()
      });

      return reply;
    } catch (error) {
      console.error('Error replying to review:', error);
      throw error;
    }
  }

  // Flag review for moderation
  async flagReview(reviewId, userId, reason, description = '') {
    try {
      const flag = {
        id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        reporterId: userId,
        reason,
        description,
        createdAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'reviews', reviewId), {
        flags: arrayUnion(flag),
        status: REVIEW_STATUS.FLAGGED,
        updatedAt: serverTimestamp()
      });

      // Create moderation task
      await addDoc(collection(db, 'moderation_tasks'), {
        type: 'review_flag',
        reviewId,
        flag,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      return flag;
    } catch (error) {
      console.error('Error flagging review:', error);
      throw error;
    }
  }

  // Get review statistics for a user
  async getUserReviewStats(userId) {
    try {
      // Get user document
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        return {
          totalReviews: 0,
          averageRating: 0,
          categoryAverages: {},
          trustLevel: TRUST_LEVELS.NEW,
          recentReviews: []
        };
      }

      const userData = userDoc.data();
      const ratings = userData.ratings || {};

      // Get recent reviews
      const recentReviews = await this.getUserReviews(userId, {
        type: 'received',
        limit: 5,
        orderByField: 'createdAt',
        orderDirection: 'desc'
      });

      // Calculate distribution
      const reviewsForDistribution = await this.getUserReviews(userId, {
        type: 'received',
        limit: 100
      });

      const distribution = [1, 2, 3, 4, 5].map(rating => {
        const count = reviewsForDistribution.filter(r => Math.round(r.ratings.overall) === rating).length;
        return { rating, count, percentage: Math.round((count / reviewsForDistribution.length) * 100) || 0 };
      });

      return {
        totalReviews: ratings.totalReviews || 0,
        averageRating: ratings.averageRating || 0,
        categoryAverages: ratings.categoryAverages || {},
        trustLevel: userData.trustLevel || TRUST_LEVELS.NEW,
        responseRate: ratings.responseRate || 0,
        distribution,
        recentReviews
      };
    } catch (error) {
      console.error('Error getting user review stats:', error);
      throw error;
    }
  }

  // Auto-publish validation
  shouldAutoPublish(review) {
    // Basic validation rules
    if (review.comment.length < 10) return false;
    if (review.ratings.overall < 1 || review.ratings.overall > 5) return false;
    if (this.containsInappropriateContent(review.comment)) return false;

    return true;
  }

  // Content moderation
  containsInappropriateContent(text) {
    const inappropriateWords = [
      'spam', 'fake', 'scam', 'fraud'
      // Would extend with comprehensive list
    ];

    const lowerText = text.toLowerCase();
    return inappropriateWords.some(word => lowerText.includes(word));
  }

  // Get review analytics
  async getReviewAnalytics(userId, timeframe = '30d') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeframe === '30d' ? 30 : 7));

      const reviews = await this.getUserReviews(userId, {
        type: 'received',
        limit: 1000
      });

      const recentReviews = reviews.filter(review =>
        review.createdAt?.toDate?.() >= startDate
      );

      const analytics = {
        totalReviews: reviews.length,
        recentReviews: recentReviews.length,
        averageRating: reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.ratings.overall, 0) / reviews.length
          : 0,
        ratingTrend: this.calculateRatingTrend(reviews),
        categoryBreakdown: this.calculateCategoryBreakdown(reviews),
        monthlyStats: this.calculateMonthlyStats(reviews)
      };

      return analytics;
    } catch (error) {
      console.error('Error getting review analytics:', error);
      throw error;
    }
  }

  calculateRatingTrend(reviews) {
    const last30 = reviews.slice(0, 30);
    const previous30 = reviews.slice(30, 60);

    if (last30.length === 0) return 0;

    const recent = last30.reduce((sum, r) => sum + r.ratings.overall, 0) / last30.length;
    const previous = previous30.length > 0
      ? previous30.reduce((sum, r) => sum + r.ratings.overall, 0) / previous30.length
      : recent;

    return ((recent - previous) / previous) * 100;
  }

  calculateCategoryBreakdown(reviews) {
    if (reviews.length === 0) return {};

    const breakdown = {};
    Object.values(RATING_CATEGORIES).forEach(category => {
      const sum = reviews.reduce((total, review) => total + (review.ratings[category] || 0), 0);
      breakdown[category] = Math.round((sum / reviews.length) * 10) / 10;
    });

    return breakdown;
  }

  calculateMonthlyStats(reviews) {
    const stats = {};

    reviews.forEach(review => {
      const date = review.createdAt?.toDate?.();
      if (date) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!stats[monthKey]) {
          stats[monthKey] = { count: 0, totalRating: 0 };
        }
        stats[monthKey].count++;
        stats[monthKey].totalRating += review.ratings.overall;
      }
    });

    // Calculate averages
    Object.keys(stats).forEach(month => {
      stats[month].averageRating = Math.round((stats[month].totalRating / stats[month].count) * 10) / 10;
    });

    return stats;
  }

  cleanup() {
    this.isInitialized = false;
  }
}

// Create singleton instance
const reviewService = new ReviewService();

// Mock data for development and testing
export const MOCK_REVIEWS = [
  {
    id: 'mock_review_1',
    reviewerId: 'user_123',
    revieweeId: 'user_456',
    rating: 5,
    title: 'Excellent seller!',
    comment: 'Great communication and fast shipping. Highly recommended!',
    createdAt: new Date('2024-01-15'),
    status: 'published'
  },
  {
    id: 'mock_review_2',
    reviewerId: 'user_789',
    revieweeId: 'user_456',
    rating: 4,
    title: 'Good experience',
    comment: 'Item as described, good seller.',
    createdAt: new Date('2024-01-10'),
    status: 'published'
  }
];

export default reviewService;