// Enhanced Motors Landing Page - Comprehensive vehicle marketplace
// Advanced vehicle search, financing tools, inspection services, and dealer network

import React, { useState, useEffect } from 'react';
import { 
  Car, Bike, Ship, Wrench, Search, Filter, MapPin, DollarSign,
  FileText, Award, Shield, Calculator, Eye, Heart, Star, Phone,
  Calendar, Users, Gauge, Fuel, Settings, CheckCircle, Clock,
  TrendingUp, BarChart3, AlertCircle, Info, ChevronRight,
  Image, Video, Download, Share2, Bookmark
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';

// Vehicle categories
const VEHICLE_CATEGORIES = {
  CARS: {
    id: 'cars',
    name: 'Cars',
    icon: Car,
    subcategories: ['Sedan', 'Hatchback', 'SUV', 'Wagon', 'Coupe', 'Convertible', 'Ute'],
    priceRange: [5000, 150000]
  },
  MOTORCYCLES: {
    id: 'motorcycles', 
    name: 'Motorcycles',
    icon: Bike,
    subcategories: ['Sport', 'Touring', 'Cruiser', 'Dirt Bike', 'Scooter', 'Electric'],
    priceRange: [2000, 50000]
  },
  BOATS: {
    id: 'boats',
    name: 'Boats & Marine',
    icon: Ship,
    subcategories: ['Fishing', 'Sailing', 'Jet Ski', 'Yacht', 'Kayak', 'Commercial'],
    priceRange: [3000, 500000]
  },
  PARTS: {
    id: 'parts',
    name: 'Parts & Accessories',
    icon: Wrench,
    subcategories: ['Engine', 'Wheels', 'Electronics', 'Interior', 'Exterior', 'Tools'],
    priceRange: [10, 10000]
  }
};

// Vehicle makes (popular in NZ)
const POPULAR_MAKES = [
  'Toyota', 'Ford', 'Holden', 'Mazda', 'Nissan', 'Honda', 'Subaru', 
  'Mitsubishi', 'Hyundai', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi'
];

// Fuel types
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG'];

// Transmission types  
const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT'];

const EnhancedMotorsLanding = ({ onNavigate }) => {
  const { getText } = useTeReo();
  
  // Search state
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    make: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    location: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    keywords: ''
  });
  
  // Featured vehicles
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // View mode
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    loadFeaturedVehicles();
  }, []);

  const loadFeaturedVehicles = async () => {
    // Mock featured vehicles data
    const mockVehicles = [
      {
        id: 'car1',
        title: '2019 Toyota Camry Hybrid',
        price: 32500,
        year: 2019,
        make: 'Toyota',
        model: 'Camry',
        variant: 'Hybrid',
        odometer: 45000,
        location: 'Auckland',
        fuelType: 'Hybrid',
        transmission: 'Automatic',
        bodyType: 'Sedan',
        features: ['Cruise Control', 'Bluetooth', 'Reverse Camera', 'LED Headlights'],
        images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop'],
        dealer: {
          name: 'Auckland Motors',
          verified: true,
          rating: 4.8,
          reviews: 156
        },
        inspectionReport: true,
        warranty: '12 months'
      },
      {
        id: 'bike1',
        title: '2021 Kawasaki Ninja 650',
        price: 12500,
        year: 2021,
        make: 'Kawasaki',
        model: 'Ninja 650',
        odometer: 8500,
        location: 'Wellington',
        fuelType: 'Petrol',
        transmission: 'Manual',
        bodyType: 'Sport',
        features: ['ABS', 'Traction Control', 'LED Lights', 'Digital Display'],
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
        dealer: {
          name: 'Capital Bikes',
          verified: true,
          rating: 4.9,
          reviews: 89
        },
        inspectionReport: true,
        warranty: '6 months'
      }
    ];
    
    setFeaturedVehicles(mockVehicles);
  };

  const handleSearchSubmit = () => {
    // Navigate to search results with filters
    onNavigate('vehicle-search', { filters: searchFilters });
  };

  const renderQuickSearch = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        <TeReoText english="Find Your Vehicle" teReoKey="findVehicle" />
      </h3>
      
      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.values(VEHICLE_CATEGORIES).map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSearchFilters(prev => ({ ...prev, category: category.id }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                searchFilters.category === category.id
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300 text-gray-700'
              }`}
            >
              <IconComponent size={24} className="mx-auto mb-2" />
              <div className="text-sm font-medium">{category.name}</div>
            </button>
          );
        })}
      </div>

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <select
          value={searchFilters.make}
          onChange={(e) => setSearchFilters(prev => ({ ...prev, make: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All Makes</option>
          {POPULAR_MAKES.map(make => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Model"
          value={searchFilters.model}
          onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />

        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Year from"
            value={searchFilters.yearFrom}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, yearFrom: e.target.value }))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <input
            type="number"
            placeholder="Year to"
            value={searchFilters.yearTo}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, yearTo: e.target.value }))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Price from"
            value={searchFilters.priceFrom}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, priceFrom: e.target.value }))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <input
            type="number"
            placeholder="Price to"
            value={searchFilters.priceTo}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, priceTo: e.target.value }))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={searchFilters.fuelType}
          onChange={(e) => setSearchFilters(prev => ({ ...prev, fuelType: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All Fuel Types</option>
          {FUEL_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={searchFilters.transmission}
          onChange={(e) => setSearchFilters(prev => ({ ...prev, transmission: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All Transmissions</option>
          {TRANSMISSION_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Location"
          value={searchFilters.location}
          onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearchSubmit}
        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center font-medium"
      >
        <Search size={20} className="mr-2" />
        Search Vehicles
      </button>
    </div>
  );

  const renderFinanceCalculator = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Calculator size={24} className="mr-2 text-green-600" />
        Finance Calculator
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Price</label>
          <input
            type="number"
            placeholder="$25,000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deposit</label>
          <input
            type="number"
            placeholder="$5,000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Term (years)</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="3">3 years</option>
              <option value="4">4 years</option>
              <option value="5">5 years</option>
              <option value="6">6 years</option>
              <option value="7">7 years</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
            <input
              type="number"
              placeholder="8.5"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        
        <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
          Calculate Repayments
        </button>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">$368</div>
            <div className="text-sm text-green-600">per week</div>
            <div className="text-xs text-gray-600 mt-1">
              Based on 5 years at 8.5% interest
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehicleCard = (vehicle) => (
    <div key={vehicle.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image */}
      <div className="relative">
        <img 
          src={vehicle.images[0]} 
          alt={vehicle.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 space-y-2">
          {vehicle.dealer.verified && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <CheckCircle size={12} className="mr-1" />
              Verified
            </span>
          )}
          {vehicle.inspectionReport && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <FileText size={12} className="mr-1" />
              Inspected
            </span>
          )}
        </div>
        <button className="absolute top-2 left-2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-opacity">
          <Heart size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{vehicle.title}</h3>
        
        <div className="text-2xl font-bold text-red-600 mb-3">
          ${vehicle.price.toLocaleString()}
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {vehicle.year}
          </div>
          <div className="flex items-center">
            <Gauge size={14} className="mr-1" />
            {vehicle.odometer.toLocaleString()}km
          </div>
          <div className="flex items-center">
            <Fuel size={14} className="mr-1" />
            {vehicle.fuelType}
          </div>
          <div className="flex items-center">
            <Settings size={14} className="mr-1" />
            {vehicle.transmission}
          </div>
        </div>

        {/* Location & Dealer */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            {vehicle.location}
          </div>
          <div className="flex items-center">
            <Star size={14} className="mr-1 text-yellow-400" />
            {vehicle.dealer.rating} ({vehicle.dealer.reviews})
          </div>
        </div>

        {/* Dealer */}
        <div className="text-sm text-gray-700 mb-3">
          {vehicle.dealer.name}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
            View Details
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Phone size={16} className="text-gray-600" />
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderInspectionServices = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Eye size={24} className="mr-2 text-blue-600" />
        Professional Inspections
      </h3>
      
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Basic Inspection</h4>
            <span className="text-lg font-bold text-blue-600">$150</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Engine & transmission check</li>
            <li>• Brake & suspension inspection</li>
            <li>• Interior & exterior condition</li>
            <li>• Basic electrical systems</li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Comprehensive Inspection</h4>
            <span className="text-lg font-bold text-blue-600">$350</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Full mechanical inspection</li>
            <li>• Paint thickness measurement</li>
            <li>• Accident damage assessment</li>
            <li>• WOF pre-check</li>
            <li>• Written report with photos</li>
          </ul>
        </div>
        
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Book Inspection
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <TeReoText english="Motors Marketplace" teReoKey="motorsMarketplace" />
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8">
              Find your perfect ride across Aotearoa New Zealand
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">15,000+</div>
                <div className="text-red-200">Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">3,200+</div>
                <div className="text-red-200">Dealers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">85K+</div>
                <div className="text-red-200">Daily Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">92%</div>
                <div className="text-red-200">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'search', label: 'Search Vehicles', icon: Search },
              { id: 'finance', label: 'Finance Calculator', icon: Calculator },
              { id: 'inspection', label: 'Inspections', icon: Eye },
              { id: 'dealers', label: 'Dealers', icon: Award }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'search' && renderQuickSearch()}
            {activeTab === 'finance' && renderFinanceCalculator()}
            {activeTab === 'inspection' && renderInspectionServices()}
            
            {/* Featured Vehicles */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Vehicles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredVehicles.map(renderVehicleCard)}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Market Insights */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp size={20} className="mr-2 text-green-600" />
                Market Insights
              </h3>
              
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Toyota Camry</span>
                    <span className="text-green-600 font-medium">+3.2%</span>
                  </div>
                  <div className="text-lg font-semibold">$28,500 avg</div>
                </div>
                
                <div className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ford Ranger</span>
                    <span className="text-red-600 font-medium">-1.8%</span>
                  </div>
                  <div className="text-lg font-semibold">$45,200 avg</div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mazda CX-5</span>
                    <span className="text-green-600 font-medium">+2.1%</span>
                  </div>
                  <div className="text-lg font-semibold">$32,800 avg</div>
                </div>
              </div>
            </div>

            {/* Tips & Guides */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Info size={20} className="mr-2 text-blue-600" />
                Buying Tips
              </h3>
              
              <div className="space-y-3">
                <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">First-time buyer guide</div>
                  <div className="text-sm text-gray-600">Essential tips for new car buyers</div>
                </a>
                
                <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Financing options</div>
                  <div className="text-sm text-gray-600">Compare loans, hire purchase & leasing</div>
                </a>
                
                <a href="#" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Inspection checklist</div>
                  <div className="text-sm text-gray-600">What to check before buying</div>
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => onNavigate('sell-vehicle')}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sell Your Vehicle
                </button>
                
                <button 
                  onClick={() => onNavigate('dealer-signup')}
                  className="w-full border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Become a Dealer
                </button>
                
                <button 
                  onClick={() => onNavigate('trade-in')}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Trade-In Valuation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMotorsLanding;