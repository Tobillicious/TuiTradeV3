// src/components/pages/SellerFeesPage.js
import React from 'react';
import { ArrowLeft, DollarSign, Calculator, CheckCircle, Info, AlertCircle, TrendingUp, Shield, Users, Star } from 'lucide-react';

const SellerFeesPage = ({ onNavigate }) => {
    const feeStructure = [
        {
            type: "Platform Fee | Utu Pātaka",
            teReo: "Utu mō te whakamahi i te pātaka",
            percentage: "5%",
            description: "Standard platform fee on all successful sales",
            details: [
                "Applied to final sale price",
                "Includes buyer protection",
                "Covers platform maintenance",
                "No hidden fees"
            ],
            example: "Sell for $100 → $5 fee → $95 to you"
        },
        {
            type: "Payment Processing | Utu Utu",
            teReo: "Utu mō te tukatuka utu",
            percentage: "2.9% + 30c",
            description: "Payment processing fees (varies by method)",
            details: [
                "Credit/debit card processing",
                "Secure payment handling",
                "Fraud protection included",
                "Instant payment processing"
            ],
            example: "Sell for $100 → $3.20 fee → $96.80 to you"
        },
        {
            type: "Bank Transfer | Whakawhiti Pēke",
            teReo: "Whakawhiti pēke hōu",
            percentage: "Free",
            description: "No additional fees for bank transfers",
            details: [
                "Direct to your bank account",
                "No processing fees",
                "1-2 business days",
                "Reference number provided"
            ],
            example: "Sell for $100 → $0 fee → $100 to you"
        }
    ];

    const feeExamples = [
        {
            salePrice: "$50",
            platformFee: "$2.50",
            paymentFee: "$1.75",
            totalFees: "$4.25",
            youReceive: "$45.75"
        },
        {
            salePrice: "$100",
            platformFee: "$5.00",
            paymentFee: "$3.20",
            totalFees: "$8.20",
            youReceive: "$91.80"
        },
        {
            salePrice: "$200",
            platformFee: "$10.00",
            paymentFee: "$6.10",
            totalFees: "$16.10",
            youReceive: "$183.90"
        },
        {
            salePrice: "$500",
            platformFee: "$25.00",
            paymentFee: "$14.80",
            totalFees: "$39.80",
            youReceive: "$460.20"
        }
    ];

    const noFees = [
        "Listing creation",
        "Photo uploads",
        "Buyer messaging",
        "Platform access",
        "Seller tools",
        "Analytics dashboard"
    ];

    const benefits = [
        {
            icon: Shield,
            title: "Buyer Protection",
            description: "We handle disputes and protect both buyers and sellers"
        },
        {
            icon: Users,
            title: "Large Audience",
            description: "Access to thousands of potential buyers across NZ"
        },
        {
            icon: TrendingUp,
            title: "Marketing Tools",
            description: "Promote your listings and reach more customers"
        },
        {
            icon: Star,
            title: "Reputation System",
            description: "Build trust with reviews and ratings"
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
                                <h1 className="text-xl font-semibold text-gray-900">Seller Fees | Ngā Utu Kaihoko</h1>
                                <p className="text-sm text-gray-500">Transparent, competitive pricing</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
                        <DollarSign className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Simple, Transparent Fees | Ngā Utu Mārama, Mōhio</h2>
                        <p className="text-xl mb-6">Keep more of your earnings with our competitive fee structure</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>No listing fees</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Only pay when you sell</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Competitive rates</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fee Structure */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Fee Structure | Te Hanganga Utu</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {feeStructure.map((fee, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="text-center mb-4">
                                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <DollarSign className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900">{fee.type}</h4>
                                    <p className="text-gray-600 italic text-sm">{fee.teReo}</p>
                                    <div className="text-2xl font-bold text-green-600 mt-2">{fee.percentage}</div>
                                </div>

                                <p className="text-gray-700 mb-4 text-center">{fee.description}</p>

                                <div className="space-y-3 mb-4">
                                    <h5 className="font-semibold text-gray-900">Includes | Ngā Kua Whakauru:</h5>
                                    <ul className="space-y-2">
                                        {fee.details.map((detail, detailIndex) => (
                                            <li key={detailIndex} className="flex items-start space-x-2">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-600">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-sm font-semibold text-gray-700">Example:</p>
                                    <p className="text-sm text-gray-600">{fee.example}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fee Calculator */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Fee Calculator | Te Tātai Utu</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price | Utu Hoko</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform Fee | Utu Pātaka</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Fee | Utu Utu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fees | Ngā Utu Katoa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">You Receive | Ka Whiwhi Koe</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {feeExamples.map((example, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{example.salePrice}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{example.platformFee}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{example.paymentFee}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{example.totalFees}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{example.youReceive}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* What's Free */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What's Free | He aha te Kore Utu</h3>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-green-800 mb-3">No Hidden Fees | Kāore he Utu Huna</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {noFees.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-green-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What You Get | He aha tāu e Whiwhi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => {
                            const IconComponent = benefit.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                    <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to start earning? | Kua rite koe ki te tīmata?</h3>
                    <p className="text-lg mb-6">Join thousands of sellers making money on TuiTrade</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('create-listing')}
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Start Selling | Tīmata te Hoko
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

export default SellerFeesPage; 