// New Zealand Address Form Component
// Handles NZ-specific address formats, regions, and validation

import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Navigation, Truck, Calculator, Info } from 'lucide-react';
import { NZ_REGIONS, SHIPPING_ZONES, validateNZAddress, formatNZAddress, calculateShippingCost } from '../../lib/nzLocalization';

const NZAddressForm = ({ 
    address = {}, 
    onAddressChange, 
    showShippingCalculator = false,
    fromLocation = null,
    itemDetails = null,
    required = true,
    mode = 'full' // 'full', 'delivery', 'pickup'
}) => {
    const [formData, setFormData] = useState({
        streetAddress: '',
        suburb: '',
        city: '',
        region: '',
        postcode: '',
        country: 'New Zealand',
        addressType: 'residential', // residential, business, pobox
        deliveryInstructions: '',
        ...address
    });
    
    const [errors, setErrors] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const [shippingCost, setShippingCost] = useState(null);

    // Get cities for selected region
    const citiesForRegion = useMemo(() => {
        if (!formData.region) return [];
        const regionData = Object.values(NZ_REGIONS).find(r => r.name === formData.region);
        return regionData?.cities || [];
    }, [formData.region]);

    // Get suburbs for selected city (where available)
    const suburbsForCity = useMemo(() => {
        if (!formData.region || !formData.city) return [];
        const regionData = Object.values(NZ_REGIONS).find(r => r.name === formData.region);
        return regionData?.suburbs?.[formData.city.toLowerCase().replace(/\s+/g, '')] || [];
    }, [formData.region, formData.city]);

    useEffect(() => {
        const validationErrors = validateNZAddress(formData);
        setErrors(validationErrors);
        
        if (onAddressChange) {
            onAddressChange({
                ...formData,
                isValid: validationErrors.length === 0,
                formatted: formatNZAddress(formData)
            });
        }
    }, [formData, onAddressChange]);

    // Calculate shipping cost when address changes
    useEffect(() => {
        if (showShippingCalculator && fromLocation && formData.city && formData.region) {
            const destination = `${formData.city}, ${formData.region}`;
            const cost = calculateShippingCost(
                fromLocation,
                destination,
                itemDetails?.weight || 1,
                itemDetails?.dimensions,
                itemDetails?.express || false
            );
            setShippingCost(cost);
        }
    }, [showShippingCalculator, fromLocation, formData.city, formData.region, itemDetails]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Auto-clear dependent fields when parent changes
        if (field === 'region') {
            setFormData(prev => ({
                ...prev,
                region: value,
                city: '',
                suburb: ''
            }));
        } else if (field === 'city') {
            setFormData(prev => ({
                ...prev,
                city: value,
                suburb: ''
            }));
        }
    };

    const validatePostcode = async (postcode) => {
        if (!postcode || postcode.length !== 4) return false;
        
        setIsValidating(true);
        
        // Simulate postcode validation API call
        setTimeout(() => {
            const isValid = /^\d{4}$/.test(postcode);
            if (isValid) {
                // In real app, fetch suburb/city suggestions from NZ Post API
                setSuggestions([
                    { suburb: 'Ponsonby', city: 'Auckland', region: 'Auckland' },
                    { suburb: 'Grey Lynn', city: 'Auckland', region: 'Auckland' }
                ]);
            } else {
                setSuggestions([]);
            }
            setIsValidating(false);
        }, 500);
        
        return true;
    };

    const applySuggestion = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            suburb: suggestion.suburb,
            city: suggestion.city,
            region: suggestion.region
        }));
        setSuggestions([]);
    };

    const renderBasicFields = () => (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    placeholder="e.g. 123 Queen Street"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suburb
                    </label>
                    {suburbsForCity.length > 0 ? (
                        <select
                            value={formData.suburb}
                            onChange={(e) => handleInputChange('suburb', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="">Select suburb</option>
                            {suburbsForCity.map(suburb => (
                                <option key={suburb} value={suburb}>{suburb}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={formData.suburb}
                            onChange={(e) => handleInputChange('suburb', e.target.value)}
                            placeholder="e.g. Ponsonby"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.postcode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                handleInputChange('postcode', value);
                                if (value.length === 4) {
                                    validatePostcode(value);
                                }
                            }}
                            placeholder="1010"
                            maxLength={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        {isValidating && (
                            <div className="absolute right-3 top-3">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        City {required && <span className="text-red-500">*</span>}
                    </label>
                    {citiesForRegion.length > 0 ? (
                        <select
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="">Select city</option>
                            {citiesForRegion.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="e.g. Auckland"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region {required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        value={formData.region}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">Select region</option>
                        {Object.values(NZ_REGIONS).map(region => (
                            <option key={region.code} value={region.name}>{region.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </>
    );

    const renderAddressTypeSelector = () => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Type
            </label>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { value: 'residential', label: 'Residential', icon: '🏠' },
                    { value: 'business', label: 'Business', icon: '🏢' },
                    { value: 'pobox', label: 'PO Box', icon: '📮' }
                ].map(type => (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('addressType', type.value)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                            formData.addressType === type.value
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="text-lg mb-1">{type.icon}</div>
                        <div className="text-sm font-medium">{type.label}</div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderDeliveryInstructions = () => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Instructions (Optional)
            </label>
            <textarea
                value={formData.deliveryInstructions}
                onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                placeholder="e.g. Leave at front door, Ring doorbell, Access code: 1234"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
                Help couriers deliver your items safely and efficiently
            </p>
        </div>
    );

    const renderShippingCalculator = () => {
        if (!showShippingCalculator || !shippingCost) return null;

        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                    <Calculator className="mr-2" size={16} />
                    Estimated Shipping Cost
                </h4>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Standard Delivery:</span>
                        <span className="font-medium text-blue-900">${shippingCost.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Shipping Zone:</span>
                        <span className="font-medium text-blue-900">{shippingCost.zone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Estimated Timeframe:</span>
                        <span className="font-medium text-blue-900">{shippingCost.timeframe}</span>
                    </div>
                    {shippingCost.requiresQuote && (
                        <div className="flex items-start text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2">
                            <Info size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                            <span>Final shipping cost may require a custom quote for this location.</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSuggestions = () => {
        if (suggestions.length === 0) return null;

        return (
            <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                <h4 className="text-sm font-medium text-green-800 mb-2">Address Suggestions:</h4>
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => applySuggestion(suggestion)}
                        className="block w-full text-left text-sm text-green-700 hover:text-green-900 py-1"
                    >
                        {suggestion.suburb}, {suggestion.city}, {suggestion.region}
                    </button>
                ))}
            </div>
        );
    };

    const renderErrors = () => {
        if (errors.length === 0) return null;

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Please correct the following errors:
                        </h3>
                        <div className="mt-2">
                            <ul className="list-disc list-inside text-sm text-red-700">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
                <MapPin className="text-green-600" size={20} />
                <h3 className="text-lg font-medium text-gray-900">
                    {mode === 'delivery' ? 'Delivery Address' : 
                     mode === 'pickup' ? 'Pickup Location' : 'Address Details'}
                </h3>
            </div>

            {mode === 'full' && renderAddressTypeSelector()}
            
            {renderBasicFields()}
            
            {mode !== 'pickup' && renderDeliveryInstructions()}
            
            {renderSuggestions()}
            
            {renderShippingCalculator()}
            
            {renderErrors()}

            {/* Address Preview */}
            {formData.streetAddress && formData.city && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Address Preview:</h4>
                    <p className="text-sm text-gray-900">{formatNZAddress(formData)}</p>
                </div>
            )}
        </div>
    );
};

export default NZAddressForm;