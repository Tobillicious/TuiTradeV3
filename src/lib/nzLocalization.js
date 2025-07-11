// New Zealand Localization Features for TuiTrade
// Comprehensive NZ-specific functionality

// New Zealand regions and territorial authorities
export const NZ_REGIONS = {
    northland: {
        name: 'Northland',
        code: 'NTL',
        cities: ['Whangarei', 'Kerikeri', 'Kaitaia', 'Dargaville', 'Paihia', 'Russell']
    },
    auckland: {
        name: 'Auckland',
        code: 'AUK',
        cities: ['Auckland Central', 'North Shore', 'Waitakere', 'Manukau', 'Papakura', 'Franklin'],
        suburbs: {
            central: ['CBD', 'Ponsonby', 'Parnell', 'Newmarket', 'Mount Eden', 'Grey Lynn', 'Kingsland'],
            northShore: ['Takapuna', 'Milford', 'Devonport', 'Albany', 'Glenfield', 'Browns Bay'],
            west: ['Henderson', 'New Lynn', 'Glen Eden', 'Titirangi', 'Kumeu'],
            south: ['Manukau', 'Botany', 'Howick', 'Pakuranga', 'Papakura', 'Pukekohe'],
            east: ['Panmure', 'Glen Innes', 'Point England', 'Tamaki']
        }
    },
    waikato: {
        name: 'Waikato',
        code: 'WKO',
        cities: ['Hamilton', 'Cambridge', 'Te Awamutu', 'Morrinsville', 'Matamata', 'Huntly']
    },
    bayOfPlenty: {
        name: 'Bay of Plenty',
        code: 'BOP',
        cities: ['Tauranga', 'Rotorua', 'Whakatane', 'Mount Maunganui', 'Te Puke', 'Katikati']
    },
    gisborne: {
        name: 'Gisborne',
        code: 'GIS',
        cities: ['Gisborne', 'Ruatoria']
    },
    hawkesBay: {
        name: "Hawke's Bay",
        code: 'HKB',
        cities: ['Napier', 'Hastings', 'Havelock North', 'Waipawa', 'Waipukurau']
    },
    taranaki: {
        name: 'Taranaki',
        code: 'TKI',
        cities: ['New Plymouth', 'Hawera', 'Stratford', 'Waitara']
    },
    manawatuWhanganui: {
        name: 'Manawatū-Whanganui',
        code: 'MWT',
        cities: ['Palmerston North', 'Whanganui', 'Levin', 'Feilding', 'Marton']
    },
    wellington: {
        name: 'Wellington',
        code: 'WGN',
        cities: ['Wellington', 'Lower Hutt', 'Upper Hutt', 'Porirua', 'Paraparaumu'],
        suburbs: {
            wellington: ['Te Aro', 'Thorndon', 'Mount Victoria', 'Oriental Bay', 'Kelburn', 'Karori', 'Miramar'],
            lowerHutt: ['Petone', 'Eastbourne', 'Wainuiomata'],
            porirua: ['Titahi Bay', 'Whitby', 'Plimmerton']
        }
    },
    tasman: {
        name: 'Tasman',
        code: 'TAS',
        cities: ['Richmond', 'Motueka', 'Takaka', 'Golden Bay']
    },
    nelson: {
        name: 'Nelson',
        code: 'NSN',
        cities: ['Nelson']
    },
    marlborough: {
        name: 'Marlborough',
        code: 'MBH',
        cities: ['Blenheim', 'Picton', 'Renwick']
    },
    westCoast: {
        name: 'West Coast',
        code: 'WTC',
        cities: ['Greymouth', 'Westport', 'Hokitika', 'Franz Josef', 'Fox Glacier']
    },
    canterbury: {
        name: 'Canterbury',
        code: 'CAN',
        cities: ['Christchurch', 'Timaru', 'Ashburton', 'Rangiora', 'Kaikoura'],
        suburbs: {
            christchurch: ['CBD', 'Riccarton', 'Papanui', 'Fendalton', 'Cashmere', 'New Brighton', 'Sumner', 'Hornby']
        }
    },
    otago: {
        name: 'Otago',
        code: 'OTA',
        cities: ['Dunedin', 'Queenstown', 'Oamaru', 'Alexandra', 'Cromwell', 'Wanaka'],
        suburbs: {
            dunedin: ['CBD', 'North Dunedin', 'South Dunedin', 'Mosgiel', 'Port Chalmers']
        }
    },
    southland: {
        name: 'Southland',
        code: 'STL',
        cities: ['Invercargill', 'Gore', 'Te Anau', 'Stewart Island']
    }
};

