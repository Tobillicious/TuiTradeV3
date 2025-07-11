// Community and Social Features for TuiTrade
// Building a vibrant marketplace community

import { trackEvent } from './analytics';

// User profile and reputation system
export const USER_PROFILE_SCHEMA = {
    basic: {
        displayName: { required: true, maxLength: 50 },
        bio: { required: false, maxLength: 500 },
        location: { required: true, type: 'nz_region' },
        joinDate: { auto: true },
        avatar: { required: false, type: 'image' },
        coverPhoto: { required: false, type: 'image' }
    },
    
    verification: {
        emailVerified: { default: false },
        phoneVerified: { default: false },
        addressVerified: { default: false },
        idVerified: { default: false },
        bankAccountVerified: { default: false }
    },
    
    reputation: {
        trustScore: { default: 0, range: [0, 100] },
        totalRatings: { default: 0 },
        positiveRatings: { default: 0 },
        neutralRatings: { default: 0 },
        negativeRatings: { default: 0 },
        sellerLevel: { default: 'new', enum: ['new', 'bronze', 'silver', 'gold', 'platinum'] },
        badges: { default: [], type: 'array' }
    },
    
    activity: {
        itemsSold: { default: 0 },
        itemsPurchased: { default: 0 },
        totalListings: { default: 0 },
        activeListings: { default: 0 },
        lastActive: { auto: true },
        memberSince: { auto: true }
    },
    
    social: {
        followers: { default: [], type: 'array' },
        following: { default: [], type: 'array' },
        favouriteCategories: { default: [], type: 'array' },
        socialLinks: {
            facebook: { required: false },
            instagram: { required: false },
            website: { required: false }
        }
    },
    
    preferences: {
        notificationSettings: {
            emailNotifications: { default: true },
            pushNotifications: { default: true },
            smsNotifications: { default: false },
            marketingEmails: { default: false }
        },
        privacySettings: {
            showRealName: { default: false },
            showLocation: { default: true },
            showActivity: { default: true },
            allowMessages: { default: true }
        }
    }
};

// Seller level requirements and benefits
export const SELLER_LEVELS = {
    new: {
        name: 'New Seller',
        icon: '🌱',
        color: 'gray',
        requirements: {},
        benefits: ['Basic listing features', 'Community support'],
        listingLimit: 5,
        featuredListings: 0
    },
    bronze: {
        name: 'Bronze Seller',
        icon: '🥉',
        color: 'amber',
        requirements: {
            itemsSold: 5,
            trustScore: 85,
            emailVerified: true
        },
        benefits: ['Priority support', 'Advanced listing tools', '10% fee discount'],
        listingLimit: 20,
        featuredListings: 1,
        feeDiscount: 0.1
    },
    silver: {
        name: 'Silver Seller',
        icon: '🥈',
        color: 'gray',
        requirements: {
            itemsSold: 25,
            trustScore: 90,
            phoneVerified: true,
            positiveRatings: 20
        },
        benefits: ['Free featured listings', 'Custom store page', '20% fee discount'],
        listingLimit: 50,
        featuredListings: 3,
        feeDiscount: 0.2
    },
    gold: {
        name: 'Gold Seller',
        icon: '🥇',
        color: 'yellow',
        requirements: {
            itemsSold: 100,
            trustScore: 95,
            idVerified: true,
            totalRatings: 50
        },
        benefits: ['Premium store features', 'Analytics dashboard', '30% fee discount'],
        listingLimit: 100,
        featuredListings: 5,
        feeDiscount: 0.3
    },
    platinum: {
        name: 'Platinum Seller',
        icon: '💎',
        color: 'purple',
        requirements: {
            itemsSold: 500,
            trustScore: 98,
            addressVerified: true,
            bankAccountVerified: true
        },
        benefits: ['All premium features', 'Dedicated support', '50% fee discount'],
        listingLimit: 'unlimited',
        featuredListings: 10,
        feeDiscount: 0.5
    }
};

// Achievement badges system
export const ACHIEVEMENT_BADGES = {
    trading: {
        'first-sale': { name: 'First Sale', description: 'Made your first sale', icon: '🎉', points: 10 },
        'power-seller': { name: 'Power Seller', description: 'Sold 100+ items', icon: '💪', points: 100 },
        'quick-seller': { name: 'Quick Seller', description: 'Sold item within 24 hours', icon: '⚡', points: 25 },
        'repeat-customer': { name: 'Repeat Customer', description: 'Bought from same seller 3+ times', icon: '🔄', points: 30 }
    },
    
    community: {
        'helpful-reviewer': { name: 'Helpful Reviewer', description: 'Left 50+ helpful reviews', icon: '⭐', points: 50 },
        'social-butterfly': { name: 'Social Butterfly', description: 'Following 50+ users', icon: '🦋', points: 25 },
        'trendsetter': { name: 'Trendsetter', description: 'Listed in trending category first', icon: '📈', points: 40 },
        'community-helper': { name: 'Community Helper', description: 'Helped 20+ users', icon: '🤝', points: 60 }
    },
    
    quality: {
        'five-star-seller': { name: 'Five Star Seller', description: 'Maintained 5-star rating for 6 months', icon: '🌟', points: 75 },
        'honest-describer': { name: 'Honest Describer', description: 'Zero "item not as described" reports', icon: '✅', points: 50 },
        'fast-shipper': { name: 'Fast Shipper', description: 'Always ships within 24 hours', icon: '📦', points: 40 },
        'eco-warrior': { name: 'Eco Warrior', description: 'Listed 50+ sustainable items', icon: '🌱', points: 35 }
    }
};

