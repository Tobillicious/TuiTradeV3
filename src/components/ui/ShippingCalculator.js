// =============================================
// ShippingCalculator.js - NZ Shipping Cost Estimator
// --------------------------------------------------
// Provides a UI and logic for calculating real-time shipping costs and options
// for NZ regions, integrating with NZ Post API and category data.
// =============================================

import React, { useState, useEffect, useMemo } from 'react';
import {
    Package, Truck, MapPin, Clock, DollarSign, Calculator,
    Info, AlertCircle, CheckCircle, Navigation, Package2,
    Calendar, Star, Shield, ArrowRight
} from 'lucide-react';
import {
    calculateShipping,
    getAvailableServices,
    formatShippingCost,
    SHIPPING_SERVICES,
    PACKAGE_TYPES,
    PACKAGE_DIMENSIONS,
    DELIVERY_TIMEFRAMES
} from '../../lib/shippingService';
import { NZ_REGIONS } from '../../lib/nzLocalization';

const ShippingCalculator = ({
    item,
    sellerLocation,
    onShippingSelected,
    showFullCalculator = false,
    className = ""
}) => {
    const [buyerLocation, setBuyerLocation] = useState('');
    const [selectedService, setSelectedService] = useState(SHIPPING_SERVICES.STANDARD);
    const [packageType, setPackageType] = useState(PACKAGE_TYPES.SMALL_BOX);
    const [customDimensions, setCustomDimensions] = useState({
        length: '',
        width: '',
        height: '',
        weight: ''
    });
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Get package details based on type
    const getPackageDetails = useMemo(() => {
        if (packageType === PACKAGE_TYPES.CUSTOM) {
            return {
                length: parseFloat(customDimensions.length) || 0,
                width: parseFloat(customDimensions.width) || 0,
                height: parseFloat(customDimensions.height) || 0,
                weight: parseFloat(customDimensions.weight) || 1
            };
        }
        return {
            ...PACKAGE_DIMENSIONS[packageType],
            weight: item?.weight || PACKAGE_DIMENSIONS[packageType].maxWeight / 2
        };
    }, [packageType, customDimensions, item]);

    // Calculate shipping when inputs change
    useEffect(() => {
        if (buyerLocation && sellerLocation) {
            calculateShippingRates();
        }
    }, [buyerLocation, sellerLocation, packageType, customDimensions]);

    const calculateShippingRates = async () => {
        if (!buyerLocation || !sellerLocation) return;

        setIsCalculating(true);
        setError(null);

        try {
            const availableServices = getAvailableServices(
                sellerLocation,
                buyerLocation,
                getPackageDetails
            );

            if (availableServices.length === 0) {
                setError('Shipping not available to this location');
                setShippingOptions([]);
                return;
            }

            setShippingOptions(availableServices);

            // Auto-select the first option if none selected
            if (!selectedOption) {
                setSelectedOption(availableServices[0]);
                onShippingSelected && onShippingSelected(availableServices[0]);
            }

        } catch (err) {
            setError('Failed to calculate shipping rates');
            console.error('Shipping calculation error:', err);
        } finally {
            setIsCalculating(false);
        }
    };

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        onShippingSelected && onShippingSelected(option);
    };

    const handleLocationChange = (location) => {
        setBuyerLocation(location);
        setSelectedOption(null);
        setShippingOptions([]);
    };

    const getServiceIcon = (service) => {
        const icons = {
            [SHIPPING_SERVICES.STANDARD]: Package,
            [SHIPPING_SERVICES.EXPRESS]: Truck,
            [SHIPPING_SERVICES.OVERNIGHT]: Navigation,
            [SHIPPING_SERVICES.COURIER]: Package2,
            [SHIPPING_SERVICES.RURAL]: MapPin
        };
        return icons[service] || Package;
    };

    const getServiceBadge = (service) => {
        const badges = {
            [SHIPPING_SERVICES.EXPRESS]: { text: 'Fast', color: 'bg-blue-100 text-blue-800' },
            [SHIPPING_SERVICES.OVERNIGHT]: { text: 'Fastest', color: 'bg-red-100 text-red-800' },
            [SHIPPING_SERVICES.STANDARD]: { text: 'Economical', color: 'bg-green-100 text-green-800' },
            [SHIPPING_SERVICES.COURIER]: { text: 'Reliable', color: 'bg-purple-100 text-purple-800' }
        };
        return badges[service] || { text: 'Standard', color: 'bg-gray-100 text-gray-800' };
    };

    // Quick shipping estimate (simplified version)
    const renderQuickEstimate = () => (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
                <Calculator className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-medium text-gray-900">Shipping Estimate</h3>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Location
                    </label>
                    <select
                        value={buyerLocation}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">Select your city...</option>
                        {Object.values(NZ_REGIONS).map(region => (
                            <option key={region.code} value={region.name}>
                                {region.name}
                            </option>
                        ))}
                    </select>
                </div>

                {isCalculating && (
                    <div className="flex items-center text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        Calculating rates...
                    </div>
                )}

                {error && (
                    <div className="flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}

                {shippingOptions.length > 0 && (
                    <div className="space-y-2">
                        {shippingOptions.slice(0, 2).map((option, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    <div>
                                        <div className="font-medium text-gray-900">{option.name}</div>
                                        <div className="text-sm text-gray-500">{option.timeframe}</div>
                                    </div>
                                </div>
                                <div className="font-semibold text-green-600">
                                    {formatShippingCost(option.cost)}
                                </div>
                            </div>
                        ))}

                        {shippingOptions.length > 2 && (
                            <button
                                onClick={() => setShowAdvanced(true)}
                                className="w-full text-center text-sm text-green-600 hover:text-green-700 py-2"
                            >
                                View all {shippingOptions.length} options
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // Full calculator with all options
    const renderFullCalculator = () => (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-6">
                <Package className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Shipping Calculator</h2>
            </div>

            <div className="space-y-6">
                {/* Locations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            From (Seller)
                        </label>
                        <input
                            type="text"
                            value={sellerLocation}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Navigation className="w-4 h-4 inline mr-1" />
                            To (Your Location)
                        </label>
                        <select
                            value={buyerLocation}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="">Select destination...</option>
                            {Object.values(NZ_REGIONS).map(region => (
                                <option key={region.code} value={region.name}>
                                    {region.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Package Details */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Package2 className="w-4 h-4 inline mr-1" />
                        Package Size
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(PACKAGE_TYPES).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => setPackageType(value)}
                                className={`p-3 rounded-lg border-2 transition-all ${packageType === value
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-sm font-medium">
                                        {key.split('_').map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                        ).join(' ')}
                                    </div>
                                    {value !== PACKAGE_TYPES.CUSTOM && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {PACKAGE_DIMENSIONS[value].length}×{PACKAGE_DIMENSIONS[value].width}×{PACKAGE_DIMENSIONS[value].height}cm
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Dimensions */}
                {packageType === PACKAGE_TYPES.CUSTOM && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Dimensions
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['length', 'width', 'height', 'weight'].map(field => (
                                <div key={field}>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        {field.charAt(0).toUpperCase() + field.slice(1)} {field === 'weight' ? '(kg)' : '(cm)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={customDimensions[field]}
                                        onChange={(e) => setCustomDimensions({
                                            ...customDimensions,
                                            [field]: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shipping Options */}
                {shippingOptions.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Shipping Options</h3>
                        <div className="space-y-3">
                            {shippingOptions.map((option, index) => {
                                const IconComponent = getServiceIcon(option.service);
                                const badge = getServiceBadge(option.service);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedOption?.service === option.service
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <IconComponent className={`w-5 h-5 ${selectedOption?.service === option.service ? 'text-green-600' : 'text-gray-600'
                                                    }`} />
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-medium text-gray-900">{option.name}</h4>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
                                                            {badge.text}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {option.timeframe}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-green-600">
                                                    {formatShippingCost(option.cost)}
                                                </div>
                                                {selectedOption?.service === option.service && (
                                                    <div className="text-sm text-green-600 mt-1">
                                                        <CheckCircle className="w-4 h-4 inline mr-1" />
                                                        Selected
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isCalculating && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Calculating shipping rates...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className={className}>
            {showFullCalculator || showAdvanced ? renderFullCalculator() : renderQuickEstimate()}
        </div>
    );
};

export default ShippingCalculator;