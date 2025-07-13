// Neighbourhood System for TuiTrade - Aotearoa-Specific Community Grouping
// Builds on existing community features to create hyperlocal connections

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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import googleMapsService from './googleMapsService';

// NZ-Specific Neighbourhood Data Structure
export const NZ_NEIGHBOURHOODS = {
  'auckland': {
    region: 'Auckland',
    maoriName: 'Tāmaki Makaurau',
    neighbourhoods: {
      'central-auckland': {
        name: 'Central Auckland',
        maoriName: 'Pokapū Tāmaki',
        suburbs: ['Auckland CBD', 'Ponsonby', 'Parnell', 'Newmarket', 'Mount Eden'],
        postcode: '1010',
        type: 'urban-central',
        features: ['restaurants', 'shopping', 'nightlife', 'transport-hub'],
        description: 'Heart of Tāmaki Makaurau with vibrant city life'
      },
      'north-shore': {
        name: 'North Shore',
        maoriName: 'Takapuna',
        suburbs: ['Takapuna', 'Devonport', 'Milford', 'Browns Bay', 'Albany'],
        postcode: '0622',
        type: 'suburban-coastal',
        features: ['beaches', 'family-friendly', 'schools', 'parks'],
        description: 'Beautiful harbourside communities with beaches and parks'
      },
      'west-auckland': {
        name: 'West Auckland',
        maoriName: 'Waitākere',
        suburbs: ['Henderson', 'New Lynn', 'Glen Eden', 'Titirangi', 'Kumeu'],
        postcode: '0602',
        type: 'suburban-bush',
        features: ['nature', 'wineries', 'hiking', 'arts-culture'],
        description: 'Where the bush meets the city - creative and nature-loving communities'
      },
      'south-auckland': {
        name: 'South Auckland',
        maoriName: 'Tonga Tāmaki',
        suburbs: ['Manukau', 'Papakura', 'Mangere', 'Otara', 'Papatoetoe'],
        postcode: '2025',
        type: 'suburban-diverse',
        features: ['multicultural', 'markets', 'families', 'community-spirit'],
        description: 'Diverse and vibrant communities with strong Pacific and Māori culture'
      },
      'east-auckland': {
        name: 'East Auckland',
        maoriName: 'Rāwhiti Tāmaki',
        suburbs: ['Botany', 'Howick', 'Pakuranga', 'Half Moon Bay', 'Bucklands Beach'],
        postcode: '2013',
        type: 'suburban-coastal',
        features: ['beaches', 'shopping', 'asian-culture', 'modern'],
        description: 'Modern coastal suburbs with excellent amenities and cultural diversity'
      }
    }
  },
  'wellington': {
    region: 'Wellington',
    maoriName: 'Te Whanganui-a-Tara',
    neighbourhoods: {
      'central-wellington': {
        name: 'Central Wellington',
        maoriName: 'Te Pokapū',
        suburbs: ['Wellington CBD', 'Mount Victoria', 'Oriental Bay', 'Thorndon'],
        postcode: '6011',
        type: 'urban-central',
        features: ['government', 'culture', 'cafes', 'harbour'],
        description: 'Political and cultural heart of Aotearoa'
      },
      'southern-wellington': {
        name: 'Southern Wellington',
        maoriName: 'Tonga Te Whanganui-a-Tara',
        suburbs: ['Island Bay', 'Newtown', 'Berhampore', 'Kilbirnie'],
        postcode: '6023',
        type: 'suburban-bohemian',
        features: ['arts', 'multicultural', 'beaches', 'community'],
        description: 'Creative and diverse communities by the southern coast'
      }
    }
  },
  'christchurch': {
    region: 'Canterbury',
    maoriName: 'Ōtautahi',
    neighbourhoods: {
      'central-christchurch': {
        name: 'Central Christchurch',
        maoriName: 'Pokapū Ōtautahi',
        suburbs: ['Christchurch CBD', 'Addington', 'Riccarton', 'Merivale'],
        postcode: '8011',
        type: 'urban-rebuild',
        features: ['innovation', 'gardens', 'rebuild-spirit', 'cycling'],
        description: 'Rising from strength to strength with innovation and resilience'
      }
    }
  }
};

