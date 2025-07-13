// Neighbourhood Dropdown Component - Consistent neighbourhood selection across TuiTrade
// Integrates with Google Maps for location detection and provides consistent UI

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  ChevronDown, 
  Loader2, 
  Check, 
  AlertCircle,
  Navigation,
  RefreshCw
} from 'lucide-react';
import googleMapsService from '../../lib/googleMapsService';
import neighbourhoodService, { NZ_NEIGHBOURHOODS } from '../../lib/neighbourhoodSystem';

const NeighbourhoodDropdown = ({
  value = '',
  onChange,
  placeholder = 'Select your neighbourhood...',
  label = 'Neighbourhood',
  required = false,
  showCurrentLocation = true,
  showSearch = true,
  className = '',
  size = 'default', // 'small', 'default', 'large'
  variant = 'default', // 'default', 'minimal', 'bordered'
  error = null,
  disabled = false,
  onLocationDetected = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [filteredNeighbourhoods, setFilteredNeighbourhoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState(null);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    default: 'px-4 py-3 text-base',
    large: 'px-5 py-4 text-lg'
  };

  // Variant classes
  const variantClasses = {
    default: 'border border-gray-300 rounded-lg bg-white',
    minimal: 'border-0 border-b-2 border-gray-200 rounded-none bg-transparent',
    bordered: 'border-2 border-gray-300 rounded-xl bg-white'
  };

  // Load neighbourhoods from static data and user's saved neighbourhoods
  const loadNeighbourhoods = useCallback(async () => {
    try {
      const allNeighbourhoods = [];

      // Convert static neighbourhood data to dropdown format
      Object.entries(NZ_NEIGHBOURHOODS).forEach(([regionKey, regionData]) => {
        if (regionData.neighbourhoods) {
          Object.entries(regionData.neighbourhoods).forEach(([nhKey, neighbourhood]) => {
            allNeighbourhoods.push({
              id: `${regionKey}-${nhKey}`,
              name: neighbourhood.name,
              maoriName: neighbourhood.maoriName,
              region: regionData.region,
              regionMaori: regionData.maoriName,
              suburbs: neighbourhood.suburbs,
              type: neighbourhood.type,
              postcode: neighbourhood.postcode,
              isStatic: true
            });
          });
        }
      });

      // Sort by region, then by name
      allNeighbourhoods.sort((a, b) => {
        if (a.region !== b.region) {
          return a.region.localeCompare(b.region);
        }
        return a.name.localeCompare(b.name);
      });

      setNeighbourhoods(allNeighbourhoods);
      setFilteredNeighbourhoods(allNeighbourhoods);
    } catch (error) {
      console.error('Error loading neighbourhoods:', error);
    }
  }, []);

  // Detect user's current location
  const detectCurrentLocation = useCallback(async () => {
    if (!showCurrentLocation) return;

    setLoading(true);
    try {
      // Get current coordinates
      const coords = await googleMapsService.getCurrentLocation();
      
      // Reverse geocode to get address
      const address = await googleMapsService.reverseGeocode(coords.lat, coords.lng);
      
      if (googleMapsService.isNZAddress(address)) {
        setCurrentLocation(address);
        
        // Try to match with existing neighbourhood
        const matchedNeighbourhood = neighbourhoodService.detectNeighbourhoodFromLocation({
          city: address.city,
          suburb: address.suburb
        });

        if (matchedNeighbourhood) {
          const neighbourhood = neighbourhoods.find(n => n.id === matchedNeighbourhood.id);
          if (neighbourhood) {
            setSelectedNeighbourhood(neighbourhood);
            onChange(neighbourhood);
            setLocationDetected(true);
            
            if (onLocationDetected) {
              onLocationDetected(neighbourhood, address);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error detecting location:', error);
    } finally {
      setLoading(false);
    }
  }, [neighbourhoods, onChange, onLocationDetected, showCurrentLocation]);

  // Load all neighbourhoods on component mount
  useEffect(() => {
    loadNeighbourhoods();
  }, [loadNeighbourhoods]);

  // Initialize Google Maps
  useEffect(() => {
    googleMapsService.initializeGoogleMaps();
  }, []);

  // Filter neighbourhoods based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNeighbourhoods(neighbourhoods);
      return;
    }

    const filtered = neighbourhoods.filter(neighbourhood => 
      neighbourhood.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      neighbourhood.maoriName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      neighbourhood.suburbs?.some(suburb => 
        suburb.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      neighbourhood.region.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredNeighbourhoods(filtered);
  }, [searchQuery, neighbourhoods]);

  // Set initial selected neighbourhood based on value prop
  useEffect(() => {
    if (value && neighbourhoods.length > 0) {
      const found = neighbourhoods.find(n => n.id === value || n.name === value);
      setSelectedNeighbourhood(found);
    }
  }, [value, neighbourhoods]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle neighbourhood selection
  const handleSelect = (neighbourhood) => {
    setSelectedNeighbourhood(neighbourhood);
    onChange(neighbourhood);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Group neighbourhoods by region for better organization
  const groupedNeighbourhoods = filteredNeighbourhoods.reduce((groups, neighbourhood) => {
    const region = neighbourhood.region;
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(neighbourhood);
    return groups;
  }, {});

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Main Input */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-2 focus:ring-green-500 focus:border-transparent'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
            transition-colors
          `}
        >
          <div className="flex items-center flex-1">
            <MapPin className="text-gray-400 mr-2 flex-shrink-0" size={16} />
            <span className={`truncate ${selectedNeighbourhood ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedNeighbourhood ? (
                <span>
                  {selectedNeighbourhood.name}
                  {selectedNeighbourhood.maoriName && (
                    <span className="text-green-600 ml-1">({selectedNeighbourhood.maoriName})</span>
                  )}
                  <span className="text-gray-500 text-sm ml-2">{selectedNeighbourhood.region}</span>
                </span>
              ) : placeholder}
            </span>
          </div>
          
          <div className="flex items-center ml-2">
            {loading && <Loader2 className="animate-spin text-gray-400 mr-2" size={16} />}
            {locationDetected && <Check className="text-green-500 mr-2" size={16} />}
            <ChevronDown 
              className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              size={16} 
            />
          </div>
        </button>

        {/* Current Location Button */}
        {showCurrentLocation && !disabled && (
          <button
            type="button"
            onClick={detectCurrentLocation}
            disabled={loading}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 p-1"
            title="Detect current location"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Navigation size={16} />
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-1 flex items-center text-red-600 text-sm">
          <AlertCircle size={14} className="mr-1" />
          {error}
        </div>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden"
          >
            {/* Search Input */}
            {showSearch && (
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search neighbourhoods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Neighbourhood List */}
            <div className="max-h-60 overflow-y-auto">
              {Object.keys(groupedNeighbourhoods).length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <AlertCircle className="mx-auto mb-2" size={24} />
                  <p>No neighbourhoods found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              ) : (
                Object.entries(groupedNeighbourhoods).map(([region, regionNeighbourhoods]) => (
                  <div key={region}>
                    {/* Region Header */}
                    <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 border-t border-gray-100">
                      {region}
                    </div>
                    
                    {/* Neighbourhoods in Region */}
                    {regionNeighbourhoods.map((neighbourhood) => (
                      <button
                        key={neighbourhood.id}
                        onClick={() => handleSelect(neighbourhood)}
                        className={`
                          w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0
                          ${selectedNeighbourhood?.id === neighbourhood.id ? 'bg-green-100 text-green-900' : 'text-gray-900'}
                          transition-colors
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{neighbourhood.name}</div>
                            {neighbourhood.maoriName && (
                              <div className="text-sm text-green-600">{neighbourhood.maoriName}</div>
                            )}
                            {neighbourhood.suburbs && (
                              <div className="text-xs text-gray-500 mt-1">
                                {neighbourhood.suburbs.slice(0, 3).join(', ')}
                                {neighbourhood.suburbs.length > 3 && ` +${neighbourhood.suburbs.length - 3} more`}
                              </div>
                            )}
                          </div>
                          {selectedNeighbourhood?.id === neighbourhood.id && (
                            <Check className="text-green-600 ml-2 flex-shrink-0" size={16} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Refresh Button */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={loadNeighbourhoods}
                className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-green-600 transition-colors"
              >
                <RefreshCw size={14} className="mr-2" />
                Refresh neighbourhoods
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeighbourhoodDropdown;