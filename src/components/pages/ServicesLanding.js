import React from 'react';
import { Wrench, Home, Briefcase, Palette, Music, Camera } from 'lucide-react';

const subcategories = [
  { name: 'Trades & Home', icon: Home, color: 'text-blue-500' },
  { name: 'Professional', icon: Briefcase, color: 'text-green-500' },
  { name: 'Creative', icon: Palette, color: 'text-purple-500' },
  { name: 'Events', icon: Camera, color: 'text-red-500' },
  { name: 'Tutoring', icon: Wrench, color: 'text-orange-500' },
  { name: 'Wellness', icon: Music, color: 'text-pink-500' },
];

const ServicesLanding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Services</h1>
          <p className="text-xl mb-8">Find skilled professionals for any task.</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">
            Browse Services
          </button>
        </div>
      </div>

      {/* Subcategories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Explore Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {subcategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.name} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <Icon className={`w-12 h-12 mx-auto mb-4 ${category.color}`} />
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServicesLanding;