// src/components/pages/HowToSellPage.js
import React from 'react';
import { ArrowLeft, Camera, Edit, DollarSign, MessageCircle, Truck, CheckCircle, Star, Users, TrendingUp, Shield, Award, Clock } from 'lucide-react';

const HowToSellPage = ({ onNavigate }) => {
    const sellingSteps = [
        {
            icon: Camera,
            title: "Tāngo whakaahua | Take photos",
            teReo: "Tāngo whakaahua pai mō tō taonga",
            english: "Take clear, well-lit photos of your item",
            details: [
                "Use good lighting (natural light is best)",
                "Take photos from multiple angles",
                "Show any damage or wear clearly",
                "Include size reference if helpful"
            ]
        },
        {
            icon: Edit,
            title: "Tuhia te kōrero | Write description",
            teReo: "Tuhia te kōrero mō tō taonga",
            english: "Create an honest, detailed description",
            details: [
                "Be honest about condition",
                "Include brand, model, age",
                "List all features and specifications",
                "Mention any flaws or damage"
            ]
        },
        {
            icon: DollarSign,
            title: "Whakarite utu | Set price",
            teReo: "Whakarite utu tika mō tō taonga",
            english: "Research similar items and set a fair price",
            details: [
                "Check similar listings",
                "Consider item condition",
                "Factor in shipping costs",
                "Leave room for negotiation"
            ]
        },
        {
            icon: MessageCircle,
            title: "Whakautu pātai | Answer questions",
            teReo: "Whakautu ngā pātai o ngā kaihoko",
            english: "Respond quickly to buyer inquiries",
            details: [
                "Reply within 24 hours",
                "Be helpful and honest",
                "Provide additional photos if needed",
                "Negotiate fairly"
            ]
        },
        {
            icon: Truck,
            title: "Tuku te taonga | Ship the item",
            teReo: "Tuku te taonga ki te kaihoko",
            english: "Package carefully and ship promptly",
            details: [
                "Package securely to prevent damage",
                "Ship within 2 business days",
                "Provide tracking information",
                "Follow up on delivery"
            ]
        },
        {
            icon: CheckCircle,
            title: "Whiwhi utu | Get paid",
            teReo: "Whiwhi utu me te arotake",
            english: "Receive payment and get positive feedback",
            details: [
                "Payment processed securely",
                "Funds available in 1-3 days",
                "Ask buyer to leave review",
                "Build your seller reputation"
            ]
        }
    ];

    const sellingTips = [
        {
            icon: Star,
            title: "Kia pono | Be honest",
            content: "Always be truthful about item condition and history. Honesty builds trust and repeat customers."
        },
        {
            icon: Camera,
            title: "Whakaahua pai | Good photos",
            content: "High-quality photos sell items faster. Show your item in the best possible light."
        },
        {
            icon: Clock,
            title: "Kia tere | Be responsive",
            content: "Quick responses to messages show you're a reliable seller and increase sales."
        },
        {
            icon: DollarSign,
            title: "Utu tika | Fair pricing",
            content: "Research market prices and set competitive but fair prices for your items."
        }
    ];

    const successStories = [
        {
            name: "Sarah from Auckland",
            story: "I started selling my kids' old toys and made over $500 in my first month! The platform is so easy to use.",
            earnings: "$500+"
        },
        {
            name: "Mike from Wellington",
            story: "Sold my old mountain bike for $800. The buyer protection gave me confidence to ship it safely.",
            earnings: "$800"
        },
        {
            name: "Lisa from Christchurch",
            story: "My vintage clothing collection has been a hit. I've made over $2000 selling unique pieces.",
            earnings: "$2000+"
        }
    ];

    const categories = [
        "Electronics & Gadgets",
        "Fashion & Accessories",
        "Home & Garden",
        "Sports & Recreation",
        "Books & Media",
        "Toys & Games",
        "Automotive",
        "Collectibles"
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
                                <h1 className="text-xl font-semibold text-gray-900">How to Sell | Me pēhea te Hoko</h1>
                                <p className="text-sm text-gray-500">Turn your items into cash</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                        <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Start Selling Today | Tīmata te Hoko i tēnei rā</h2>
                        <p className="text-xl mb-6">Join thousands of Kiwis making money from their unused items</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>10,000+ sellers</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-5 h-5" />
                                <span>Low fees</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Shield className="w-5 h-5" />
                                <span>Secure payments</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">6 Steps to Success | 6 Ngā Hīkoi ki te Angitu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sellingSteps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="bg-purple-100 p-3 rounded-full">
                                            <IconComponent className="w-6 h-6 text-purple-600" />
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

                {/* Success Stories */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Success Stories | Ngā Kōrero Angitu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {successStories.map((story, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Star className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{story.name}</h4>
                                        <p className="text-sm text-purple-600 font-semibold">Earned {story.earnings}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm italic">"{story.story}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Categories */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Categories | Ngā Wāhanga Rongonui</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {categories.map((category, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                                    <span className="text-sm font-medium text-gray-700">{category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pro Tips | Ngā Tohutohu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sellingTips.map((tip, index) => {
                            const IconComponent = tip.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <IconComponent className="w-5 h-5 text-purple-600" />
                                        <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                                    </div>
                                    <p className="text-gray-700">{tip.content}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to start selling? | Kua rite koe ki te tīmata?</h3>
                    <p className="text-lg mb-6">Create your first listing in minutes</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('create-listing')}
                            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Create Listing | Hanga Rārangi
                        </button>
                        <button
                            onClick={() => onNavigate('seller-fees')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                        >
                            View Fees | Tirohia ngā Utu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowToSellPage; 