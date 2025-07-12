// src/components/pages/ShippingInfoPage.js
import React from 'react';
import { ArrowLeft, Truck, MapPin, Clock, DollarSign, Package, CheckCircle, AlertCircle, Info, Star, Users, Phone } from 'lucide-react';

const ShippingInfoPage = ({ onNavigate }) => {
    const shippingOptions = [
        {
            icon: Truck,
            title: "NZ Post | Pōhi Hōu",
            teReo: "Pōhi hōu mō ngā taonga iti",
            description: "Standard delivery across New Zealand",
            features: [
                "2-5 business days",
                "Tracked delivery",
                "Signature on request",
                "Coverage up to $100"
            ],
            cost: "$5.90 - $12.90",
            weight: "Up to 5kg",
            coverage: "Up to $100"
        },
        {
            icon: Package,
            title: "Courier | Kaikawe",
            teReo: "Kaikawe mō ngā taonga nui",
            description: "Fast courier delivery for larger items",
            features: [
                "1-3 business days",
                "Full tracking",
                "Signature required",
                "Coverage up to $500"
            ],
            cost: "$12.90 - $25.90",
            weight: "Up to 25kg",
            coverage: "Up to $500"
        },
        {
            icon: MapPin,
            title: "Local Pickup | Tikina",
            teReo: "Tikina i te wāhi tata",
            description: "Collect from seller's location",
            features: [
                "Free of charge",
                "Inspect before paying",
                "Arrange with seller",
                "No shipping delays"
            ],
            cost: "Free",
            weight: "Any size",
            coverage: "Full protection"
        },
        {
            icon: Clock,
            title: "Express | Tere",
            teReo: "Tere mō ngā taonga hira",
            description: "Next day delivery for urgent items",
            features: [
                "Next business day",
                "Priority handling",
                "Full insurance",
                "SMS notifications"
            ],
            cost: "$25.90 - $45.90",
            weight: "Up to 10kg",
            coverage: "Up to $1000"
        }
    ];

    const shippingZones = [
        {
            zone: "Auckland | Tāmaki Makaurau",
            delivery: "1-2 business days",
            cost: "From $5.90"
        },
        {
            zone: "Wellington | Te Whanganui-a-Tara",
            delivery: "2-3 business days",
            cost: "From $6.90"
        },
        {
            zone: "Christchurch | Ōtautahi",
            delivery: "2-3 business days",
            cost: "From $6.90"
        },
        {
            zone: "Other North Island | Te Ika-a-Māui",
            delivery: "3-4 business days",
            cost: "From $7.90"
        },
        {
            zone: "Other South Island | Te Waipounamu",
            delivery: "4-5 business days",
            cost: "From $8.90"
        },
        {
            zone: "Rural Areas | Ngā Wāhi Taiwhenua",
            delivery: "5-7 business days",
            cost: "From $9.90"
        }
    ];

    const shippingTips = [
        {
            icon: Package,
            title: "Tikina te taonga | Package properly",
            content: "Ensure items are well-packaged to prevent damage during transit."
        },
        {
            icon: MapPin,
            title: "Tirohia te wāhi | Check address",
            content: "Double-check delivery address and contact details."
        },
        {
            icon: Clock,
            title: "Kia tere | Be prompt",
            content: "Respond quickly to delivery notifications and arrange pickup."
        },
        {
            icon: AlertCircle,
            title: "Kia tupato | Be careful",
            content: "Inspect packages upon delivery and report damage immediately."
        }
    ];

    const trackingInfo = [
        "Track your package with the provided tracking number",
        "Receive SMS/email updates on delivery status",
        "Contact courier directly for delivery issues",
        "Arrange redelivery if you miss the delivery"
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
                                <h1 className="text-xl font-semibold text-gray-900">Shipping Info | Ngā Mōhiohio Tukunga</h1>
                                <p className="text-sm text-gray-500">Fast, reliable delivery across Aotearoa</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
                        <Truck className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Fast Delivery Across NZ | Tukunga Tere puta noa i Aotearoa</h2>
                        <p className="text-xl mb-6">From Auckland to Invercargill, we've got you covered</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" />
                                <span>1-7 days delivery</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Tracked packages</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-5 h-5" />
                                <span>From $5.90</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Options */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Shipping Options | Ngā Ara Tukunga</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {shippingOptions.map((option, index) => {
                            const IconComponent = option.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <IconComponent className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">{option.title}</h4>
                                            <p className="text-gray-600 italic">{option.teReo}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-4">{option.description}</p>

                                    <div className="space-y-3 mb-4">
                                        <h5 className="font-semibold text-gray-900">Features | Ngā Āhuatanga:</h5>
                                        <ul className="space-y-2">
                                            {option.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-semibold text-gray-700">Cost:</span>
                                            <p className="text-gray-600">{option.cost}</p>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Weight:</span>
                                            <p className="text-gray-600">{option.weight}</p>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Coverage:</span>
                                            <p className="text-gray-600">{option.coverage}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Shipping Zones */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Delivery Times by Region | Ngā Wā Tukunga mā te Rohe</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region | Rohe</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time | Wā Tukunga</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost | Utu</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {shippingZones.map((zone, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{zone.zone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{zone.delivery}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{zone.cost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Tracking Information */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Package Tracking | Te Aroturuki Taonga</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start space-x-3">
                            <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-800 mb-3">Track Your Package | Aroturuki i tō Taonga</h4>
                                <ul className="space-y-2">
                                    {trackingInfo.map((info, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-blue-700">{info}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Tips */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Shipping Tips | Ngā Tohutohu Tukunga</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {shippingTips.map((tip, index) => {
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
                    <h3 className="text-2xl font-bold mb-4">Ready to ship? | Kua rite koe ki te tuku?</h3>
                    <p className="text-lg mb-6">Start selling and shipping across New Zealand today</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('create-listing')}
                            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Start Selling | Tīmata te Hoko
                        </button>
                        <button
                            onClick={() => onNavigate('help')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                        >
                            Shipping Help | Tautoko Tukunga
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingInfoPage; 