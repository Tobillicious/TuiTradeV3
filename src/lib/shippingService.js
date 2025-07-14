// =============================================
// shippingService.js - NZ Shipping Logic & Integration
// ----------------------------------------------------
// Provides helpers for calculating shipping costs, integrating with NZ Post API,
// and managing shipping options for listings and orders.
// =============================================

import { NZ_REGIONS, SHIPPING_ZONES } from './nzLocalization';

// NZ Post API Configuration
const NZ_POST_API_BASE = 'https://api.nzpost.co.nz';
const NZ_POST_API_KEY = process.env.REACT_APP_NZ_POST_API_KEY;

// Shipping Services Available
export const SHIPPING_SERVICES = {
    STANDARD: 'standard',
    EXPRESS: 'express',
    OVERNIGHT: 'overnight',
    RURAL: 'rural',
    INTERNATIONAL: 'international',
    COURIER: 'courier',
    PICKUP: 'pickup'
};

// Shipping Providers
export const SHIPPING_PROVIDERS = {
    NZ_POST: 'nz_post',
    COURIER_POST: 'courier_post',
    FASTWAY: 'fastway',
    ARAMEX: 'aramex',
    DHL: 'dhl',
    FEDEX: 'fedex'
};

// Package Types
export const PACKAGE_TYPES = {
    ENVELOPE: 'envelope',
    SMALL_BOX: 'small_box',
    MEDIUM_BOX: 'medium_box',
    LARGE_BOX: 'large_box',
    CUSTOM: 'custom'
};

// Predefined package dimensions (in cm)
export const PACKAGE_DIMENSIONS = {
    [PACKAGE_TYPES.ENVELOPE]: { length: 35, width: 25, height: 2, maxWeight: 0.5 },
    [PACKAGE_TYPES.SMALL_BOX]: { length: 20, width: 15, height: 10, maxWeight: 5 },
    [PACKAGE_TYPES.MEDIUM_BOX]: { length: 35, width: 25, height: 15, maxWeight: 10 },
    [PACKAGE_TYPES.LARGE_BOX]: { length: 50, width: 35, height: 25, maxWeight: 25 }
};

// Shipping zones and base rates
export const SHIPPING_RATES = {
    [SHIPPING_ZONES.METRO_AUCKLAND]: {
        [SHIPPING_SERVICES.STANDARD]: { base: 5.99, perKg: 2.50 },
        [SHIPPING_SERVICES.EXPRESS]: { base: 9.99, perKg: 3.50 },
        [SHIPPING_SERVICES.OVERNIGHT]: { base: 15.99, perKg: 5.00 },
        [SHIPPING_SERVICES.COURIER]: { base: 12.99, perKg: 4.00 }
    },
    [SHIPPING_ZONES.METRO_WELLINGTON]: {
        [SHIPPING_SERVICES.STANDARD]: { base: 6.99, perKg: 2.75 },
        [SHIPPING_SERVICES.EXPRESS]: { base: 10.99, perKg: 3.75 },
        [SHIPPING_SERVICES.OVERNIGHT]: { base: 16.99, perKg: 5.25 },
        [SHIPPING_SERVICES.COURIER]: { base: 13.99, perKg: 4.25 }
    },
    [SHIPPING_ZONES.METRO_CHRISTCHURCH]: {
        [SHIPPING_SERVICES.STANDARD]: { base: 6.99, perKg: 2.75 },
        [SHIPPING_SERVICES.EXPRESS]: { base: 10.99, perKg: 3.75 },
        [SHIPPING_SERVICES.OVERNIGHT]: { base: 16.99, perKg: 5.25 },
        [SHIPPING_SERVICES.COURIER]: { base: 13.99, perKg: 4.25 }
    },
    [SHIPPING_ZONES.NORTH_ISLAND]: {
        [SHIPPING_SERVICES.STANDARD]: { base: 8.99, perKg: 3.25 },
        [SHIPPING_SERVICES.EXPRESS]: { base: 13.99, perKg: 4.50 },
        [SHIPPING_SERVICES.OVERNIGHT]: { base: 19.99, perKg: 6.00 },
        [SHIPPING_SERVICES.COURIER]: { base: 15.99, perKg: 5.00 }
    },
    [SHIPPING_ZONES.SOUTH_ISLAND]: {
        [SHIPPING_SERVICES.STANDARD]: { base: 10.99, perKg: 3.75 },
        [SHIPPING_SERVICES.EXPRESS]: { base: 15.99, perKg: 5.00 },
        [SHIPPING_SERVICES.OVERNIGHT]: { base: 22.99, perKg: 7.00 },
        [SHIPPING_SERVICES.COURIER]: { base: 17.99, perKg: 5.50 }
    },
    [SHIPPING_ZONES.RURAL]: {
        [SHIPPING_SERVICES.STANDARD]: { base: 12.99, perKg: 4.25 },
        [SHIPPING_SERVICES.EXPRESS]: { base: 18.99, perKg: 5.75 },
        [SHIPPING_SERVICES.RURAL]: { base: 15.99, perKg: 5.00 }
    }
};

