import React from 'react';
import { Smartphone, Laptop, Watch, Shirt, Puzzle, Home } from 'lucide-react';

const subcategories = [
  { name: 'Electronics', icon: Smartphone, color: 'text-blue-500' },
  { name: 'Computers', icon: Laptop, color: 'text-green-500' },
  { name: 'Fashion', icon: Shirt, color: 'text-purple-500' },
  { name: 'Home & Kitchen', icon: Home, color: 'text-red-500' },
  { name: 'Toys & Games', icon: Puzzle, color: 'text-orange-500' },
  { name: 'Accessories', icon: Watch, color: 'text-pink-500' },
];

const NewGoodsLanding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">New Goods</h1>
          <p className="text-xl mb-8">Brand new items, direct from sellers.</p>
          <button className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold">
            Shop New
          </button>
        </div>
      </div>

      {/* Subcategories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Explore New Goods</h2>
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

export default NewGoodsLanding;