// src/components/pages/PaymentOptionsPage.js
import React from 'react';
import { ArrowLeft, CreditCard, Building, Clock, Shield, CheckCircle, AlertCircle, Info, DollarSign, Smartphone, Truck } from 'lucide-react';

const PaymentOptionsPage = ({ onNavigate }) => {
    const paymentMethods = [
        {
            icon: CreditCard,
            title: "Kāri Utu | Credit/Debit Cards",
            teReo: "Kāri utu me kāri nama",
            description: "Secure payments via Stripe",
            features: [
                "Visa, Mastercard, American Express",
                "Instant payment processing",
                "Secure encryption",
                "Buyer protection included"
            ],
            fees: "2.9% + 30c per transaction",
            processingTime: "Instant",
            security: "High",
            iconColor: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            icon: Building,
            title: "Pēke Hōu | Bank Transfer",
            teReo: "Whakawhiti pēke hōu",
            description: "Direct bank-to-bank transfer",
            features: [
                "ANZ, ASB, BNZ, Westpac, Kiwibank",
                "No card fees",
                "Direct to seller's account",
                "Reference number tracking"
            ],
            fees: "Free (bank fees may apply)",
            processingTime: "1-2 business days",
            security: "High",
            iconColor: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            icon: Clock,
            title: "Afterpay | Pay in 4",
            teReo: "Utu i roto i te 4",
            description: "Buy now, pay later in 4 installments",
            features: [
                "Split payment over 6 weeks",
                "No interest if paid on time",
                "Available for items $50-$2000",
                "Instant approval"
            ],
            fees: "Free (late fees apply)",
            processingTime: "Instant",
            security: "High",
            iconColor: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            icon: DollarSign,
            title: "Moni Pū | Cash on Pickup",
            teReo: "Moni pū i te tikina",
            description: "Pay cash when collecting item",
            features: [
                "No online payment required",
                "Inspect before paying",
                "Local pickup only",
                "Arrange with seller"
            ],
            fees: "Free",
            processingTime: "On pickup",
            security: "Medium",
            iconColor: "text-yellow-600",
            bgColor: "bg-yellow-50"
        }
    ];

    const securityFeatures = [
        {
            icon: Shield,
            title: "SSL Encryption",
            description: "All transactions are encrypted with bank-level security"
        },
        {
            icon: CheckCircle,
            title: "Buyer Protection",
            description: "Get your money back if item doesn't arrive or is misrepresented"
        },
        {
            icon: Info,
            title: "Secure Processing",
            description: "We never store your payment details on our servers"
        }
    ];

    const tips = [
        "Always use secure payment methods for expensive items",
        "Keep records of all transactions",
        "Be wary of sellers asking for unusual payment methods",
        "Contact support if you have payment issues"
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
                                <h1 className="text-xl font-semibold text-gray-900">Payment Options | Ngā Ara Utu</h1>
                                <p className="text-sm text-gray-500">Secure payment methods for Kiwis</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
                        <h2 className="text-3xl font-bold mb-4">Secure Payment Options | Ngā Ara Utu Haumaru</h2>
                        <p className="text-xl mb-6">Choose the payment method that works best for you</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-5 h-5" />
                                <span>100% Secure</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Buyer Protection</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" />
                                <span>Fast Processing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Available Payment Methods | Ngā Ara Utu E Wātea Ana</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {paymentMethods.map((method, index) => {
                            const IconComponent = method.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className={`${method.bgColor} p-3 rounded-full`}>
                                            <IconComponent className={`w-6 h-6 ${method.iconColor}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">{method.title}</h4>
                                            <p className="text-gray-600 italic">{method.teReo}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-4">{method.description}</p>

                                    <div className="space-y-3 mb-4">
                                        <h5 className="font-semibold text-gray-900">Features | Ngā Āhuatanga:</h5>
                                        <ul className="space-y-2">
                                            {method.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-semibold text-gray-700">Fees:</span>
                                            <p className="text-gray-600">{method.fees}</p>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Processing:</span>
                                            <p className="text-gray-600">{method.processingTime}</p>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Security:</span>
                                            <p className="text-gray-600">{method.security}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Security Features */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Security & Protection | Te Haumaru me te Tautoko</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {securityFeatures.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                    <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                                    <p className="text-gray-600 text-sm">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Payment Safety Tips | Ngā Tohutohu Haumaru</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-yellow-800 mb-3">Stay Safe When Paying | Kia Haumaru i te Utu</h4>
                                <ul className="space-y-2">
                                    {tips.map((tip, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-yellow-700">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to shop safely? | Kua rite koe ki te hoko haumaru?</h3>
                    <p className="text-lg mb-6">Start browsing with confidence knowing your payments are protected</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('marketplace')}
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Start Shopping | Tīmata te Hoko
                        </button>
                        <button
                            onClick={() => onNavigate('help')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Contact Support | Whakapā Tautoko
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentOptionsPage; 