// Activity feed and social features
export const ACTIVITY_TYPES = {
    // User activities
    user_joined: { icon: '👋', template: '{user} joined TuiTrade' },
    user_verified: { icon: '✅', template: '{user} completed account verification' },
    level_upgraded: { icon: '⬆️', template: '{user} reached {level} seller status' },
    badge_earned: { icon: '🏆', template: '{user} earned the {badge} badge' },
    
    // Trading activities  
    item_listed: { icon: '📦', template: '{user} listed {item}' },
    item_sold: { icon: '💰', template: '{user} sold {item}' },
    item_featured: { icon: '⭐', template: '{user} featured {item}' },
    milestone_reached: { icon: '🎯', template: '{user} reached {milestone} sales' },
    
    // Social activities
    user_followed: { icon: '👥', template: '{user} started following {target}' },
    review_left: { icon: '⭐', template: '{user} left a {rating}-star review' },
    wishlist_shared: { icon: '❤️', template: '{user} shared their wishlist' },
    
    // Community activities
    forum_post: { icon: '💬', template: '{user} posted in {category} forum' },
    question_answered: { icon: '❓', template: '{user} answered a community question' },
    tip_shared: { icon: '💡', template: '{user} shared a selling tip' }
};

// Review and rating system
export const REVIEW_CATEGORIES = {
    seller: {
        communication: {
            name: 'Communication',
            description: 'How well did the seller communicate?',
            weight: 0.25
        },
        accuracy: {
            name: 'Item as Described',
            description: 'Was the item exactly as described?',
            weight: 0.35
        },
        shipping: {
            name: 'Shipping Speed',
            description: 'How quickly was the item shipped?',
            weight: 0.25
        },
        packaging: {
            name: 'Packaging',
            description: 'How well was the item packaged?',
            weight: 0.15
        }
    },
    
    buyer: {
        payment: {
            name: 'Payment Speed',
            description: 'How quickly did the buyer pay?',
            weight: 0.4
        },
        communication: {
            name: 'Communication',
            description: 'How well did the buyer communicate?',
            weight: 0.3
        },
        pickup: {
            name: 'Pickup/Collection',
            description: 'Was pickup smooth and on time?',
            weight: 0.3
        }
    }
};

// Community forums and discussions
export const FORUM_CATEGORIES = {
    'general-discussion': {
        name: 'General Discussion',
        description: 'General marketplace chat',
        icon: '💬',
        moderators: ['admin'],
        allowImages: true,
        allowPolls: true
    },
    
    'selling-tips': {
        name: 'Selling Tips & Tricks',
        description: 'Share your selling expertise',
        icon: '💡',
        featured: true,
        allowImages: true,
        tags: ['photography', 'pricing', 'descriptions', 'shipping']
    },
    
    'buying-advice': {
        name: 'Buying Advice',
        description: 'Get help with purchases',
        icon: '🛒',
        allowImages: true,
        tags: ['negotiation', 'authenticity', 'safety', 'payment']
    },
    
    'category-specific': {
        name: 'Category Discussions',
        description: 'Category-specific discussions',
        icon: '📂',
        subcategories: {
            'electronics': 'Electronics & Tech',
            'motors': 'Motors & Vehicles', 
            'fashion': 'Fashion & Style',
            'home': 'Home & Garden'
        }
    },
    
    'feedback-suggestions': {
        name: 'Feedback & Suggestions',
        description: 'Help us improve TuiTrade',
        icon: '📝',
        moderated: true,
        allowVoting: true
    }
};

// Social features implementation
export class CommunityManager {
    constructor(userId) {
        this.userId = userId;
        this.activities = [];
        this.notifications = [];
    }

    // Follow/Unfollow system
    async followUser(targetUserId) {
        try {
            // Add to following list
            await this.updateUserField('following', targetUserId, 'add');
            
            // Add to target's followers
            await this.updateUserField('followers', this.userId, 'add', targetUserId);
            
            // Create activity
            await this.createActivity('user_followed', {
                target: targetUserId
            });
            
            // Send notification to target user
            await this.sendNotification(targetUserId, 'new_follower', {
                follower: this.userId
            });
            
            trackEvent('user_follow', { targetUserId });
            
            return { success: true };
        } catch (error) {
            console.error('Error following user:', error);
            return { success: false, error: error.message };
        }
    }

