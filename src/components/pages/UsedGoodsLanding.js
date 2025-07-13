import React from 'react';

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
    </div>
  );
};

export default UsedGoodsLanding;
