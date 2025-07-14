// Comprehensive Multi-Profile System for TuiTrade
// Supports Professional, Personal, Community, Marketplace, and Employment profiles
// with relationship-based privacy controls

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
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Profile Types and their characteristics
export const PROFILE_TYPES = {
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional Profile',
    description: 'Public professional profile visible to everyone',
    visibility: 'public',
    searchable: true,
    seoEnabled: true,
    fields: ['jobTitle', 'company', 'skills', 'experience', 'education', 'certifications', 'portfolio', 'linkedIn']
  },
  PERSONAL: {
    id: 'personal',
    name: 'Personal Profile',
    description: 'Personal profile visible to friends and connections',
    visibility: 'friends',
    searchable: 'optional', // Can enable SEO
    seoEnabled: false,
    fields: ['bio', 'interests', 'hobbies', 'photos', 'location', 'socialLinks']
  },
  INNER_CIRCLE: {
    id: 'innerCircle',
    name: 'Inner Circle',
    description: 'Private profile for close friends only',
    visibility: 'innerCircle',
    searchable: false,
    seoEnabled: false,
    fields: ['personalStories', 'privatePhotos', 'familyInfo', 'personalThoughts']
  },
  MARKETPLACE: {
    id: 'marketplace',
    name: 'Marketplace Profile',
    description: 'Buying and selling reputation and history',
    visibility: 'marketplace',
    searchable: true,
    seoEnabled: false,
    fields: ['sellerRating', 'buyerRating', 'transactionHistory', 'specialties', 'policies']
  },
  COMMUNITY: {
    id: 'community',
    name: 'Community Profile',
    description: 'Local neighbourhood and community engagement',
    visibility: 'community',
    searchable: true,
    seoEnabled: false,
    fields: ['neighbourhoodRole', 'communityContributions', 'localEvents', 'neighbourhoodRating']
  },
  JOB_HUNTER: {
    id: 'jobHunter',
    name: 'Job Hunter Profile',
    description: 'Career-focused profile for job seeking',
    visibility: 'employers',
    searchable: true,
    seoEnabled: true,
    fields: ['resume', 'careerGoals', 'salary', 'availability', 'references', 'workSamples']
  },
  EMPLOYER: {
    id: 'employer',
    name: 'Employer Profile',
    description: 'Company profile for hiring and recruitment',
    visibility: 'public',
    searchable: true,
    seoEnabled: true,
    fields: ['companyInfo', 'culture', 'benefits', 'openPositions', 'companySize', 'industry']
  }
};

// Relationship levels for privacy control
export const RELATIONSHIP_LEVELS = {
  PUBLIC: {
    id: 'public',
    name: 'Public',
    description: 'Anyone can see',
    priority: 0
  },
  ACQUAINTANCE: {
    id: 'acquaintance',
    name: 'Acquaintance',
    description: 'People you\'ve interacted with',
    priority: 1
  },
  NEIGHBOUR: {
    id: 'neighbour',
    name: 'Neighbour',
    description: 'People in your local community',
    priority: 2
  },
  BUSINESS_CONTACT: {
    id: 'businessContact',
    name: 'Business Contact',
    description: 'Professional connections',
    priority: 2
  },
  FRIEND: {
    id: 'friend',
    name: 'Friend',
    description: 'People you trust and interact with regularly',
    priority: 3
  },
  INNER_CIRCLE: {
    id: 'innerCircle',
    name: 'Inner Circle',
    description: 'Close friends and family',
    priority: 4
  },
  PRIVATE: {
    id: 'private',
    name: 'Private',
    description: 'Only you can see',
    priority: 5
  }
};

// Account types
export const ACCOUNT_TYPES = {
  INDIVIDUAL: {
    id: 'individual',
    name: 'Individual',
    profiles: ['professional', 'personal', 'innerCircle', 'marketplace', 'community', 'jobHunter'],
    maxProfiles: 6
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    profiles: ['employer', 'marketplace', 'community'],
    maxProfiles: 3,
    verificationRequired: true
  }
};

class ProfileSystem {
  constructor() {
    this.cache = new Map();
  }

