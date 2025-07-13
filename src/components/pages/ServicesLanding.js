import React from 'react';

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
    </div>
  );
};

export default ServicesLanding;