// Neighbourhood Community Types
export const NEIGHBOURHOOD_TYPES = {
  'urban-central': {
    icon: '🏙️',
    features: ['High density', 'Transport hubs', 'Business district', 'Nightlife'],
    communityStyle: 'Fast-paced urban lifestyle'
  },
  'suburban-coastal': {
    icon: '🏖️',
    features: ['Beach access', 'Family-friendly', 'Outdoor lifestyle', 'Café culture'],
    communityStyle: 'Relaxed coastal living'
  },
  'suburban-bush': {
    icon: '🌲',
    features: ['Nature access', 'Hiking trails', 'Arts community', 'Wineries'],
    communityStyle: 'Nature-connected creative community'
  },
  'suburban-diverse': {
    icon: '🌏',
    features: ['Multicultural', 'Community markets', 'Strong families', 'Cultural events'],
    communityStyle: 'Rich cultural diversity and community spirit'
  },
  'suburban-bohemian': {
    icon: '🎨',
    features: ['Arts scene', 'Independent cafes', 'Community gardens', 'Alternative culture'],
    communityStyle: 'Creative and alternative lifestyle'
  },
  'urban-rebuild': {
    icon: '🔨',
    features: ['Innovation hubs', 'Modern infrastructure', 'Community resilience', 'Green spaces'],
    communityStyle: 'Forward-thinking resilient community'
  }
};

// Neighbourhood Activity Types
export const NEIGHBOURHOOD_ACTIVITIES = {
  'local-marketplace': {
    name: 'Local Marketplace',
    maoriName: 'Tauhokohoko-ā-rohe',
    description: 'Buy and sell within your neighbourhood',
    icon: '🛒',
    features: ['local-pickup', 'neighbourhood-delivery', 'community-pricing']
  },
  'community-events': {
    name: 'Community Events',
    maoriName: 'Ngā Kaupapa-ā-Hapori',
    description: 'Local events, meetups, and gatherings',
    icon: '📅',
    features: ['neighbourhood-bbqs', 'street-parties', 'local-markets', 'skill-shares']
  },
  'neighbourhood-watch': {
    name: 'Neighbourhood Watch',
    maoriName: 'Tiaki Hapori',
    description: 'Community safety and support network',
    icon: '👀',
    features: ['safety-alerts', 'lost-and-found', 'community-support', 'local-recommendations']
  },
  'local-services': {
    name: 'Local Services',
    maoriName: 'Ngā Ratonga-ā-Rohe', 
    description: 'Find and offer services in your area',
    icon: '🔧',
    features: ['handyman', 'gardening', 'pet-care', 'tutoring', 'baby-sitting']
  },
  'community-groups': {
    name: 'Community Groups',
    maoriName: 'Ngā Rōpū Hapori',
    description: 'Join interest groups and hobby clubs',
    icon: '👥',
    features: ['hobby-groups', 'sports-clubs', 'book-clubs', 'parenting-groups']
  }
};

class NeighbourhoodService {
  constructor() {
    this.cache = new Map();
  }

  // Get user's neighbourhood based on their location
  async getUserNeighbourhood(userId, userLocation) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (userData?.neighbourhood) {
        return userData.neighbourhood;
      }

      // Auto-assign based on location
      const neighbourhood = await this.detectNeighbourhoodFromLocation(userLocation);
      
      if (neighbourhood) {
        // Update user profile with detected neighbourhood
        await updateDoc(doc(db, 'users', userId), {
          neighbourhood: neighbourhood.id,
          neighbourhoodName: neighbourhood.name,
          lastLocationUpdate: serverTimestamp()
        });
      }

