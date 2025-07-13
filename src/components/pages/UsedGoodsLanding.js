import React from 'react';
import { Shirt, Book, Gamepad2, Music, Film, Palette } from 'lucide-react';

const subcategories = [
  { name: 'Clothing', icon: Shirt, color: 'text-blue-500' },
  { name: 'Books', icon: Book, color: 'text-green-500' },
  { name: 'Electronics', icon: Gamepad2, color: 'text-purple-500' },
  { name: 'Furniture', icon: Music, color: 'text-red-500' },
  { name: 'Toys & Hobbies', icon: Film, color: 'text-orange-500' },
  { name: 'Collectibles', icon: Palette, color: 'text-pink-500' },
];

const UsedGoodsLanding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Used Goods</h1>
          <p className="text-xl mb-8">Great deals on pre-loved items.</p>
          <button className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold">
            Find a Bargain
          </button>
        </div>
      </div>

      {/* Subcategories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Explore Used Goods</h2>
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

export default UsedGoodsLanding;