    async unfollowUser(targetUserId) {
        try {
            await this.updateUserField('following', targetUserId, 'remove');
            await this.updateUserField('followers', this.userId, 'remove', targetUserId);
            
            trackEvent('user_unfollow', { targetUserId });
            
            return { success: true };
        } catch (error) {
            console.error('Error unfollowing user:', error);
            return { success: false, error: error.message };
        }
    }

    // Activity feed
    async createActivity(type, data = {}) {
        const activity = {
            id: Date.now().toString(),
            type,
            userId: this.userId,
            data,
            timestamp: new Date(),
            visibility: 'public' // public, followers, private
        };

        this.activities.unshift(activity);
        
        // In real app, save to database
        // await saveActivity(activity);
        
        return activity;
    }

    async getActivityFeed(options = {}) {
        const {
            followingOnly = false,
            limit = 20,
            offset = 0,
            types = null
        } = options;

        let feed = this.activities;

        // Filter by following if requested
        if (followingOnly) {
            const following = await this.getFollowing();
            feed = feed.filter(activity => 
                following.includes(activity.userId) || activity.userId === this.userId
            );
        }

        // Filter by activity types
        if (types && types.length > 0) {
            feed = feed.filter(activity => types.includes(activity.type));
        }

        // Sort by timestamp (newest first)
        feed = feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Apply pagination
        return feed.slice(offset, offset + limit);
    }

    // User recommendations
    async getUserRecommendations() {
        const recommendations = [];
        
        // Users selling in favourite categories
        const favouriteCategories = await this.getFavouriteCategories();
        
        // Popular sellers in user's region
        const userLocation = await this.getUserLocation();
        
        // Users with similar interests
        const similarUsers = await this.findSimilarUsers();
        
        return {
            categoryBased: recommendations.slice(0, 5),
            locationBased: recommendations.slice(0, 3),
            similarInterests: similarUsers.slice(0, 4)
        };
    }

    // Notification system
    async sendNotification(targetUserId, type, data = {}) {
        const notification = {
            id: Date.now().toString(),
            targetUserId,
            fromUserId: this.userId,
            type,
            data,
            timestamp: new Date(),
            read: false
        };

        // In real app, save to database and send push notification
        return notification;
    }

    // Helper methods
    async updateUserField(field, value, operation, targetUserId = null) {
        // Simulate database operation
        console.log(`Updating ${field} for user ${targetUserId || this.userId}`);
    }

    async getFollowing() {
        // Return list of user IDs this user is following
        return [];
    }

    async getFavouriteCategories() {
        // Return user's favourite categories based on activity
        return [];
    }

    async getUserLocation() {
        // Return user's location
        return 'auckland';
    }

    async findSimilarUsers() {
        // Find users with similar activity patterns
        return [];
    }
}

// Trust and safety calculations
export const calculateTrustScore = (userStats) => {
    const {
        totalRatings = 0,
        positiveRatings = 0,
        neutralRatings = 0,
        negativeRatings = 0,
        itemsSold = 0,
        accountAge = 0, // days
        verificationLevel = 0
    } = userStats;

    if (totalRatings === 0) return 0;

    // Base score from ratings (0-70 points)
    const positiveRatio = positiveRatings / totalRatings;
    const ratingScore = positiveRatio * 70;

    // Volume bonus (0-20 points)
    const volumeScore = Math.min(itemsSold / 10, 20);

    // Account age bonus (0-5 points)
    const ageScore = Math.min(accountAge / 365, 5);

    // Verification bonus (0-5 points)
    const verificationScore = verificationLevel;

    const totalScore = ratingScore + volumeScore + ageScore + verificationScore;
    
    return Math.min(Math.round(totalScore), 100);
};

// Content moderation helpers
export const MODERATION_RULES = {
    prohibited: [
        'weapons', 'drugs', 'stolen goods', 'counterfeit items',
        'adult content', 'illegal items', 'hazardous materials'
    ],
    
    restricted: [
        'alcohol', 'prescription medication', 'financial services',
        'real estate', 'vehicles without WOF', 'animals'
    ],
    
    flagReasons: [
        'Inappropriate content',
        'Spam or duplicate listing',
        'Prohibited item',
        'Misleading description',
        'Wrong category',
        'Suspected fraud',
        'Copyright violation'
    ]
};

export default {
    USER_PROFILE_SCHEMA,
    SELLER_LEVELS,
    ACHIEVEMENT_BADGES,
    ACTIVITY_TYPES,
    REVIEW_CATEGORIES,
    FORUM_CATEGORIES,
    CommunityManager,
    calculateTrustScore,
    MODERATION_RULES
};