// Delivery timeframes
export const DELIVERY_TIMEFRAMES = {
    [SHIPPING_SERVICES.STANDARD]: '2-5 business days',
    [SHIPPING_SERVICES.EXPRESS]: '1-2 business days',
    [SHIPPING_SERVICES.OVERNIGHT]: 'Next business day',
    [SHIPPING_SERVICES.COURIER]: '1-3 business days',
    [SHIPPING_SERVICES.RURAL]: '3-7 business days',
    [SHIPPING_SERVICES.PICKUP]: 'Arranged with seller'
};

// Main shipping calculation function
export const calculateShipping = (origin, destination, packageDetails, options = {}) => {
    const { weight = 1, dimensions = null, service = SHIPPING_SERVICES.STANDARD, express = false } = options;

    // Determine shipping zone
    const zone = determineShippingZone(origin, destination);

    // Get base rates for the zone
    const zoneRates = SHIPPING_RATES[zone];
    if (!zoneRates) {
        return {
            error: 'Shipping not available to this location',
            requiresQuote: true
        };
    }

    // Select service
    const selectedService = express ? SHIPPING_SERVICES.EXPRESS : service;
    const serviceRates = zoneRates[selectedService];

    if (!serviceRates) {
        return {
            error: 'Selected shipping service not available',
            requiresQuote: true
        };
    }

    // Calculate cost
    const baseCost = serviceRates.base;
    const weightCost = Math.max(0, weight - 1) * serviceRates.perKg; // First kg included in base
    const dimensionalWeight = dimensions ? calculateDimensionalWeight(dimensions) : 0;
    const actualWeight = Math.max(weight, dimensionalWeight);
    const adjustedWeightCost = Math.max(0, actualWeight - 1) * serviceRates.perKg;

    const totalCost = baseCost + adjustedWeightCost;

    // Apply surcharges
    const surcharges = calculateSurcharges(zone, selectedService, packageDetails);
    const finalCost = totalCost + surcharges.total;

    return {
        cost: Math.round(finalCost * 100) / 100,
        service: selectedService,
        zone,
        timeframe: DELIVERY_TIMEFRAMES[selectedService],
        weight: actualWeight,
        surcharges: surcharges.breakdown,
        tracking: generateTrackingNumber(),
        requiresQuote: false
    };
};

// Determine shipping zone based on origin and destination
export const determineShippingZone = (origin, destination) => {
    const originRegion = extractRegion(origin);
    const destinationRegion = extractRegion(destination);

    // Metro zones
    if (isMetroArea(destinationRegion, 'Auckland')) {
        return SHIPPING_ZONES.METRO_AUCKLAND;
    }
    if (isMetroArea(destinationRegion, 'Wellington')) {
        return SHIPPING_ZONES.METRO_WELLINGTON;
    }
    if (isMetroArea(destinationRegion, 'Christchurch')) {
        return SHIPPING_ZONES.METRO_CHRISTCHURCH;
    }

    // Island zones
    if (isNorthIsland(destinationRegion)) {
        return SHIPPING_ZONES.NORTH_ISLAND;
    }
    if (isSouthIsland(destinationRegion)) {
        return SHIPPING_ZONES.SOUTH_ISLAND;
    }

    // Rural/remote
    return SHIPPING_ZONES.RURAL;
};

// Extract region from location string
const extractRegion = (location) => {
    if (!location) return null;

    const locationLower = location.toLowerCase();

    // Check for specific regions
    for (const [key, region] of Object.entries(NZ_REGIONS)) {
        if (locationLower.includes(region.name.toLowerCase())) {
            return region;
        }
    }

    return null;
};

// Check if location is in metro area
const isMetroArea = (region, city) => {
    if (!region) return false;

    const metroAreas = {
        'Auckland': ['Auckland', 'North Shore', 'Waitakere', 'Manukau'],
        'Wellington': ['Wellington', 'Lower Hutt', 'Upper Hutt', 'Porirua'],
        'Christchurch': ['Christchurch', 'Riccarton', 'Papanui']
    };

    const metros = metroAreas[city];
    return metros && metros.some(metro =>
        region.name.toLowerCase().includes(metro.toLowerCase())
    );
};

// Check if region is North Island
const isNorthIsland = (region) => {
    if (!region) return false;

    const northIslandRegions = [
        'Northland', 'Auckland', 'Waikato', 'Bay of Plenty', 'Gisborne',
        'Hawke\'s Bay', 'Taranaki', 'Manawatū-Whanganui', 'Wellington'
    ];

    return northIslandRegions.includes(region.name);
};

// Check if region is South Island
const isSouthIsland = (region) => {
    if (!region) return false;

    const southIslandRegions = [
        'Tasman', 'Nelson', 'Marlborough', 'West Coast', 'Canterbury',
        'Timaru', 'Otago', 'Southland'
    ];

    return southIslandRegions.includes(region.name);
};

