// src/components/pages/SuccessTipsPage.js
import React from 'react';
import { ArrowLeft, Star, Camera, DollarSign, Clock, MessageCircle, TrendingUp, Award, Target, Zap, Users, CheckCircle } from 'lucide-react';

const SuccessTipsPage = ({ onNavigate }) => {
    const tips = [
        {
            icon: Camera,
            title: "Whakaahua Pai | Great Photos",
            teReo: "Whakaahua pai mō ō taonga",
            description: "High-quality photos are your first impression",
            tips: [
                "Use natural lighting - avoid harsh shadows",
                "Take photos from multiple angles",
                "Show any damage or wear clearly",
                "Include size reference when helpful",
                "Use a clean, uncluttered background"
            ],
            category: "Photography"
        },
        {
            icon: DollarSign,
            title: "Utu Tika | Smart Pricing",
            teReo: "Whakarite utu tika mō ō taonga",
            description: "Price competitively to attract buyers",
            tips: [
                "Research similar items on the platform",
                "Consider item condition and age",
                "Factor in shipping costs",
                "Leave room for negotiation",
                "Use psychological pricing (e.g., $99 instead of $100)"
            ],
            category: "Pricing"
        },
        {
            icon: MessageCircle,
            title: "Kōrero Pai | Excellent Communication",
            teReo: "Kōrero pai ki ngā kaihoko",
            description: "Build trust through clear communication",
            tips: [
                "Respond to messages within 24 hours",
                "Be honest about item condition",
                "Provide detailed answers to questions",
                "Use friendly, professional language",
                "Follow up after sales"
            ],
            category: "Communication"
        },
        {
            icon: Clock,
            title: "Kia Tere | Be Prompt",
            teReo: "Kia tere i ngā mahi katoa",
            description: "Speed and reliability build customer trust",
            tips: [
                "Ship items within 2 business days",
                "Update tracking information promptly",
                "Respond to issues quickly",
                "Keep buyers informed of delays",
                "Process refunds efficiently"
            ],
            category: "Service"
        },
        {
            icon: Star,
            title: "Hanga Ingoa | Build Reputation",
            teReo: "Hanga ingoa pai mōu",
            description: "Your reputation is your most valuable asset",
            tips: [
                "Always be honest about item condition",
                "Go above and beyond for customers",
                "Ask for reviews after successful sales",
                "Handle problems professionally",
                "Learn from negative feedback"
            ],
            category: "Reputation"
        },
        {
            icon: TrendingUp,
            title: "Whakapiki Hoko | Increase Sales",
            teReo: "Whakapiki i ō hoko",
            description: "Strategies to boost your selling success",
            tips: [
                "List items in popular categories",
                "Use relevant keywords in titles",
                "Offer bundle deals for multiple items",
                "Promote during peak shopping times",
                "Consider seasonal demand"
            ],
            category: "Strategy"
        }
    ];

    const successStories = [
        {
            name: "Sarah M.",
            location: "Auckland",
            story: "I started selling my kids' old toys and made over $800 in my first month. The key was taking great photos and being honest about condition.",
            earnings: "$800+",
            tip: "Quality photos sell items"
        },
        {
            name: "Mike T.",
            location: "Wellington",
            story: "My vintage clothing collection has been a huge hit. I focus on detailed descriptions and quick shipping - customers love it!",
            earnings: "$2,500+",
            tip: "Detailed descriptions matter"
        },
        {
            name: "Lisa K.",
            location: "Christchurch",
            story: "I sell handmade jewelry and have built a loyal customer base. Communication and packaging presentation are everything.",
            earnings: "$1,200+",
            tip: "Presentation is key"
        }
    ];

    const commonMistakes = [
        {
            icon: Target,
            title: "Poor Photos | Whakaahua Kino",
            description: "Blurry, dark, or cluttered photos turn buyers away"
        },
        {
            icon: DollarSign,
            title: "Overpricing | Utu Nui Rawa",
            description: "Items priced too high sit unsold for months"
        },
        {
            icon: Clock,
            title: "Slow Response | Whakautu Pōturi",
            description: "Buyers expect quick responses to their questions"
        },
        {
            icon: Star,
            title: "Dishonest Descriptions | Kōrero Hē",
            description: "Misleading descriptions lead to returns and bad reviews"
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
                                <h1 className="text-xl font-semibold text-gray-900">Success Tips | Ngā Tohutohu Angitu</h1>
                                <p className="text-sm text-gray-500">Proven strategies for selling success</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
                        <Award className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Master the Art of Selling | Akona te Hanga Hoko</h2>
                        <p className="text-xl mb-6">Learn from successful sellers and avoid common pitfalls</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <Star className="w-5 h-5" />
                                <span>Proven strategies</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>Success stories</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Zap className="w-5 h-5" />
                                <span>Quick wins</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Grid */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Essential Success Tips | Ngā Tohutohu Taketake</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {tips.map((tip, index) => {
                            const IconComponent = tip.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <IconComponent className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">{tip.title}</h4>
                                            <p className="text-gray-600 italic text-sm">{tip.teReo}</p>
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                                                {tip.category}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-4">{tip.description}</p>

                                    <div className="space-y-2">
                                        <h5 className="font-semibold text-gray-900">Key Tips | Ngā Tohutohu:</h5>
                                        <ul className="space-y-2">
                                            {tip.tips.map((tipItem, tipIndex) => (
                                                <li key={tipIndex} className="flex items-start space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600">{tipItem}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
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
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">{story.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{story.name}</h4>
                                        <p className="text-sm text-gray-600">{story.location}</p>
                                        <p className="text-sm font-semibold text-green-600">Earned {story.earnings}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm mb-3 italic">"{story.story}"</p>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm font-semibold text-green-800">Key Tip: {story.tip}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Common Mistakes */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Avoid These Mistakes | Kia Māhaki i Ēnei Hē</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {commonMistakes.map((mistake, index) => {
                            const IconComponent = mistake.icon;
                            return (
                                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                    <IconComponent className="w-8 h-8 text-red-600 mx-auto mb-3" />
                                    <h4 className="font-semibold text-red-800 mb-2">{mistake.title}</h4>
                                    <p className="text-red-700 text-sm">{mistake.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to become a top seller? | Kua rite koe ki te kaihoko rongonui?</h3>
                    <p className="text-lg mb-6">Start implementing these tips and watch your sales grow</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('create-listing')}
                            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Start Selling | Tīmata te Hoko
                        </button>
                        <button
                            onClick={() => onNavigate('seller-tools')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                        >
                            Explore Tools | Tirohia ngā Rākau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessTipsPage; 