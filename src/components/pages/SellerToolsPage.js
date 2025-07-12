// src/components/pages/SellerToolsPage.js
import React from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Eye, MessageCircle, DollarSign, Calendar, Users, Star, Settings, Zap, Target, Award } from 'lucide-react';

const SellerToolsPage = ({ onNavigate }) => {
    const tools = [
        {
            icon: BarChart3,
            title: "Analytics Dashboard | Papa Tātai",
            teReo: "Papa tātai mō ngā mōhiohio",
            description: "Track your sales performance and insights",
            features: [
                "View sales trends and patterns",
                "Monitor listing performance",
                "Track buyer engagement",
                "Revenue analytics"
            ],
            status: "Available",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            icon: TrendingUp,
            title: "Promotion Tools | Ngā Rākau Whakatairanga",
            teReo: "Ngā rākau whakatairanga",
            description: "Boost your listings and reach more buyers",
            features: [
                "Featured listing placement",
                "Social media integration",
                "Email marketing campaigns",
                "Targeted advertising"
            ],
            status: "Coming Soon",
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            icon: Eye,
            title: "Listing Optimizer | Whakapai Rārangi",
            teReo: "Whakapai i ngā rārangi",
            description: "Optimize your listings for better visibility",
            features: [
                "SEO optimization suggestions",
                "Title and description analysis",
                "Photo quality recommendations",
                "Pricing insights"
            ],
            status: "Available",
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            icon: MessageCircle,
            title: "Communication Hub | Pokapū Kōrero",
            teReo: "Pokapū kōrero mō ngā kaihoko",
            description: "Manage all buyer communications in one place",
            features: [
                "Unified messaging system",
                "Quick response templates",
                "Automated notifications",
                "Chat history tracking"
            ],
            status: "Available",
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        },
        {
            icon: DollarSign,
            title: "Pricing Assistant | Tautoko Utu",
            teReo: "Tautoko mō te whakarite utu",
            description: "Get smart pricing recommendations",
            features: [
                "Market price analysis",
                "Competitor pricing",
                "Demand forecasting",
                "Dynamic pricing suggestions"
            ],
            status: "Coming Soon",
            color: "text-red-600",
            bgColor: "bg-red-50"
        },
        {
            icon: Calendar,
            title: "Inventory Manager | Kaiwhakahaere Taonga",
            teReo: "Kaiwhakahaere mō ngā taonga",
            description: "Manage your inventory and listings efficiently",
            features: [
                "Bulk listing management",
                "Stock tracking",
                "Automated relisting",
                "Category organization"
            ],
            status: "Available",
            color: "text-indigo-600",
            bgColor: "bg-indigo-50"
        }
    ];

    const successMetrics = [
        {
            icon: Users,
            title: "Active Buyers",
            value: "2,500+",
            description: "Monthly active buyers on platform"
        },
        {
            icon: Star,
            title: "Seller Rating",
            value: "4.8/5",
            description: "Average seller satisfaction"
        },
        {
            icon: DollarSign,
            title: "Average Sale",
            value: "$85",
            description: "Average transaction value"
        },
        {
            icon: TrendingUp,
            title: "Growth Rate",
            value: "23%",
            description: "Monthly user growth"
        }
    ];

    const tips = [
        {
            icon: Target,
            title: "Set Clear Goals | Whakarite Whāinga",
            content: "Define your selling goals and track progress regularly."
        },
        {
            icon: Zap,
            title: "Use Tools Efficiently | Whakamahi Ngā Rākau",
            content: "Leverage analytics to understand what works best for your items."
        },
        {
            icon: Award,
            title: "Build Reputation | Hanga Ingoa",
            content: "Focus on excellent service to build a strong seller reputation."
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
                                <h1 className="text-xl font-semibold text-gray-900">Seller Tools | Ngā Rākau Kaihoko</h1>
                                <p className="text-sm text-gray-500">Powerful tools to grow your business</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                        <Settings className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Powerful Seller Tools | Ngā Rākau Kaihoko Kaha</h2>
                        <p className="text-xl mb-6">Everything you need to succeed as a seller on TuiTrade</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5" />
                                <span>Analytics</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Promotions</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Eye className="w-5 h-5" />
                                <span>Optimization</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Available Tools | Ngā Rākau E Wātea Ana</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tools.map((tool, index) => {
                            const IconComponent = tool.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className={`${tool.bgColor} p-3 rounded-full`}>
                                            <IconComponent className={`w-6 h-6 ${tool.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900">{tool.title}</h4>
                                            <p className="text-gray-600 italic text-sm">{tool.teReo}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tool.status === 'Available'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {tool.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 mb-4">{tool.description}</p>

                                    <div className="space-y-2">
                                        <h5 className="font-semibold text-gray-900 text-sm">Features | Ngā Āhuatanga:</h5>
                                        <ul className="space-y-1">
                                            {tool.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                    <span className="text-xs text-gray-600">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Success Metrics */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Platform Success | Te Angitu o te Pātaka</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {successMetrics.map((metric, index) => {
                            const IconComponent = metric.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                    <IconComponent className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                                    <h4 className="font-semibold text-gray-900 mb-2">{metric.title}</h4>
                                    <p className="text-gray-600 text-sm">{metric.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pro Tips | Ngā Tohutohu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tips.map((tip, index) => {
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
                    <h3 className="text-2xl font-bold mb-4">Ready to boost your sales? | Kua rite koe ki te whakapiki i ō hoko?</h3>
                    <p className="text-lg mb-6">Start using these powerful tools to grow your business</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('seller-dashboard')}
                            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Access Dashboard | Tirohia te Papa
                        </button>
                        <button
                            onClick={() => onNavigate('create-listing')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                        >
                            Create Listing | Hanga Rārangi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerToolsPage; 