// Shipping zones and costs
export const SHIPPING_ZONES = {
    metro: {
        name: 'Metro Areas',
        description: 'Main city centres',
        areas: ['Auckland CBD', 'Wellington CBD', 'Christchurch CBD', 'Hamilton CBD', 'Tauranga CBD', 'Dunedin CBD'],
        baseRate: 5.99,
        expressRate: 12.99,
        timeframe: '1-2 business days'
    },
    urban: {
        name: 'Urban Areas',
        description: 'Suburban areas in main cities',
        areas: ['Auckland Metro', 'Wellington Metro', 'Christchurch Metro', 'Hamilton Metro'],
        baseRate: 7.99,
        expressRate: 15.99,
        timeframe: '2-3 business days'
    },
    regional: {
        name: 'Regional Towns',
        description: 'Regional centres and towns',
        areas: ['Rotorua', 'Napier', 'Hastings', 'New Plymouth', 'Palmerston North', 'Nelson', 'Queenstown'],
        baseRate: 12.99,
        expressRate: 22.99,
        timeframe: '3-5 business days'
    },
    rural: {
        name: 'Rural Areas',
        description: 'Rural and remote areas',
        baseRate: 19.99,
        expressRate: 35.99,
        timeframe: '5-7 business days',
        requiresQuote: true
    },
    islands: {
        name: 'Islands',
        description: 'Waiheke, Great Barrier, Stewart Island',
        areas: ['Waiheke Island', 'Great Barrier Island', 'Stewart Island', 'Chatham Islands'],
        baseRate: 29.99,
        timeframe: '7-10 business days',
        requiresQuote: true,
        restrictions: 'Some items may not be available for delivery'
    }
};

// NZ Address validation and formatting
export const validateNZAddress = (address) => {
    const errors = [];
    
    if (!address.streetAddress || address.streetAddress.trim().length < 5) {
        errors.push('Street address must be at least 5 characters');
    }
    
    if (!address.suburb || address.suburb.trim().length < 2) {
        errors.push('Suburb is required');
    }
    
    if (!address.city || address.city.trim().length < 2) {
        errors.push('City is required');
    }
    
    if (!address.region) {
        errors.push('Region is required');
    }
    
    // NZ postcode validation (4 digits)
    if (address.postcode && !/^\d{4}$/.test(address.postcode)) {
        errors.push('Postcode must be 4 digits');
    }
    
    return errors;
};

export const formatNZAddress = (address) => {
    const parts = [];
    
    if (address.streetAddress) parts.push(address.streetAddress);
    if (address.suburb && address.suburb !== address.city) parts.push(address.suburb);
    if (address.city) {
        const cityPart = address.postcode ? `${address.city} ${address.postcode}` : address.city;
        parts.push(cityPart);
    }
    if (address.region && address.region !== address.city) parts.push(address.region);
    
    return parts.join(', ');
};

