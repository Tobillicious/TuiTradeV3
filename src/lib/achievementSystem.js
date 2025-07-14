// Achievement System - Gamified Life Impact Recognition
// Celebrates users' contributions to changing lives across Aotearoa

import { collection, doc, getDoc, getDocs, query, where, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Achievement Categories & Badges
export const ACHIEVEMENT_CATEGORIES = {
  LIFE_CHANGER: {
    id: 'life-changer',
    name: 'Life Changer',
    maoriName: 'Kaiwhakatipu Oranga',
    description: 'Making direct positive impact on lives',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: '❤️'
  },
  JOB_CREATOR: {
    id: 'job-creator',
    name: 'Job Creator',
    maoriName: 'Kaihanga Mahi',
    description: 'Creating employment opportunities',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '💼'
  },
  COMMUNITY_BUILDER: {
    id: 'community-builder',
    name: 'Community Builder',
    maoriName: 'Kaihanga Hapori',
    description: 'Strengthening local communities',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: '🏘️'
  },
  MARKETPLACE_HERO: {
    id: 'marketplace-hero',
    name: 'Marketplace Hero',
    maoriName: 'Toa Tauhokohoko',
    description: 'Exceptional trading and sharing',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: '🛍️'
  },
  CULTURAL_CHAMPION: {
    id: 'cultural-champion',
    name: 'Cultural Champion',
    maoriName: 'Toa Ahurea',
    description: 'Promoting Te Reo Māori and NZ values',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: '🌿'
  },
  YOUTH_SUPPORTER: {
    id: 'youth-supporter',
    name: 'Youth Supporter',
    maoriName: 'Kaitautoko Taiohi',
    description: 'Directly helping children and young people',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    icon: '🌟'
  }
};

export const ACHIEVEMENTS = {
  // Life Changer Achievements
  FIRST_LIFE_CHANGED: {
    id: 'first-life-changed',
    name: 'First Life Changed',
    maoriName: 'Oranga Tuatahi',
    description: 'Made your first positive impact on someone\'s life',
    category: 'life-changer',
    requirement: { type: 'lives_changed', count: 1 },
    points: 100,
    rarity: 'common',
    celebration: 'confetti',
    reward: { badge: true, title: 'Life Changer' }
  },
  LIFE_TRANSFORMER: {
    id: 'life-transformer',
    name: 'Life Transformer',
    maoriName: 'Kaiwhakataone Oranga',
    description: 'Changed 10 lives through your platform activity',
    category: 'life-changer',
    requirement: { type: 'lives_changed', count: 10 },
    points: 500,
    rarity: 'rare',
    celebration: 'splash',
    reward: { badge: true, title: 'Life Transformer', specialCursor: '7000ms' }
  },
  COMMUNITY_SAVIOR: {
    id: 'community-savior',
    name: 'Community Savior',
    maoriName: 'Whakaora Hapori',
    description: 'Changed 50 lives - you\'re a community hero!',
    category: 'life-changer',
    requirement: { type: 'lives_changed', count: 50 },
    points: 2000,
    rarity: 'legendary',
    celebration: 'fireworks',
    reward: { badge: true, title: 'Community Savior', specialCursor: '15000ms', profileGlow: true }
  },

  // Job Creator Achievements
  FIRST_JOB_CREATED: {
    id: 'first-job-created',
    name: 'Job Creator',
    maoriName: 'Kaihanga Mahi',
    description: 'Posted your first job opportunity',
    category: 'job-creator',
    requirement: { type: 'jobs_created', count: 1 },
    points: 200,
    rarity: 'common',
    celebration: 'sparkles',
    reward: { badge: true, title: 'Job Creator' }
  },
  EMPLOYMENT_CHAMPION: {
    id: 'employment-champion',
    name: 'Employment Champion',
    maoriName: 'Toa Whakangao',
    description: 'Created 10 job opportunities',
    category: 'job-creator',
    requirement: { type: 'jobs_created', count: 10 },
    points: 1000,
    rarity: 'epic',
    celebration: 'cascade',
    reward: { badge: true, title: 'Employment Champion', featured: true }
  },

  // Marketplace Hero Achievements
  FIRST_SALE: {
    id: 'first-sale',
    name: 'First Sale Success',
    maoriName: 'Hoko Angitu Tuatahi',
    description: 'Completed your first marketplace transaction',
    category: 'marketplace-hero',
    requirement: { type: 'transactions_completed', count: 1 },
    points: 50,
    rarity: 'common',
    celebration: 'gentle',
    reward: { badge: true }
  },
  TRADING_MASTER: {
    id: 'trading-master',
    name: 'Trading Master',
    maoriName: 'Tohunga Tauhokohoko',
    description: 'Completed 100 successful transactions',
    category: 'marketplace-hero',
    requirement: { type: 'transactions_completed', count: 100 },
    points: 1500,
    rarity: 'epic',
    celebration: 'burst',
    reward: { badge: true, title: 'Trading Master', discountCode: '10PERCENT' }
  },

  // Community Builder Achievements
  NEIGHBOURHOOD_CONNECTOR: {
    id: 'neighbourhood-connector',
    name: 'Neighbourhood Connector',
    maoriName: 'Kaihono Rēhia',
    description: 'Connected 5 neighbours through the platform',
    category: 'community-builder',
    requirement: { type: 'connections_made', count: 5 },
    points: 300,
    rarity: 'uncommon',
    celebration: 'ripple',
    reward: { badge: true, title: 'Connector' }
  },
  COMMUNITY_PILLAR: {
    id: 'community-pillar',
    name: 'Community Pillar',
    maoriName: 'Pou Hapori',
    description: 'Helped strengthen 3 different communities',
    category: 'community-builder',
    requirement: { type: 'communities_helped', count: 3 },
    points: 800,
    rarity: 'rare',
    celebration: 'glow',
    reward: { badge: true, title: 'Community Pillar', highlightedProfile: true }
  },

  // Cultural Champion Achievements
  TE_REO_ADVOCATE: {
    id: 'te-reo-advocate',
    name: 'Te Reo Advocate',
    maoriName: 'Kaikōrero Te Reo',
    description: 'Used Te Reo Māori features extensively',
    category: 'cultural-champion',
    requirement: { type: 'te_reo_usage', count: 50 },
    points: 400,
    rarity: 'uncommon',
    celebration: 'maori',
    reward: { badge: true, title: 'Kaikōrero', culturalFrame: true }
  },
  CULTURAL_GUARDIAN: {
    id: 'cultural-guardian',
    name: 'Cultural Guardian',
    maoriName: 'Kaitiaki Ahurea',
    description: 'Promoted NZ values and culture',
    category: 'cultural-champion',
    requirement: { type: 'cultural_actions', count: 25 },
    points: 600,
    rarity: 'rare',
    celebration: 'koru',
    reward: { badge: true, title: 'Kaitiaki', specialBackground: 'maori-pattern' }
  },

  // Youth Supporter Achievements
  CHILD_ADVOCATE: {
    id: 'child-advocate',
    name: 'Child Advocate',
    maoriName: 'Kaitautoko Tamaiti',
    description: 'Directly helped 3 children through your actions',
    category: 'youth-supporter',
    requirement: { type: 'children_helped', count: 3 },
    points: 1000,
    rarity: 'epic',
    celebration: 'rainbow',
    reward: { badge: true, title: 'Child Advocate', heartGlow: true }
  },
  FUTURE_BUILDER: {
    id: 'future-builder',
    name: 'Future Builder',
    maoriName: 'Kaihanga Taima',
    description: 'Helped 10 children access education or opportunities',
    category: 'youth-supporter',
    requirement: { type: 'children_helped', count: 10 },
    points: 2500,
    rarity: 'legendary',
    celebration: 'supernova',
    reward: { 
      badge: true, 
      title: 'Future Builder', 
      specialProfile: true,
      thankyouVideo: true,
      impactReport: true
    }
  }
};

// Celebration Types and Effects
export const CELEBRATION_EFFECTS = {
  gentle: { duration: 2000, particles: 10, colors: ['#10B981', '#3B82F6'] },
  confetti: { duration: 3000, particles: 30, colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'] },
  sparkles: { duration: 2500, particles: 20, colors: ['#F59E0B', '#EAB308'] },
  splash: { duration: 5000, particles: 50, colors: ['#10B981', '#059669'], effect: 'splash-cursor' },
  fireworks: { duration: 7000, particles: 100, colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'], effect: 'fireworks' },
  cascade: { duration: 4000, particles: 40, colors: ['#3B82F6', '#1D4ED8'], effect: 'cascade' },
  burst: { duration: 3500, particles: 35, colors: ['#8B5CF6', '#7C3AED'], effect: 'burst' },
  ripple: { duration: 3000, particles: 25, colors: ['#10B981', '#059669'], effect: 'ripple' },
  glow: { duration: 4000, particles: 30, colors: ['#F59E0B', '#D97706'], effect: 'glow' },
  maori: { duration: 5000, particles: 40, colors: ['#059669', '#DC2626'], effect: 'koru-spiral' },
  koru: { duration: 6000, particles: 45, colors: ['#059669', '#DC2626', '#000000'], effect: 'koru-growth' },
  rainbow: { duration: 4500, particles: 60, colors: ['#EF4444', '#F59E0B', '#EAB308', '#10B981', '#3B82F6', '#8B5CF6'], effect: 'rainbow-arc' },
  supernova: { duration: 8000, particles: 120, colors: ['#FFFFFF', '#F59E0B', '#EF4444'], effect: 'supernova-explosion' }
};

class AchievementSystem {
  constructor() {
    this.userAchievements = new Map();
    this.userStats = new Map();
    this.listeners = new Set();
  }

  // Initialize achievement system for user
  async initializeForUser(userId) {
    try {
      await this.loadUserAchievements(userId);
      await this.loadUserStats(userId);
      this.checkForNewAchievements(userId);
    } catch (error) {
      console.error('Error initializing achievement system:', error);
    }
  }

  // Load user's existing achievements
  async loadUserAchievements(userId) {
    try {
      const achievementsQuery = query(
        collection(db, 'userAchievements'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(achievementsQuery);
      const achievements = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        achievements[data.achievementId] = {
          id: doc.id,
          unlockedAt: data.unlockedAt,
          progress: data.progress || 100,
          celebrated: data.celebrated || false,
          ...data
        };
      });
      
      this.userAchievements.set(userId, achievements);
    } catch (error) {
      console.error('Error loading user achievements:', error);
      this.userAchievements.set(userId, {});
    }
  }

  // Load user's current stats
  async loadUserStats(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data() || {};
      
      const stats = {
        lives_changed: userData.impactScore || 0,
        jobs_created: userData.jobsCreated || 0,
        transactions_completed: userData.transactionsCompleted || 0,
        connections_made: userData.connectionsCount || 0,
        communities_helped: userData.communitiesHelped || 0,
        children_helped: Math.floor((userData.impactScore || 0) * 0.3),
        te_reo_usage: userData.teReoUsage || 0,
        cultural_actions: userData.culturalActions || 0
      };
      
      this.userStats.set(userId, stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      this.userStats.set(userId, {});
    }
  }

  // Check for new achievements based on current stats
  async checkForNewAchievements(userId) {
    const userStats = this.userStats.get(userId) || {};
    const userAchievements = this.userAchievements.get(userId) || {};
    const newAchievements = [];

    // Check each achievement
    Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
      if (!userAchievements[achievement.id]) {
        const statValue = userStats[achievement.requirement.type] || 0;
        
        if (statValue >= achievement.requirement.count) {
          newAchievements.push(achievement);
        }
      }
    });

    // Award new achievements
    for (const achievement of newAchievements) {
      await this.awardAchievement(userId, achievement);
    }

    return newAchievements;
  }

  // Award achievement to user
  async awardAchievement(userId, achievement) {
    try {
      const achievementData = {
        userId,
        achievementId: achievement.id,
        unlockedAt: serverTimestamp(),
        progress: 100,
        celebrated: false,
        points: achievement.points,
        category: achievement.category,
        rarity: achievement.rarity
      };

      const docRef = await addDoc(collection(db, 'userAchievements'), achievementData);
      
      // Update user's total points
      await this.updateUserPoints(userId, achievement.points);
      
      // Update local cache
      const userAchievements = this.userAchievements.get(userId) || {};
      userAchievements[achievement.id] = { id: docRef.id, ...achievementData };
      this.userAchievements.set(userId, userAchievements);

      // Trigger celebration
      this.triggerAchievementCelebration(achievement);
      
      // Notify listeners
      this.notifyListeners('achievement_unlocked', { userId, achievement });

      return achievementData;
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }

  // Update user's total achievement points
  async updateUserPoints(userId, points) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const currentPoints = userDoc.data()?.achievementPoints || 0;
      
      await updateDoc(userRef, {
        achievementPoints: currentPoints + points,
        lastAchievementUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  }

  // Trigger celebration effects
  triggerAchievementCelebration(achievement) {
    const celebrationType = achievement.celebration || 'confetti';
    const effect = CELEBRATION_EFFECTS[celebrationType];
    
    if (effect) {
      // Trigger visual celebration
      this.showCelebrationEffect(achievement, effect);
      
      // Show achievement notification
      this.showAchievementNotification(achievement);
      
      // Apply special rewards
      if (achievement.reward.specialCursor) {
        this.activateSpecialCursor(achievement.reward.specialCursor);
      }
    }
  }

  // Show celebration effect
  showCelebrationEffect(achievement, effect) {
    // This would integrate with the UI layer to show effects
    if (window.achievementCelebration) {
      window.achievementCelebration.trigger(achievement, effect);
    }
    
    // Console celebration for now
    console.log(`🎉 ACHIEVEMENT UNLOCKED: ${achievement.name} (${achievement.maoriName})`);
    console.log(`🌟 ${achievement.description}`);
    console.log(`💎 Rarity: ${achievement.rarity.toUpperCase()}`);
    console.log(`⭐ Points: +${achievement.points}`);
  }

  // Show achievement notification
  showAchievementNotification(achievement) {
    const notification = {
      type: 'achievement',
      title: `Achievement Unlocked! ${achievement.name}`,
      message: achievement.description,
      maoriTitle: achievement.maoriName,
      icon: ACHIEVEMENT_CATEGORIES[achievement.category.toUpperCase()]?.icon || '🏆',
      duration: 8000,
      rarity: achievement.rarity,
      points: achievement.points,
      category: achievement.category
    };

    if (window.showNotification) {
      window.showNotification(notification);
    }
  }

  // Activate special cursor effect
  activateSpecialCursor(duration) {
    if (window.activateSpecialCursor) {
      window.activateSpecialCursor(parseInt(duration));
    }
  }

  // Get user's achievement progress
  getUserAchievementProgress(userId) {
    const userAchievements = this.userAchievements.get(userId) || {};
    const userStats = this.userStats.get(userId) || {};
    
    const progress = Object.entries(ACHIEVEMENTS).map(([key, achievement]) => {
      const isUnlocked = !!userAchievements[achievement.id];
      const currentValue = userStats[achievement.requirement.type] || 0;
      const progressPercent = Math.min((currentValue / achievement.requirement.count) * 100, 100);
      
      return {
        ...achievement,
        isUnlocked,
        currentValue,
        progressPercent,
        unlockedAt: userAchievements[achievement.id]?.unlockedAt
      };
    });

    return progress.sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      return b.progressPercent - a.progressPercent;
    });
  }

  // Update user stats (called when actions happen)
  async updateUserStats(userId, statType, increment = 1) {
    try {
      const userStats = this.userStats.get(userId) || {};
      userStats[statType] = (userStats[statType] || 0) + increment;
      this.userStats.set(userId, userStats);

      // Check for new achievements
      await this.checkForNewAchievements(userId);
      
      // Update database
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [statType]: userStats[statType],
        lastActivityUpdate: serverTimestamp()
      });

    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Add achievement listener
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove achievement listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in achievement listener:', error);
      }
    });
  }

  // Get user's achievement summary
  getUserAchievementSummary(userId) {
    const userAchievements = this.userAchievements.get(userId) || {};
    const categories = {};
    let totalPoints = 0;

    Object.values(userAchievements).forEach(achievement => {
      const category = achievement.category;
      if (!categories[category]) {
        categories[category] = { count: 0, points: 0 };
      }
      categories[category].count++;
      categories[category].points += achievement.points;
      totalPoints += achievement.points;
    });

    return {
      totalAchievements: Object.keys(userAchievements).length,
      totalPoints,
      categories,
      level: this.calculateUserLevel(totalPoints),
      nextLevelPoints: this.getNextLevelPoints(totalPoints)
    };
  }

  // Calculate user level based on points
  calculateUserLevel(points) {
    if (points < 500) return 1;
    if (points < 1500) return 2;
    if (points < 3500) return 3;
    if (points < 7000) return 4;
    if (points < 12000) return 5;
    if (points < 20000) return 6;
    if (points < 35000) return 7;
    if (points < 60000) return 8;
    if (points < 100000) return 9;
    return 10;
  }

  // Get points needed for next level
  getNextLevelPoints(currentPoints) {
    const levels = [0, 500, 1500, 3500, 7000, 12000, 20000, 35000, 60000, 100000];
    const currentLevel = this.calculateUserLevel(currentPoints);
    
    if (currentLevel >= 10) return 0;
    return levels[currentLevel] - currentPoints;
  }
}

// Export singleton instance
const achievementSystem = new AchievementSystem();

export default achievementSystem;

// Export utility functions
export const {
  initializeForUser,
  updateUserStats,
  getUserAchievementProgress,
  getUserAchievementSummary
} = achievementSystem;