  // Create a new profile for a user
  async createProfile(userId, profileType, profileData) {
    try {
      if (!PROFILE_TYPES[profileType.toUpperCase()]) {
        throw new Error('Invalid profile type');
      }

      const profile = {
        userId,
        profileType: profileType.toLowerCase(),
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        privacy: {
          visibility: PROFILE_TYPES[profileType.toUpperCase()].visibility,
          searchable: PROFILE_TYPES[profileType.toUpperCase()].searchable,
          seoEnabled: PROFILE_TYPES[profileType.toUpperCase()].seoEnabled
        }
      };

      const docRef = await addDoc(collection(db, 'profiles'), profile);
      
      // Update user's profile list
      await this.updateUserProfileList(userId, docRef.id, profileType);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  // Get a specific profile with privacy checks
  async getProfile(profileId, viewerId = null) {
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', profileId));
      if (!profileDoc.exists()) {
        return null;
      }

      const profile = profileDoc.data();
      
      // Check if viewer has permission to see this profile
      const canView = await this.checkProfileVisibility(profile, viewerId);
      if (!canView) {
        return this.getFilteredProfile(profile);
      }

      return { id: profileDoc.id, ...profile };
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  // Get all profiles for a user
  async getUserProfiles(userId, viewerId = null) {
    try {
      const profilesQuery = query(
        collection(db, 'profiles'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('profileType')
      );
      
      const profilesSnapshot = await getDocs(profilesQuery);
      const profiles = [];

      for (const doc of profilesSnapshot.docs) {
        const profile = doc.data();
        const canView = await this.checkProfileVisibility(profile, viewerId);
        
        if (canView) {
          profiles.push({ id: doc.id, ...profile });
        } else {
          const filtered = this.getFilteredProfile(profile);
          if (filtered) {
            profiles.push({ id: doc.id, ...filtered });
          }
        }
      }

      return profiles;
    } catch (error) {
      console.error('Error getting user profiles:', error);
      return [];
    }
  }

  // Check if viewer can see a profile based on relationship and privacy settings
  async checkProfileVisibility(profile, viewerId) {
    if (!viewerId || profile.userId === viewerId) {
      return true; // Owner can always see their own profiles
    }

    const visibility = profile.privacy?.visibility || 'public';

    switch (visibility) {
      case 'public':
        return true;
      
      case 'friends':
        return await this.checkRelationship(profile.userId, viewerId, ['friend', 'innerCircle']);
      
      case 'innerCircle':
        return await this.checkRelationship(profile.userId, viewerId, ['innerCircle']);
      
      case 'marketplace':
        return await this.checkMarketplaceInteraction(profile.userId, viewerId);
      
      case 'community':
        return await this.checkCommunityConnection(profile.userId, viewerId);
      
      case 'employers':
        return await this.checkEmployerAccess(viewerId);
      
      default:
        return false;
    }
  }

  // Get a filtered version of profile for public/limited viewing
  getFilteredProfile(profile) {
    const profileType = PROFILE_TYPES[profile.profileType?.toUpperCase()];
    if (!profileType || !profileType.searchable) {
      return null;
    }

    // Return basic public information only
    return {
      profileType: profile.profileType,
      displayName: profile.displayName,
      avatar: profile.avatar,
      tagline: profile.tagline,
      location: profile.location?.city,
      publicInfo: profile.publicInfo || {}
    };
  }

  // Check relationship between two users
  async checkRelationship(userId, viewerId, requiredLevels) {
    try {
      const relationshipDoc = await getDoc(doc(db, 'relationships', `${userId}_${viewerId}`));
      if (!relationshipDoc.exists()) {
        return false;
      }

      const relationship = relationshipDoc.data();
      return requiredLevels.includes(relationship.level);
    } catch (error) {
      console.error('Error checking relationship:', error);
      return false;
    }
  }

  // Check if users have marketplace interactions
  async checkMarketplaceInteraction(userId, viewerId) {
    try {
      // Check if they've had any transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('participants', 'array-contains-any', [userId, viewerId]),
        limit(1)
      );
      
      const snapshot = await getDocs(transactionsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking marketplace interaction:', error);
      return false;
    }
  }

  // Check if users are in the same community
  async checkCommunityConnection(userId, viewerId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const viewerDoc = await getDoc(doc(db, 'users', viewerId));
      
      const userNeighbourhood = userDoc.data()?.neighbourhood;
      const viewerNeighbourhood = viewerDoc.data()?.neighbourhood;
      
      return userNeighbourhood && viewerNeighbourhood && userNeighbourhood === viewerNeighbourhood;
    } catch (error) {
      console.error('Error checking community connection:', error);
      return false;
    }
  }

  // Check if viewer has employer access
  async checkEmployerAccess(viewerId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', viewerId));
      const userData = userDoc.data();
      
      return userData?.accountType === 'business' || userData?.isEmployer === true;
    } catch (error) {
      console.error('Error checking employer access:', error);
      return false;
    }
  }

  // Update user's profile list
  async updateUserProfileList(userId, profileId, profileType) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`profiles.${profileType}`]: profileId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile list:', error);
    }
  }

  // Create or update relationship between users
  async updateRelationship(userId1, userId2, level, initiatedBy) {
    try {
      const relationshipId = `${userId1}_${userId2}`;
      const reverseRelationshipId = `${userId2}_${userId1}`;
      
      const relationshipData = {
        users: [userId1, userId2],
        level,
        initiatedBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      // Create both directions for easier querying
      await setDoc(doc(db, 'relationships', relationshipId), relationshipData);
      await setDoc(doc(db, 'relationships', reverseRelationshipId), relationshipData);
      
      return true;
    } catch (error) {
      console.error('Error updating relationship:', error);
      return false;
    }
  }

  // Search profiles with privacy respect
  async searchProfiles(searchTerm, searchType = 'all', viewerId = null) {
    try {
      let profilesQuery;
      
      if (searchType === 'all') {
        profilesQuery = query(
          collection(db, 'profiles'),
          where('isActive', '==', true),
          orderBy('displayName')
        );
      } else {
        profilesQuery = query(
          collection(db, 'profiles'),
          where('profileType', '==', searchType),
          where('isActive', '==', true),
          orderBy('displayName')
        );
      }

      const snapshot = await getDocs(profilesQuery);
      const results = [];

      for (const doc of snapshot.docs) {
        const profile = doc.data();
        
        // Simple text matching (you'd want to use a proper search service in production)
        const matchesSearch = profile.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             profile.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             profile.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

        if (matchesSearch) {
          const canView = await this.checkProfileVisibility(profile, viewerId);
          if (canView) {
            results.push({ id: doc.id, ...profile });
          } else {
            const filtered = this.getFilteredProfile(profile);
            if (filtered) {
              results.push({ id: doc.id, ...filtered });
            }
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }
}

// Export singleton instance
const profileSystem = new ProfileSystem();

export default profileSystem;

// Export specific functions for direct import
export const {
  createProfile,
  getProfile,
  getUserProfiles,
  updateRelationship,
  searchProfiles
} = profileSystem;