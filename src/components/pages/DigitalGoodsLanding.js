import React from 'react';

const DigitalGoodsLanding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Digital Goods</h1>
          <p className="text-xl mb-8">Software, eBooks, games, and more.</p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold">
            Start Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalGoodsLanding;
