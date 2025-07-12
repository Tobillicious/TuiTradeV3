// src/components/pages/BuyerProtectionPage.js
import React from 'react';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, Clock, DollarSign, MessageCircle, FileText, Users, Star, Truck, Phone } from 'lucide-react';

const BuyerProtectionPage = ({ onNavigate }) => {
    const protectionFeatures = [
        {
            icon: Shield,
            title: "Tautoko Kaihoko | Buyer Protection",
            teReo: "Te tautoko mō ngā kaihoko",
            description: "Get your money back if something goes wrong",
            details: [
                "Item not as described",
                "Item never received",
                "Significantly damaged in transit",
                "Counterfeit or fake items"
            ],
            coverage: "Up to $1000 per transaction",
            timeframe: "30 days from purchase"
        },
        {
            icon: Clock,
            title: "Tautoko Utu | Payment Protection",
            teReo: "Te tautoko mō ngā utu",
            description: "Secure payment processing with fraud protection",
            details: [
                "Encrypted payment processing",
                "Fraud detection systems",
                "Secure payment gateways",
                "Transaction monitoring"
            ],
            coverage: "100% of payment amount",
            timeframe: "Immediate protection"
        },
        {
            icon: MessageCircle,
            title: "Tautoko Kōrero | Communication Support",
            teReo: "Te tautoko mō ngā kōrero",
            description: "We help resolve disputes between buyers and sellers",
            details: [
                "Mediation services",
                "Dispute resolution",
                "Communication assistance",
                "Fair outcome guarantee"
            ],
            coverage: "Free mediation service",
            timeframe: "Within 48 hours"
        }
    ];

    const protectionSteps = [
        {
            step: 1,
            title: "Tirohia te taonga | Inspect the item",
            description: "Carefully examine the item upon delivery",
            actions: [
                "Check item condition",
                "Verify it matches description",
                "Test functionality if applicable",
                "Take photos if issues found"
            ]
        },
        {
            step: 2,
            title: "Whakapā atu ki te kaihoko | Contact the seller",
            description: "Try to resolve the issue directly with the seller first",
            actions: [
                "Send a polite message",
                "Include photos of issues",
                "Request resolution",
                "Give reasonable time to respond"
            ]
        },
        {
            step: 3,
            title: "Whakapā atu ki a mātou | Contact us",
            description: "If seller doesn't help, we'll step in",
            actions: [
                "Open a support ticket",
                "Provide transaction details",
                "Upload evidence",
                "Explain the situation clearly"
            ]
        },
        {
            step: 4,
            title: "Tautoko | Resolution",
            description: "We'll investigate and provide a fair resolution",
            actions: [
                "Review all evidence",
                "Contact both parties",
                "Make fair decision",
                "Process refund if warranted"
            ]
        }
    ];

    const safetyTips = [
        {
            icon: Star,
            title: "Tirohia ngā arotake | Check reviews",
            content: "Always read seller reviews and check their rating before buying."
        },
        {
            icon: FileText,
            title: "Pupuri i ngā tuhinga | Keep records",
            content: "Save all communication, photos, and transaction details."
        },
        {
            icon: Clock,
            title: "Kia tere | Act quickly",
            content: "Report issues within 30 days of receiving the item."
        },
        {
            icon: AlertCircle,
            title: "Kia tupato | Be cautious",
            content: "If a deal seems too good to be true, it probably is."
        }
    ];

    const notCovered = [
        "Items damaged by buyer after receipt",
        "Buyer's remorse (changed mind)",
        "Items purchased outside TuiTrade",
        "Digital items (software, codes, etc.)",
        "Items collected in person without proof",
        "Transactions over 30 days old"
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
                                <h1 className="text-xl font-semibold text-gray-900">Buyer Protection | Te Tautoko Kaihoko</h1>
                                <p className="text-sm text-gray-500">Your safety is our priority</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
                        <Shield className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">You're Protected | Kua Haumaru Koe</h2>
                        <p className="text-xl mb-6">Shop with confidence knowing we've got your back</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-5 h-5" />
                                <span>Up to $1000 protection</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" />
                                <span>30-day coverage</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>24/7 support</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Protection Features */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What's Covered | He aha te Kua Haumaru</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {protectionFeatures.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <IconComponent className="w-8 h-8 text-blue-600" />
                                        <h4 className="text-lg font-semibold text-gray-900">{feature.title}</h4>
                                    </div>
                                    <p className="text-gray-600 italic mb-3">{feature.teReo}</p>
                                    <p className="text-gray-700 mb-4">{feature.description}</p>

                                    <div className="space-y-3 mb-4">
                                        <h5 className="font-semibold text-gray-900">Covers | Ngā Kua Haumaru:</h5>
                                        <ul className="space-y-2">
                                            {feature.details.map((detail, detailIndex) => (
                                                <li key={detailIndex} className="flex items-start space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600">{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-semibold text-gray-700">Coverage:</span>
                                            <p className="text-gray-600">{feature.coverage}</p>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Timeframe:</span>
                                            <p className="text-gray-600">{feature.timeframe}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Protection Process */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How Protection Works | Me pēhea te Tautoko</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {protectionSteps.map((step, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-xl font-bold text-blue-600">{step.step}</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                                <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                                <ul className="space-y-2 text-left">
                                    {step.actions.map((action, actionIndex) => (
                                        <li key={actionIndex} className="flex items-start space-x-2">
                                            <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                            <span className="text-xs text-gray-600">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* What's Not Covered */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What's Not Covered | He aha te Kāore e Haumaru</h3>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-red-800 mb-3">Exclusions | Ngā Kāore e Haumaru</h4>
                                <ul className="space-y-2">
                                    {notCovered.map((item, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-red-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Safety Tips */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Safety Tips | Ngā Tohutohu Haumaru</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {safetyTips.map((tip, index) => {
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Need help? | He tautoko e hiahia ana?</h3>
                    <p className="text-lg mb-6">Our support team is here to help with any issues</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('help')}
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Contact Support | Whakapā Tautoko
                        </button>
                        <button
                            onClick={() => onNavigate('marketplace')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Shop Safely | Hoko Haumaru
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerProtectionPage; 