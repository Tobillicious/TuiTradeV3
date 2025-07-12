// src/components/pages/HowToBuyPage.js
import React from 'react';
import { ArrowLeft, Search, Heart, MessageCircle, CreditCard, Shield, Truck, CheckCircle, Star, MapPin, Clock, AlertCircle } from 'lucide-react';

const HowToBuyPage = ({ onNavigate }) => {
    const steps = [
        {
            icon: Search,
            title: "Rapua te taonga | Find what you want",
            teReo: "Rapua te taonga e hiahia ana koe",
            english: "Browse our marketplace or use the search function to find exactly what you're looking for",
            details: [
                "Use filters to narrow down your search",
                "Save items to your watchlist",
                "Set up alerts for new listings"
            ]
        },
        {
            icon: MessageCircle,
            title: "Whakapā atu ki te kaihoko | Contact the seller",
            teReo: "Whakapā atu ki te kaihoko mō ngā pātai",
            english: "Ask questions about the item, shipping, or payment options",
            details: [
                "Check seller ratings and reviews",
                "Ask about item condition",
                "Negotiate price if acceptable"
            ]
        },
        {
            icon: CreditCard,
            title: "Utu | Make payment",
            teReo: "Utu mā te ara pai mōu",
            english: "Choose from our secure payment options",
            details: [
                "Credit/debit card via Stripe",
                "Bank transfer (NZ banks only)",
                "Afterpay for eligible items",
                "Cash on pickup (if arranged)"
            ]
        },
        {
            icon: Truck,
            title: "Tikina rānei tukuna | Pickup or delivery",
            teReo: "Tikina te taonga rānei tukuna ki a koe",
            english: "Arrange pickup or have it delivered to your door",
            details: [
                "Local pickup (free)",
                "NZ Post delivery",
                "Courier delivery",
                "Track your package"
            ]
        },
        {
            icon: CheckCircle,
            title: "Whiwhi te taonga | Receive your item",
            teReo: "Whiwhi te taonga me te tautoko",
            english: "Get your item and leave feedback for the seller",
            details: [
                "Inspect item upon arrival",
                "Contact seller if issues",
                "Leave honest review",
                "Report problems if needed"
            ]
        }
    ];

    const tips = [
        {
            icon: Star,
            title: "Tirohia ngā arotake | Check reviews",
            content: "Always read seller reviews and check their rating before making a purchase."
        },
        {
            icon: MapPin,
            title: "Tirohia te wāhi | Check location",
            content: "Consider shipping costs and delivery times, especially for larger items."
        },
        {
            icon: Clock,
            title: "Tatari kia pai | Be patient",
            content: "Good deals come to those who wait. Don't rush into purchases."
        },
        {
            icon: AlertCircle,
            title: "Kia tupato | Be cautious",
            content: "If a deal seems too good to be true, it probably is. Trust your instincts."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => onNavigate('home')}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">How to Buy | Me pēhea te hoko</h1>
                                <p className="text-sm text-gray-500">Your complete guide to buying on TuiTrade</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                        <h2 className="text-3xl font-bold mb-4">Kia ora! Welcome to TuiTrade</h2>
                        <p className="text-xl mb-6">Your trusted marketplace for buying and selling in Aotearoa</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-5 h-5" />
                                <span>Secure Payments</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Truck className="w-5 h-5" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Buyer Protection</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">5 Steps to Success | 5 Ngā Hīkoi ki te Angitu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {steps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <IconComponent className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-300">{index + 1}</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                                    <p className="text-gray-600 mb-4 italic">{step.teReo}</p>
                                    <p className="text-gray-700 mb-4">{step.english}</p>
                                    <ul className="space-y-2">
                                        {step.details.map((detail, detailIndex) => (
                                            <li key={detailIndex} className="flex items-start space-x-2">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-600">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pro Tips | Ngā Tohutohu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tips.map((tip, index) => {
                            const IconComponent = tip.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <IconComponent className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                                    </div>
                                    <p className="text-gray-700">{tip.content}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to start shopping? | Kua rite koe ki te hoko?</h3>
                    <p className="text-lg mb-6">Join thousands of Kiwis buying and selling on TuiTrade</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('marketplace')}
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Browse Marketplace | Tirohia te Mākete
                        </button>
                        <button
                            onClick={() => onNavigate('help')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Get Help | Tautoko
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowToBuyPage; 