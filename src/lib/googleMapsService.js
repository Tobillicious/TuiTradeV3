// Google Maps Integration Service for TuiTrade
// Provides geocoding, location detection, and NZ-specific address validation

import { Loader } from '@googlemaps/js-api-loader';

class GoogleMapsService {
  constructor() {
    this.loader = null;
    this.maps = null;
    this.geocoder = null;
    this.placesService = null;
    this.isLoaded = false;
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  }

  // Initialize Google Maps API
  async initializeGoogleMaps() {
    if (this.isLoaded) return true;

    if (!this.apiKey) {
      console.warn('Google Maps API key not found. Location features will be limited.');
      return false;
    }

    try {
      this.loader = new Loader({
        apiKey: this.apiKey,
        version: 'weekly',
        libraries: ['places', 'geocoding'],
        region: 'NZ', // Bias towards New Zealand
        language: 'en-NZ'
      });

      const google = await this.loader.load();
      this.maps = google.maps;
      this.geocoder = new google.maps.Geocoder();
      this.isLoaded = true;
      
      return true;
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      return false;
    }
  }

  // Get current user location using browser geolocation
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }

  // Reverse geocode coordinates to get NZ address components
  async reverseGeocode(lat, lng) {
    if (!await this.initializeGoogleMaps()) {
      throw new Error('Google Maps not available');
    }

    return new Promise((resolve, reject) => {
      this.geocoder.geocode(
        { 
          location: { lat, lng },
          region: 'NZ',
          componentRestrictions: { country: 'NZ' }
        },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const addressComponents = this.parseNZAddress(results[0]);
            resolve(addressComponents);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  // Forward geocode NZ address to coordinates
  async geocodeAddress(address) {
    if (!await this.initializeGoogleMaps()) {
      throw new Error('Google Maps not available');
    }

    return new Promise((resolve, reject) => {
      this.geocoder.geocode(
        { 
          address: `${address}, New Zealand`,
          region: 'NZ',
          componentRestrictions: { country: 'NZ' }
        },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const addressComponents = this.parseNZAddress(results[0]);
            
            resolve({
              coordinates: {
                lat: location.lat(),
                lng: location.lng()
              },
              address: addressComponents,
              formattedAddress: results[0].formatted_address
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  // Parse Google Maps address components into NZ-specific structure
  parseNZAddress(result) {
    const components = result.address_components;
    const addressData = {
      streetNumber: '',
      streetName: '',
      suburb: '',
      city: '',
      region: '',
      postcode: '',
      country: '',
      formattedAddress: result.formatted_address
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        addressData.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        addressData.streetName = component.long_name;
      }
      if (types.includes('sublocality') || types.includes('locality')) {
        if (!addressData.suburb) {
          addressData.suburb = component.long_name;
        }
      }
      if (types.includes('administrative_area_level_2')) {
        addressData.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        addressData.region = component.long_name;
      }
      if (types.includes('postal_code')) {
        addressData.postcode = component.long_name;
      }
      if (types.includes('country')) {
        addressData.country = component.long_name;
      }
    });

    // Handle cases where suburb and city might be the same
    if (addressData.suburb === addressData.city) {
      addressData.suburb = this.extractSuburbFromFormatted(result.formatted_address, addressData.city);
    }

    return addressData;
  }

  // Extract suburb from formatted address when not clearly separated
  extractSuburbFromFormatted(formattedAddress, city) {
    const parts = formattedAddress.split(',').map(part => part.trim());
    
    // Look for the part that comes before the city
    const cityIndex = parts.findIndex(part => part.includes(city));
    if (cityIndex > 0) {
      return parts[cityIndex - 1];
    }
    
    return city; // Fallback to city if can't determine suburb
  }

  // Get NZ postal code suggestions for autocomplete
  async getPostcodeSuggestions(query) {
    if (!await this.initializeGoogleMaps()) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const service = new this.maps.places.AutocompleteService();
      
      service.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'nz' },
        types: ['postal_code']
      }, (predictions, status) => {
        if (status === this.maps.places.PlacesServiceStatus.OK) {
          resolve(predictions.map(prediction => ({
            postcode: prediction.structured_formatting.main_text,
            description: prediction.description,
            placeId: prediction.place_id
          })));
        } else {
          resolve([]);
        }
      });
    });
  }

  // Get suburb/locality suggestions for autocomplete
  async getSuburbSuggestions(query, region = null) {
    if (!await this.initializeGoogleMaps()) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const service = new this.maps.places.AutocompleteService();
      
      const request = {
        input: query,
        componentRestrictions: { country: 'nz' },
        types: ['(cities)']
      };

      // Add region bias if provided
      if (region) {
        request.input = `${query}, ${region}`;
      }

      service.getPlacePredictions(request, (predictions, status) => {
        if (status === this.maps.places.PlacesServiceStatus.OK) {
          resolve(predictions.map(prediction => ({
            suburb: prediction.structured_formatting.main_text,
            description: prediction.description,
            placeId: prediction.place_id
          })));
        } else {
          resolve([]);
        }
      });
    });
  }

  // Calculate distance between two points (for neighbourhood proximity)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }

  toRad(value) {
    return value * Math.PI / 180;
  }

  // Validate if address is within New Zealand
  isNZAddress(addressComponents) {
    return addressComponents.country === 'New Zealand' || 
           addressComponents.country === 'NZ';
  }

  // Get neighbourhood boundaries (if using Google Maps premium features)
  async getNeighbourhoodBounds(neighbourhoodName, city) {
    if (!await this.initializeGoogleMaps()) {
      throw new Error('Google Maps not available');
    }

    try {
      const geocodeResult = await this.geocodeAddress(`${neighbourhoodName}, ${city}`);
      return {
        center: geocodeResult.coordinates,
        // Default radius of 2km for neighbourhood bounds
        radius: 2000 
      };
    } catch (error) {
      console.error('Error getting neighbourhood bounds:', error);
      return null;
    }
  }
}

// Export singleton instance
const googleMapsService = new GoogleMapsService();

export default googleMapsService;

// Export specific functions for direct import
export const {
  initializeGoogleMaps,
  getCurrentLocation,
  reverseGeocode,
  geocodeAddress,
  getPostcodeSuggestions,
  getSuburbSuggestions,
  calculateDistance,
  isNZAddress,
  getNeighbourhoodBounds
} = googleMapsService;