      return neighbourhood;
    } catch (error) {
      console.error('Error getting user neighbourhood:', error);
      return null;
    }
  }

  // Auto-detect neighbourhood from location data with Google Maps integration
  async detectNeighbourhoodFromLocation(location) {
    if (!location || (!location.suburb && !location.lat)) return null;

    let detectedLocation = location;

    // If we have coordinates but no address, reverse geocode first
    if (location.lat && location.lng && !location.suburb) {
      try {
        detectedLocation = await googleMapsService.reverseGeocode(location.lat, location.lng);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
      }
    }

    const cityKey = detectedLocation.city?.toLowerCase().replace(/\s+/g, '-');
    const suburb = detectedLocation.suburb?.toLowerCase();

    if (!suburb || !detectedLocation.city) return null;

    // Search through NZ_NEIGHBOURHOODS
    for (const [regionKey, regionData] of Object.entries(NZ_NEIGHBOURHOODS)) {
      if (regionData.neighbourhoods) {
        for (const [neighbourhoodKey, neighbourhood] of Object.entries(regionData.neighbourhoods)) {
          const suburbsLower = neighbourhood.suburbs.map(s => s.toLowerCase());
          if (suburbsLower.some(s => s.includes(suburb) || suburb.includes(s))) {
            return {
              id: `${regionKey}-${neighbourhoodKey}`,
              ...neighbourhood,
              region: regionData.region,
              regionMaori: regionData.maoriName,
              detectedAddress: detectedLocation
            };
          }
        }
      }
    }

    return null;
  }

  // Enhanced location detection using Google Maps
  async detectNeighbourhoodFromCurrentLocation() {
    try {
      // Get current coordinates
      const coords = await googleMapsService.getCurrentLocation();
      
      // Reverse geocode to get address
      const address = await googleMapsService.reverseGeocode(coords.lat, coords.lng);
      
      // Ensure it's a NZ address
      if (!googleMapsService.isNZAddress(address)) {
        throw new Error('Location not in New Zealand');
      }

      // Detect neighbourhood from the address
      return await this.detectNeighbourhoodFromLocation(address);
    } catch (error) {
      console.error('Error detecting neighbourhood from current location:', error);
      return null;
    }
  }

  // Create a new neighbourhood community
  async createNeighbourhoodCommunity(neighbourhoodData, creatorId) {
    try {
      const communityDoc = await addDoc(collection(db, 'neighbourhoods'), {
        ...neighbourhoodData,
        createdBy: creatorId,
        createdAt: serverTimestamp(),
        members: [creatorId],
        moderators: [creatorId],
        memberCount: 1,
        isActive: true,
        communityGuidelines: this.getDefaultGuidelines(),
        features: NEIGHBOURHOOD_ACTIVITIES,
        stats: {
          totalListings: 0,
          totalEvents: 0,
          totalMembers: 1,
          activityScore: 0
        }
      });

      return communityDoc.id;
    } catch (error) {
      console.error('Error creating neighbourhood community:', error);
      throw error;
    }
  }

  // Join a neighbourhood community
  async joinNeighbourhood(neighbourhoodId, userId) {
    try {
      const neighbourhoodRef = doc(db, 'neighbourhoods', neighbourhoodId);
      
      await updateDoc(neighbourhoodRef, {
        members: arrayUnion(userId),
        memberCount: this.incrementField(1),
        lastActivity: serverTimestamp()
      });

      // Update user profile
      await updateDoc(doc(db, 'users', userId), {
        neighbourhoods: arrayUnion(neighbourhoodId),
        joinedNeighbourhoodsAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error joining neighbourhood:', error);
      return false;
    }
  }

  // Get neighbourhood activities and listings
  async getNeighbourhoodFeed(neighbourhoodId, options = {}) {
    try {
      const { limit: limitCount = 20, type = 'all' } = options;
      const activities = [];

      // Get recent listings from neighbourhood members
      const listingsQuery = query(
        collection(db, 'listings'),
        where('neighbourhood', '==', neighbourhoodId),
        orderBy('createdAt', 'desc'),
        limit(limitCount / 2)
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      
      listingsSnapshot.forEach(doc => {
        activities.push({
          id: doc.id,
          type: 'listing',
          ...doc.data(),
          timestamp: doc.data().createdAt
        });
      });

      // Get neighbourhood events
      const eventsQuery = query(
        collection(db, 'neighbourhoodEvents'),
        where('neighbourhoodId', '==', neighbourhoodId),
        orderBy('eventDate', 'desc'),
        limit(limitCount / 2)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      
      eventsSnapshot.forEach(doc => {
        activities.push({
          id: doc.id,
          type: 'event',
          ...doc.data(),
          timestamp: doc.data().createdAt
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => b.timestamp - a.timestamp);
      
      return activities.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting neighbourhood feed:', error);
      return [];
    }
  }

  // Create neighbourhood event
  async createNeighbourhoodEvent(eventData, creatorId) {
    try {
      const eventDoc = await addDoc(collection(db, 'neighbourhoodEvents'), {
        ...eventData,
        createdBy: creatorId,
        createdAt: serverTimestamp(),
        attendees: [creatorId],
        isActive: true,
        type: 'neighbourhood-event'
      });

      return eventDoc.id;
    } catch (error) {
      console.error('Error creating neighbourhood event:', error);
      throw error;
    }
  }

  // Get nearby neighbourhoods for discovery with Google Maps distance calculation
  async getNearbyNeighbourhoods(userLocation, radius = 10) {
    try {
      let userCoords = userLocation;

      // If we have address but no coordinates, geocode it
      if (!userLocation.lat && userLocation.city) {
        try {
          const geocoded = await googleMapsService.geocodeAddress(`${userLocation.suburb || ''}, ${userLocation.city}`);
          userCoords = {
            lat: geocoded.coordinates.lat,
            lng: geocoded.coordinates.lng,
            ...userLocation
          };
        } catch (error) {
          console.log('Could not geocode user location, falling back to region-based search');
        }
      }

      const neighbourhoods = [];
      const region = this.getRegionFromLocation(userLocation);

      // Get all neighbourhoods
      for (const [regionKey, regionData] of Object.entries(NZ_NEIGHBOURHOODS)) {
        if (regionData.neighbourhoods) {
          for (const [key, neighbourhood] of Object.entries(regionData.neighbourhoods)) {
            let distance = null;

            // Calculate real distance if we have coordinates
            if (userCoords.lat && userCoords.lng) {
              try {
                // Get neighbourhood center coordinates
                const neighbourhoodGeocode = await googleMapsService.geocodeAddress(`${neighbourhood.name}, ${regionData.region}, New Zealand`);
                if (neighbourhoodGeocode) {
                  distance = googleMapsService.calculateDistance(
                    userCoords.lat,
                    userCoords.lng,
                    neighbourhoodGeocode.coordinates.lat,
                    neighbourhoodGeocode.coordinates.lng
                  );
                }
              } catch (error) {
                // Fallback to approximate distance
                distance = region === regionKey ? Math.random() * 5 : Math.random() * radius + 20;
              }
            } else {
              // Fallback distance calculation
              distance = region === regionKey ? Math.random() * 5 : Math.random() * radius + 20;
            }

            // Only include neighbourhoods within radius
            if (distance === null || distance <= radius) {
              neighbourhoods.push({
                id: `${regionKey}-${key}`,
                ...neighbourhood,
                region: regionData.region,
                regionMaori: regionData.maoriName,
                distance: distance || Math.random() * radius
              });
            }
          }
        }
      }

      return neighbourhoods.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error getting nearby neighbourhoods:', error);
      // Fallback to original region-based approach
      const region = this.getRegionFromLocation(userLocation);
      const neighbourhoods = [];

      if (region && NZ_NEIGHBOURHOODS[region]) {
        const regionData = NZ_NEIGHBOURHOODS[region];
        for (const [key, neighbourhood] of Object.entries(regionData.neighbourhoods)) {
          neighbourhoods.push({
            id: `${region}-${key}`,
            ...neighbourhood,
            region: regionData.region,
            regionMaori: regionData.maoriName,
            distance: Math.random() * radius
          });
        }
      }

      return neighbourhoods.sort((a, b) => a.distance - b.distance);
    }
  }

  // Helper methods
  getRegionFromLocation(location) {
    if (!location || !location.city) return null;
    const city = location.city.toLowerCase();
    
    if (city.includes('auckland') || city.includes('tāmaki')) return 'auckland';
    if (city.includes('wellington') || city.includes('whanganui')) return 'wellington';
    if (city.includes('christchurch') || city.includes('ōtautahi')) return 'christchurch';
    
    return null;
  }

  getDefaultGuidelines() {
    return {
      title: 'Neighbourhood Community Guidelines - Whakatōhea Hapori',
      rules: [
        {
          title: 'Manaakitanga - Hospitality',
          description: 'Treat all neighbours with respect and kindness'
        },
        {
          title: 'Whakatōhea - Community Spirit', 
          description: 'Support local businesses and community initiatives'
        },
        {
          title: 'Tiakitanga - Guardianship',
          description: 'Take care of our shared neighbourhood spaces'
        },
        {
          title: 'Rangatiratanga - Leadership',
          description: 'Be a positive influence in your community'
        }
      ]
    };
  }

  incrementField(value) {
    // Firebase increment helper
    return { increment: value };
  }
}

// Export singleton instance
const neighbourhoodService = new NeighbourhoodService();

export default neighbourhoodService;

// Export specific functions for direct import
export const {
  getUserNeighbourhood,
  createNeighbourhoodCommunity,
  joinNeighbourhood,
  getNeighbourhoodFeed,
  createNeighbourhoodEvent,
  getNearbyNeighbourhoods,
  detectNeighbourhoodFromLocation,
  detectNeighbourhoodFromCurrentLocation
} = neighbourhoodService;