// Calculate dimensional weight (for large, light packages)
const calculateDimensionalWeight = (dimensions) => {
    const { length, width, height } = dimensions;
    // NZ Post dimensional weight factor: L x W x H (cm) / 5000
    return (length * width * height) / 5000;
};

// Calculate surcharges
const calculateSurcharges = (zone, service, packageDetails) => {
    const surcharges = {
        breakdown: [],
        total: 0
    };

    // Rural delivery surcharge
    if (zone === SHIPPING_ZONES.RURAL) {
        surcharges.breakdown.push({
            type: 'Rural Delivery',
            amount: 3.50,
            description: 'Additional fee for rural delivery'
        });
        surcharges.total += 3.50;
    }

    // Oversized package surcharge
    if (packageDetails && isOversized(packageDetails)) {
        surcharges.breakdown.push({
            type: 'Oversized Package',
            amount: 5.00,
            description: 'Additional fee for oversized packages'
        });
        surcharges.total += 5.00;
    }

    // Fragile item surcharge
    if (packageDetails && packageDetails.fragile) {
        surcharges.breakdown.push({
            type: 'Fragile Handling',
            amount: 2.50,
            description: 'Special handling for fragile items'
        });
        surcharges.total += 2.50;
    }

    // Signature required surcharge
    if (packageDetails && packageDetails.signatureRequired) {
        surcharges.breakdown.push({
            type: 'Signature Required',
            amount: 2.00,
            description: 'Signature required on delivery'
        });
        surcharges.total += 2.00;
    }

    return surcharges;
};

// Check if package is oversized
const isOversized = (packageDetails) => {
    const { length = 0, width = 0, height = 0, weight = 0 } = packageDetails;

    // Standard size limits
    const maxLength = 105;
    const maxWidth = 105;
    const maxHeight = 105;
    const maxWeight = 25;

    return length > maxLength || width > maxWidth || height > maxHeight || weight > maxWeight;
};

// Generate tracking number
const generateTrackingNumber = () => {
    const prefix = 'TT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
};

// Get available shipping services for a route
export const getAvailableServices = (origin, destination, packageDetails = {}) => {
    const zone = determineShippingZone(origin, destination);
    const zoneRates = SHIPPING_RATES[zone];

    if (!zoneRates) {
        return [];
    }

    return Object.keys(zoneRates).map(service => ({
        service,
        name: formatServiceName(service),
        timeframe: DELIVERY_TIMEFRAMES[service],
        cost: calculateShipping(origin, destination, packageDetails, { service }).cost
    }));
};

// Format service name for display
const formatServiceName = (service) => {
    const names = {
        [SHIPPING_SERVICES.STANDARD]: 'Standard Post',
        [SHIPPING_SERVICES.EXPRESS]: 'Express Post',
        [SHIPPING_SERVICES.OVERNIGHT]: 'Overnight Express',
        [SHIPPING_SERVICES.COURIER]: 'Courier',
        [SHIPPING_SERVICES.RURAL]: 'Rural Delivery',
        [SHIPPING_SERVICES.PICKUP]: 'Local Pickup'
    };

    return names[service] || service;
};

// Create shipping label
export const createShippingLabel = async (shipmentDetails) => {
    try {
        const response = await fetch(`${NZ_POST_API_BASE}/shipping/labels`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NZ_POST_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(shipmentDetails)
        });

        if (!response.ok) {
            throw new Error('Failed to create shipping label');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating shipping label:', error);
        throw error;
    }
};

// Track shipment
export const trackShipment = async (trackingNumber) => {
    try {
        const response = await fetch(`${NZ_POST_API_BASE}/tracking/${trackingNumber}`, {
            headers: {
                'Authorization': `Bearer ${NZ_POST_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to track shipment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error tracking shipment:', error);
        throw error;
    }
};

// Get pickup locations
export const getPickupLocations = async (postcode) => {
    try {
        const response = await fetch(`${NZ_POST_API_BASE}/locations/pickup?postcode=${postcode}`, {
            headers: {
                'Authorization': `Bearer ${NZ_POST_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get pickup locations');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting pickup locations:', error);
        throw error;
    }
};

// Validate address
export const validateAddress = async (address) => {
    try {
        const response = await fetch(`${NZ_POST_API_BASE}/address/validate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NZ_POST_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(address)
        });

        if (!response.ok) {
            throw new Error('Failed to validate address');
        }

        return await response.json();
    } catch (error) {
        console.error('Error validating address:', error);
        throw error;
    }
};

// Format shipping cost for display
export const formatShippingCost = (cost) => {
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 2
    }).format(cost);
};

// Export main functions
export default {
    calculateShipping,
    determineShippingZone,
    getAvailableServices,
    createShippingLabel,
    trackShipment,
    getPickupLocations,
    validateAddress,
    formatShippingCost,
    SHIPPING_SERVICES,
    SHIPPING_PROVIDERS,
    PACKAGE_TYPES,
    PACKAGE_DIMENSIONS,
    DELIVERY_TIMEFRAMES
};