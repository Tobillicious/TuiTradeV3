import React from 'react';

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
    </div>
  );
};

export default NewGoodsLanding;