// Calculate shipping costs
export const calculateShippingCost = (fromLocation, toLocation, weight = 1, dimensions = null, express = false) => {
    const fromZone = getShippingZone(fromLocation);
    const toZone = getShippingZone(toLocation);
    
    // Base shipping zone (highest tier between from/to)
    const shippingZone = getHighestTierZone(fromZone, toZone);
    const zone = SHIPPING_ZONES[shippingZone];
    
    let baseCost = express ? zone.expressRate : zone.baseRate;
    
    // Weight multiplier (standard rate up to 5kg)
    if (weight > 5) {
        baseCost += Math.ceil((weight - 5) / 5) * 5.00;
    }
    
    // Size surcharge for large items
    if (dimensions && (dimensions.length > 100 || dimensions.width > 60 || dimensions.height > 60)) {
        baseCost += 15.00; // Large item surcharge
    }
    
    // Rural delivery surcharge
    if (shippingZone === 'rural' || shippingZone === 'islands') {
        baseCost += 10.00;
    }
    
    return {
        cost: baseCost,
        zone: zone.name,
        timeframe: zone.timeframe,
        requiresQuote: zone.requiresQuote || false,
        restrictions: zone.restrictions || null
    };
};

const getShippingZone = (location) => {
    const locationLower = location.toLowerCase();
    
    // Check metro areas
    if (SHIPPING_ZONES.metro.areas.some(area => locationLower.includes(area.toLowerCase()))) {
        return 'metro';
    }
    
    // Check urban areas
    if (SHIPPING_ZONES.urban.areas.some(area => locationLower.includes(area.toLowerCase()))) {
        return 'urban';
    }
    
    // Check regional towns
    if (SHIPPING_ZONES.regional.areas.some(area => locationLower.includes(area.toLowerCase()))) {
        return 'regional';
    }
    
    // Check islands
    if (SHIPPING_ZONES.islands.areas.some(area => locationLower.includes(area.toLowerCase()))) {
        return 'islands';
    }
    
    // Default to rural
    return 'rural';
};

const getHighestTierZone = (zone1, zone2) => {
    const tiers = ['metro', 'urban', 'regional', 'rural', 'islands'];
    const index1 = tiers.indexOf(zone1);
    const index2 = tiers.indexOf(zone2);
    return tiers[Math.max(index1, index2)];
};

// Local pickup locations and meeting spots
export const PICKUP_LOCATIONS = {
    auckland: [
        { name: 'Sylvia Park Shopping Centre', address: '286 Mount Wellington Highway, Mount Wellington', type: 'shopping_centre' },
        { name: 'Westfield Albany', address: '219 Don McKinnon Drive, Albany', type: 'shopping_centre' },
        { name: 'Botany Town Centre', address: '588 Chapel Road, Botany Downs', type: 'shopping_centre' },
        { name: 'Auckland CBD - Britomart', address: 'Queen Street, Auckland Central', type: 'transport_hub' },
        { name: 'Newmarket Station', address: 'Broadway, Newmarket', type: 'transport_hub' }
    ],
    wellington: [
        { name: 'Wellington Railway Station', address: 'Bunny Street, Wellington Central', type: 'transport_hub' },
        { name: 'Queensgate Shopping Centre', address: 'Bunny Street, Lower Hutt', type: 'shopping_centre' },
        { name: 'Porirua Mall', address: 'Norrie Street, Porirua', type: 'shopping_centre' },
        { name: 'Coastlands Kapiti', address: 'Kapiti Road, Paraparaumu', type: 'shopping_centre' }
    ],
    christchurch: [
        { name: 'Westfield Riccarton', address: '129 Riccarton Road, Riccarton', type: 'shopping_centre' },
        { name: 'The Palms Shopping Centre', address: '555 New Brighton Road, Shirley', type: 'shopping_centre' },
        { name: 'Christchurch Central Station', address: 'Clarence Street, Addington', type: 'transport_hub' },
        { name: 'Northlands Shopping Centre', address: '55 Main North Road, Papanui', type: 'shopping_centre' }
    ]
};

