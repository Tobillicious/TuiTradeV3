// AI-Powered Personalization Engine
// Revolutionary system that adapts TuiTrade to maximize each user's life-changing impact

import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

class AIPersonalizationEngine {
  constructor() {
    this.userProfile = null;
    this.behaviorData = null;
    this.preferences = null;
    this.impactGoals = null;
    this.lifeChangingMetrics = null;
    this.communityConnections = null;
    this.aiInsights = [];
  }

  // Initialize personalization for a user
  async initializePersonalization(userId) {
    try {
      // Load user's complete profile data
      await this.loadUserProfile(userId);
      await this.loadBehaviorData(userId);
      await this.loadPreferences(userId);
      await this.analyzeImpactGoals(userId);
      await this.loadLifeChangingMetrics(userId);
      await this.analyzeCommunityConnections(userId);
      
      return this.generatePersonalizationStrategy();
    } catch (error) {
      console.error('Error initializing personalization:', error);
      return this.getDefaultPersonalization();
    }
  }

  // Load and analyze life-changing impact metrics
  async loadLifeChangingMetrics(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      this.lifeChangingMetrics = {
        // Direct impact metrics
        livesDirectlyChanged: userData.impact?.livesChanged || 0,
        childrenHelped: userData.impact?.childrenHelped || 0,
        jobsCreated: userData.impact?.jobsCreated || 0,
        familiesSupported: userData.impact?.familiesSupported || 0,
        economicImpact: userData.impact?.economicValue || 0,
        
        // Behavioral indicators
        prioritizesSocialImpact: userData.behaviorAnalysis?.prioritizesSocialImpact || false,
        helpsInCrisis: userData.behaviorAnalysis?.helpsInCrisis || false,
        mentoringActivity: userData.behaviorAnalysis?.mentoringActivity || 0,
        communityLeadership: userData.behaviorAnalysis?.communityLeadership || 0,
        
        // Platform engagement
        impactAchievements: userData.achievements?.filter(a => a.category === 'impact') || [],
        communityBadges: userData.badges?.filter(b => b.type === 'community') || [],
        trustLevel: userData.trustLevel || { level: 'new' },
        
        // Goals and aspirations
        personalGoals: userData.personalGoals || [],
        familyGoals: userData.familyGoals || [],
        communityGoals: userData.communityGoals || [],
        emergencyNeeds: userData.emergencyNeeds || []
      };
    } catch (error) {
      console.error('Error loading life-changing metrics:', error);
      this.lifeChangingMetrics = this.getDefaultLifeChangingMetrics();
    }
  }

  // Analyze community connections and support networks
  async analyzeCommunityConnections(userId) {
    try {
      // Get user's neighborhood and community data
      const neighbourhoodQuery = query(
        collection(db, 'neighbourhood_members'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const neighSnapshot = await getDocs(neighbourhoodQuery);
      const neighbourhoods = neighSnapshot.docs.map(doc => doc.data());
      
      // Get mentoring relationships
      const mentoringQuery = query(
        collection(db, 'mentoring_relationships'),
        where('mentorId', '==', userId),
        where('status', '==', 'active')
      );
      
      const mentorSnapshot = await getDocs(mentoringQuery);
      const mentoringRelationships = mentorSnapshot.docs.map(doc => doc.data());
      
      // Get support network strength
      const supportQuery = query(
        collection(db, 'user_connections'),
        where('userId', '==', userId),
        where('type', 'in', ['family', 'friend', 'community', 'professional'])
      );
      
      const supportSnapshot = await getDocs(supportQuery);
      const supportNetwork = supportSnapshot.docs.map(doc => doc.data());
      
      this.communityConnections = {
        neighbourhoods,
        mentoringRelationships,
        supportNetwork,
        networkStrength: this.calculateNetworkStrength(supportNetwork),
        isolationRisk: this.assessIsolationRisk(supportNetwork, neighbourhoods),
        communityRole: this.determineCommunityRole(mentoringRelationships, neighbourhoods)
      };
    } catch (error) {
      console.error('Error analyzing community connections:', error);
      this.communityConnections = this.getDefaultCommunityConnections();
    }
  }

  // Load comprehensive user profile across all profile types
  async loadUserProfile(userId) {
    const profilesQuery = query(
      collection(db, 'profiles'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(profilesQuery);
    this.userProfile = {
      profiles: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      primaryProfile: null,
      skillsIndex: new Set(),
      interestsIndex: new Set(),
      locationData: null,
      verificationLevel: 'unverified'
    };

    // Analyze profile data
    this.userProfile.profiles.forEach(profile => {
      // Set primary profile (most complete or professional)
      if (!this.userProfile.primaryProfile || profile.profileType === 'professional') {
        this.userProfile.primaryProfile = profile;
      }

      // Build skills index
      if (profile.skills) {
        profile.skills.forEach(skill => this.userProfile.skillsIndex.add(skill.toLowerCase()));
      }

      // Build interests index
      if (profile.interests) {
        profile.interests.forEach(interest => this.userProfile.interestsIndex.add(interest.toLowerCase()));
      }

      // Extract location
      if (profile.location && !this.userProfile.locationData) {
        this.userProfile.locationData = profile.location;
      }

      // Determine verification level
      if (profile.verificationStatus === 'verified') {
        this.userProfile.verificationLevel = 'verified';
      }
    });
  }

  // Analyze user behavior patterns for personalization
  async loadBehaviorData(userId) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Load recent activity
    const [listings, applications, transactions, searches] = await Promise.all([
      this.getRecentActivity('listings', 'sellerId', userId, thirtyDaysAgo),
      this.getRecentActivity('jobApplications', 'applicantId', userId, thirtyDaysAgo),
      this.getRecentActivity('transactions', 'participants', userId, thirtyDaysAgo),
      this.getRecentActivity('userSearches', 'userId', userId, thirtyDaysAgo)
    ]);

    this.behaviorData = {
      recentListings: listings,
      recentApplications: applications,
      recentTransactions: transactions,
      recentSearches: searches,
      activityScore: this.calculateActivityScore(listings, applications, transactions),
      preferredCategories: this.extractPreferredCategories(listings, searches),
      timePatterns: this.analyzeTimePatterns(listings, applications, transactions),
      socialBehavior: this.analyzeSocialBehavior(transactions)
    };
  }

  // Load user preferences and settings
  async loadPreferences(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data() || {};
      
      this.preferences = {
        language: userData.preferredLanguage || 'en',
        teReoLevel: userData.teReoPreference || 'bilingual',
        notificationSettings: userData.notifications || {},
        privacyLevel: userData.privacyLevel || 'balanced',
        impactFocus: userData.impactFocus || 'community',
        accessibilityNeeds: userData.accessibility || {},
        personalizedRecommendations: userData.personalizedRecommendations !== false
      };
    } catch (error) {
      console.error('Error loading preferences:', error);
      this.preferences = this.getDefaultPreferences();
    }
  }

  // Analyze user's impact goals and contribution patterns
  async analyzeImpactGoals(userId) {
    const impactData = await this.getUserImpactData(userId);
    
    this.impactGoals = {
      primaryGoal: this.determineImpactGoal(impactData),
      currentLevel: this.calculateImpactLevel(impactData),
      strengths: this.identifyImpactStrengths(impactData),
      opportunities: this.identifyGrowthOpportunities(impactData),
      recommendedActions: this.generateImpactRecommendations(impactData)
    };
  }

  // Generate comprehensive personalization strategy
  generatePersonalizationStrategy() {
    return {
      contentStrategy: this.generateContentStrategy(),
      uiCustomizations: this.generateUICustomizations(),
      recommendationEngine: this.generateRecommendationEngine(),
      impactOptimization: this.generateImpactOptimization(),
      engagementStrategy: this.generateEngagementStrategy(),
      accessibilityEnhancements: this.generateAccessibilityEnhancements()
    };
  }

  // Content personalization strategy
  generateContentStrategy() {
    const strategy = {
      language: this.preferences.language,
      teReoIntegration: this.preferences.teReoLevel,
      contentPriority: [],
      featuredSections: [],
      hiddenSections: []
    };

    // Prioritize content based on user behavior
    if (this.behaviorData.recentApplications.length > this.behaviorData.recentListings.length) {
      strategy.contentPriority = ['jobs', 'career-development', 'marketplace', 'community'];
      strategy.featuredSections = ['ai-job-search', 'employer-dashboard', 'professional-profile'];
    } else if (this.behaviorData.recentListings.length > 0) {
      strategy.contentPriority = ['marketplace', 'seller-tools', 'jobs', 'community'];
      strategy.featuredSections = ['listing-optimization', 'seller-analytics', 'marketplace-trends'];
    } else {
      strategy.contentPriority = ['community', 'getting-started', 'marketplace', 'jobs'];
      strategy.featuredSections = ['profile-setup', 'community-impact', 'welcome-tour'];
    }

    // Add impact-focused content based on goals
    if (this.impactGoals.primaryGoal === 'job-creation') {
      strategy.featuredSections.push('employer-tools', 'job-posting-guide');
    } else if (this.impactGoals.primaryGoal === 'community-building') {
      strategy.featuredSections.push('neighbourhood-features', 'community-events');
    }

    return strategy;
  }

  // UI customization based on user needs
  generateUICustomizations() {
    return {
      theme: this.determineOptimalTheme(),
      layout: this.determineOptimalLayout(),
      navigationStyle: this.determineNavigationStyle(),
      dashboardConfig: this.generateDashboardConfig(),
      accessibilityFeatures: this.generateAccessibilityFeatures()
    };
  }

  // AI-powered recommendation engine
  generateRecommendationEngine() {
    return {
      jobRecommendations: this.generateJobRecommendations(),
      listingRecommendations: this.generateListingRecommendations(),
      connectionRecommendations: this.generateConnectionRecommendations(),
      impactOpportunities: this.generateImpactOpportunities(),
      learningRecommendations: this.generateLearningRecommendations()
    };
  }

  // Impact optimization recommendations
  generateImpactOptimization() {
    const optimizations = [];

    // Analyze current impact level
    if (this.impactGoals.currentLevel < 50) {
      optimizations.push({
        type: 'profile-completion',
        title: 'Complete Your Profiles',
        description: 'Complete all 7 profile types to unlock maximum impact potential',
        impact: 'High',
        effort: 'Medium',
        action: 'navigate-to-profiles'
      });
    }

    // Skills-based recommendations
    if (this.userProfile.skillsIndex.size > 0) {
      optimizations.push({
        type: 'skill-monetization',
        title: 'Monetize Your Skills',
        description: 'Create service listings based on your unique skills',
        impact: 'High',
        effort: 'Low',
        action: 'create-service-listing'
      });
    }

    // Location-based opportunities
    if (this.userProfile.locationData) {
      optimizations.push({
        type: 'local-impact',
        title: 'Boost Local Community',
        description: 'Connect with neighbors and local opportunities',
        impact: 'Medium',
        effort: 'Low',
        action: 'explore-neighbourhood'
      });
    }

    return optimizations;
  }

  // Gamified engagement strategy
  generateEngagementStrategy() {
    return {
      currentLevel: this.calculateUserLevel(),
      nextMilestone: this.getNextMilestone(),
      achievementOpportunities: this.getAchievementOpportunities(),
      socialChallenges: this.getSocialChallenges(),
      impactChallenges: this.getImpactChallenges(),
      rewardRecommendations: this.getRewardRecommendations()
    };
  }

  // Job recommendations based on AI analysis
  generateJobRecommendations() {
    const recommendations = {
      perfectMatches: [],
      skillBuilding: [],
      impactFocused: [],
      nearbyOpportunities: []
    };

    // Use skills and interests for matching
    const userSkills = Array.from(this.userProfile.skillsIndex);
    const userInterests = Array.from(this.userProfile.interestsIndex);

    recommendations.algorithm = {
      skillWeight: 0.4,
      locationWeight: 0.2,
      impactWeight: 0.3,
      growthWeight: 0.1
    };

    return recommendations;
  }

  // Calculate user's overall impact level (0-100)
  calculateImpactLevel(impactData) {
    let score = 0;
    
    // Profile completeness (0-25 points)
    const profileCompleteness = this.userProfile.profiles.length / 7 * 25;
    score += profileCompleteness;

    // Activity level (0-25 points)
    const activityScore = Math.min(this.behaviorData.activityScore / 10 * 25, 25);
    score += activityScore;

    // Verification status (0-20 points)
    if (this.userProfile.verificationLevel === 'verified') {
      score += 20;
    } else if (this.userProfile.verificationLevel === 'pending') {
      score += 10;
    }

    // Social connections (0-15 points)
    const connectionScore = Math.min((impactData.connections || 0) / 20 * 15, 15);
    score += connectionScore;

    // Transaction impact (0-15 points)
    const transactionScore = Math.min((impactData.transactions || 0) / 10 * 15, 15);
    score += transactionScore;

    return Math.round(score);
  }

  // Helper methods
  async getRecentActivity(collection_name, field, userId, since) {
    try {
      const q = query(
        collection(db, collection_name),
        where(field, field === 'participants' ? 'array-contains' : '==', userId),
        where('createdAt', '>=', since),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching ${collection_name}:`, error);
      return [];
    }
  }

  calculateActivityScore(listings, applications, transactions) {
    return (listings.length * 3) + (applications.length * 2) + (transactions.length * 5);
  }

  extractPreferredCategories(listings, searches) {
    const categories = {};
    
    listings.forEach(listing => {
      if (listing.category) {
        categories[listing.category] = (categories[listing.category] || 0) + 3;
      }
    });

    searches.forEach(search => {
      if (search.category) {
        categories[search.category] = (categories[search.category] || 0) + 1;
      }
    });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);
  }

  async getUserImpactData(userId) {
    // This would typically aggregate from multiple collections
    return {
      connections: 0,
      transactions: 0,
      jobsCreated: 0,
      jobsFound: 0,
      communityContributions: 0,
      livesChangedScore: 0
    };
  }

  getDefaultPersonalization() {
    return {
      contentStrategy: {
        language: 'en',
        teReoIntegration: 'bilingual',
        contentPriority: ['getting-started', 'community', 'marketplace', 'jobs'],
        featuredSections: ['welcome-tour', 'profile-setup', 'community-impact']
      },
      uiCustomizations: {
        theme: 'light',
        layout: 'standard',
        navigationStyle: 'horizontal'
      },
      recommendationEngine: {
        jobRecommendations: { perfectMatches: [], algorithm: { skillWeight: 0.4 } },
        impactOpportunities: []
      }
    };
  }

  getDefaultPreferences() {
    return {
      language: 'en',
      teReoLevel: 'bilingual',
      notificationSettings: {},
      privacyLevel: 'balanced',
      impactFocus: 'community',
      accessibilityNeeds: {},
      personalizedRecommendations: true
    };
  }

  // Update user personalization data
  async updatePersonalizationData(userId, data) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        lastPersonalizationUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating personalization data:', error);
    }
  }
  // Helper methods for community analysis
  calculateNetworkStrength(supportNetwork) {
    if (!supportNetwork || supportNetwork.length === 0) return 0;
    
    const weightsByType = {
      family: 3,
      friend: 2,
      community: 2,
      professional: 1
    };
    
    const totalWeight = supportNetwork.reduce((sum, connection) => {
      const weight = weightsByType[connection.type] || 1;
      const strengthMultiplier = connection.strength || 1; // 1-5 scale
      return sum + (weight * strengthMultiplier);
    }, 0);
    
    return Math.min(100, Math.round((totalWeight / supportNetwork.length) * 10));
  }
  
  assessIsolationRisk(supportNetwork, neighbourhoods) {
    let riskScore = 0;
    
    // Low support network increases risk
    if (!supportNetwork || supportNetwork.length < 3) riskScore += 30;
    
    // No family connections
    const hasFamily = supportNetwork?.some(conn => conn.type === 'family');
    if (!hasFamily) riskScore += 20;
    
    // No community involvement
    if (!neighbourhoods || neighbourhoods.length === 0) riskScore += 25;
    
    // Recent isolation indicators
    const recentConnections = supportNetwork?.filter(conn => {
      const lastContact = new Date(conn.lastContact);
      const daysSince = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    
    if (!recentConnections || recentConnections.length < 2) riskScore += 25;
    
    return Math.min(100, riskScore);
  }
  
  determineCommunityRole(mentoringRelationships, neighbourhoods) {
    if (mentoringRelationships?.length > 0) {
      return mentoringRelationships.length >= 3 ? 'community_leader' : 'mentor';
    }
    
    if (neighbourhoods?.some(n => n.role === 'admin' || n.role === 'moderator')) {
      return 'neighbourhood_leader';
    }
    
    if (neighbourhoods?.length > 1) {
      return 'active_member';
    }
    
    if (neighbourhoods?.length === 1) {
      return 'member';
    }
    
    return 'newcomer';
  }
  
  getDefaultLifeChangingMetrics() {
    return {
      livesDirectlyChanged: 0,
      childrenHelped: 0,
      jobsCreated: 0,
      familiesSupported: 0,
      economicImpact: 0,
      prioritizesSocialImpact: false,
      helpsInCrisis: false,
      mentoringActivity: 0,
      communityLeadership: 0,
      impactAchievements: [],
      communityBadges: [],
      trustLevel: { level: 'new' },
      personalGoals: [],
      familyGoals: [],
      communityGoals: [],
      emergencyNeeds: []
    };
  }
  
  getDefaultCommunityConnections() {
    return {
      neighbourhoods: [],
      mentoringRelationships: [],
      supportNetwork: [],
      networkStrength: 0,
      isolationRisk: 50,
      communityRole: 'newcomer'
    };
  }

  // Generate AI-powered recommendations for life-changing opportunities
  async generateLifeChangingRecommendations(userId) {
    try {
      if (!this.lifeChangingMetrics || !this.communityConnections) {
        await this.initializePersonalization(userId);
      }
      
      const recommendations = {
        immediateOpportunities: [],
        skillDevelopment: [],
        communitySupport: [],
        emergencyAssistance: [],
        mentoringOpportunities: []
      };
      
      // Immediate life-changing opportunities
      if (this.lifeChangingMetrics.emergencyNeeds.length > 0) {
        recommendations.immediateOpportunities = await this.findEmergencySupport(userId);
      }
      
      // Skills that could transform their situation
      if (this.userProfile?.skillsIndex?.size < 3) {
        recommendations.skillDevelopment = await this.findSkillDevelopmentOpportunities(userId);
      }
      
      // Community connections for isolated users
      if (this.communityConnections.isolationRisk > 60) {
        recommendations.communitySupport = await this.findCommunityConnections(userId);
      }
      
      // Mentoring opportunities
      if (this.communityConnections.communityRole !== 'newcomer') {
        recommendations.mentoringOpportunities = await this.findMentoringOpportunities(userId);
      }
      
      return {
        ...recommendations,
        priorityLevel: this.calculateRecommendationPriority(recommendations),
        impactPotential: this.estimateImpactPotential(recommendations)
      };
    } catch (error) {
      console.error('Error generating life-changing recommendations:', error);
      return this.getDefaultRecommendations();
    }
  }
  
  calculateRecommendationPriority(recommendations) {
    if (recommendations.emergencyAssistance?.length > 0) return 'urgent';
    if (recommendations.immediateOpportunities?.length > 0) return 'high';
    if (recommendations.communitySupport?.length > 0) return 'medium';
    return 'low';
  }
  
  estimateImpactPotential(recommendations) {
    const totalOpportunities = Object.values(recommendations).flat().length;
    if (totalOpportunities >= 10) return 'transformative';
    if (totalOpportunities >= 5) return 'significant';
    if (totalOpportunities >= 2) return 'moderate';
    return 'minimal';
  }
  
  getDefaultRecommendations() {
    return {
      immediateOpportunities: [],
      skillDevelopment: [],
      communitySupport: [],
      emergencyAssistance: [],
      mentoringOpportunities: [],
      priorityLevel: 'low',
      impactPotential: 'minimal'
    };
  }
}

// Export singleton instance
const aiPersonalizationEngine = new AIPersonalizationEngine();

export default aiPersonalizationEngine;

// Export specific functions for direct use
export const {
  initializePersonalization,
  generateJobRecommendations,
  generateImpactOptimization,
  calculateImpactLevel
} = aiPersonalizationEngine;