// Payment methods popular in NZ
export const NZ_PAYMENT_METHODS = {
    bankTransfer: {
        name: 'Bank Transfer',
        description: 'Direct bank transfer (most popular in NZ)',
        fee: 0,
        processingTime: '1-2 business days',
        icon: '🏦'
    },
    payNow: {
        name: 'PayNow / Instant Payment',
        description: 'Instant bank transfer',
        fee: 0.50,
        processingTime: 'Instant',
        icon: '⚡'
    },
    afterpay: {
        name: 'Afterpay',
        description: 'Buy now, pay later in 4 installments',
        fee: 0, // Merchant pays
        processingTime: 'Instant',
        icon: '💳',
        maxAmount: 2000
    },
    cash: {
        name: 'Cash (Pickup Only)',
        description: 'Cash payment for local pickup',
        fee: 0,
        processingTime: 'Instant',
        icon: '💵',
        pickupOnly: true
    },
    stripe: {
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        fee: 2.9, // Percentage
        processingTime: 'Instant',
        icon: '💳'
    }
};

// TradeMe-inspired trust and safety features
export const SAFETY_FEATURES = {
    verificationLevels: {
        email: { name: 'Email Verified', icon: '📧', points: 10 },
        phone: { name: 'Phone Verified', icon: '📱', points: 20 },
        address: { name: 'Address Verified', icon: '🏠', points: 30 },
        identification: { name: 'ID Verified', icon: '🆔', points: 50 },
        bankAccount: { name: 'Bank Account Verified', icon: '🏦', points: 40 }
    },
    
    feedbackSystem: {
        ratings: ['positive', 'neutral', 'negative'],
        categories: ['communication', 'itemDescription', 'deliverySpeed', 'packaging'],
        trustScore: {
            excellent: { min: 98, label: 'Excellent', color: 'green' },
            good: { min: 95, label: 'Good', color: 'blue' },
            average: { min: 90, label: 'Average', color: 'yellow' },
            poor: { min: 0, label: 'Poor', color: 'red' }
        }
    },
    
    protectionPolicies: {
        buyerProtection: {
            name: 'Buyer Protection',
            coverage: 'Up to $2,000 per transaction',
            conditions: ['Item not received', 'Item significantly different', 'Item damaged in transit']
        },
        escrowService: {
            name: 'Secure Payment Holding',
            description: 'Payment held until buyer confirms receipt',
            fee: '2.9% of transaction value',
            maxAmount: 10000
        }
    }
};

// Business hours and contact preferences (NZ timezone)
export const NZ_BUSINESS_INFO = {
    timezone: 'Pacific/Auckland',
    businessHours: {
        weekdays: { open: '08:00', close: '17:00' },
        saturday: { open: '09:00', close: '16:00' },
        sunday: { open: '10:00', close: '15:00' }
    },
    publicHolidays: [
        'New Year\'s Day', 'Day after New Year\'s Day', 'Waitangi Day',
        'Good Friday', 'Easter Monday', 'ANZAC Day', 'King\'s Birthday',
        'Matariki', 'Labour Day', 'Christmas Day', 'Boxing Day'
    ],
    supportContact: {
        phone: '0800 TUITRADE',
        email: 'support@tuitrade.co.nz',
        hours: 'Monday-Friday 8am-6pm, Saturday 9am-4pm'
    }
};

// Currency formatting for NZ
export const formatNZCurrency = (amount) => {
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
};

// Distance calculation between NZ locations
export const calculateDistance = (location1, location2) => {
    // Simplified distance calculation for shipping estimates
    // In a real app, you'd use Google Maps API or similar
    const distances = {
        'auckland-wellington': 644,
        'auckland-christchurch': 1082,
        'wellington-christchurch': 483,
        'auckland-dunedin': 1366,
        'wellington-dunedin': 883,
        'christchurch-dunedin': 358
    };
    
    const key = `${location1.toLowerCase()}-${location2.toLowerCase()}`;
    const reverseKey = `${location2.toLowerCase()}-${location1.toLowerCase()}`;
    
    return distances[key] || distances[reverseKey] || 500; // Default 500km
};

export default {
    NZ_REGIONS,
    SHIPPING_ZONES,
    PICKUP_LOCATIONS,
    NZ_PAYMENT_METHODS,
    SAFETY_FEATURES,
    NZ_BUSINESS_INFO,
    validateNZAddress,
    formatNZAddress,
    calculateShippingCost,
    formatNZCurrency,
    calculateDistance
};