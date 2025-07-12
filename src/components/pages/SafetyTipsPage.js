// src/components/pages/SafetyTipsPage.js
import React from 'react';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Users, MapPin, Phone, Clock, DollarSign, Eye, Lock, MessageCircle, Star, XCircle } from 'lucide-react';

const SafetyTipsPage = ({ onNavigate }) => {
    const safetyCategories = [
        {
            icon: Users,
            title: "Meeting Safely | Te Hui Mā te Haumaru",
            teReo: "Te hui mā te haumaru",
            description: "Stay safe when meeting buyers or sellers in person",
            tips: [
                {
                    title: "Choose Public Places | Kōwhiria ngā Wāhi Tūmatanui",
                    content: "Always meet in well-lit, public areas like shopping centers, cafes, or police stations. Avoid meeting at home or in isolated locations.",
                    icon: MapPin,
                    type: "do"
                },
                {
                    title: "Bring a Friend | Kawea he Hoa",
                    content: "Consider bringing a friend or family member with you, especially for high-value transactions or when meeting someone for the first time.",
                    icon: Users,
                    type: "do"
                },
                {
                    title: "Meet During Daylight | Hui i te Ao",
                    content: "Schedule meetings during daylight hours when possible. If you must meet at night, choose well-lit, busy locations.",
                    icon: Clock,
                    type: "do"
                },
                {
                    title: "Trust Your Instincts | Whakapono ki Ō Mōhio",
                    content: "If something feels wrong or suspicious, don't proceed with the transaction. It's better to be safe than sorry.",
                    icon: AlertTriangle,
                    type: "do"
                }
            ]
        },
        {
            icon: DollarSign,
            title: "Payment Safety | Te Haumaru Utu",
            teReo: "Te haumaru o te utu",
            description: "Protect yourself from payment scams and fraud",
            tips: [
                {
                    title: "Use Secure Payment Methods | Whakamahi Tikanga Utu Haumaru",
                    content: "Always use our secure payment system or cash for in-person transactions. Avoid bank transfers to unknown accounts.",
                    icon: Lock,
                    type: "do"
                },
                {
                    title: "Verify Before Paying | Whakamana i Mua i te Utu",
                    content: "Double-check the item description, photos, and seller information before making any payment.",
                    icon: Eye,
                    type: "do"
                },
                {
                    title: "Avoid Overpayment Scams | Ārai i ngā Hē Utu Nui",
                    content: "Be wary of buyers who offer to pay more than the asking price and ask for a refund of the difference.",
                    icon: XCircle,
                    type: "avoid"
                },
                {
                    title: "Keep Records | Pupuri Rēkōta",
                    content: "Save all communication, receipts, and transaction details. This helps if you need to report a problem later.",
                    icon: CheckCircle,
                    type: "do"
                }
            ]
        },
        {
            icon: MessageCircle,
            title: "Communication Safety | Te Haumaru Kōrero",
            teReo: "Te haumaru o te kōrero",
            description: "Stay safe in your communications with other users",
            tips: [
                {
                    title: "Keep Communication on Platform | Pupuri Kōrero i te Pātaka",
                    content: "Use our built-in messaging system rather than moving to external platforms. This keeps your communications secure and traceable.",
                    icon: MessageCircle,
                    type: "do"
                },
                {
                    title: "Be Cautious with Personal Info | Māhaki ki ngā Mōhiohio Whaiaro",
                    content: "Don't share personal information like your home address, phone number, or financial details until you're ready to complete a transaction.",
                    icon: Shield,
                    type: "do"
                },
                {
                    title: "Watch for Red Flags | Mātiro i ngā Kara Whero",
                    content: "Be suspicious of users who pressure you to act quickly, offer deals that seem too good to be true, or ask for unusual payment methods.",
                    icon: AlertTriangle,
                    type: "avoid"
                },
                {
                    title: "Report Suspicious Activity | Pūrongo i ngā Mahi Huna",
                    content: "If you encounter suspicious behavior, report it immediately. Your report helps keep the community safe.",
                    icon: CheckCircle,
                    type: "do"
                }
            ]
        },
        {
            icon: Eye,
            title: "Verification & Trust | Whakamana me te Whakapono",
            teReo: "Whakamana me te whakapono",
            description: "How to verify users and build trust safely",
            tips: [
                {
                    title: "Check User Profiles | Tirohia ngā Kōtaha Kaiwhakamahi",
                    content: "Look for verification badges, read reviews, and check how long the user has been on the platform.",
                    icon: Star,
                    type: "do"
                },
                {
                    title: "Read Reviews Carefully | Pānui Ngā Arotake Māhaki",
                    content: "Pay attention to both positive and negative reviews. Look for patterns in feedback that might indicate problems.",
                    icon: Eye,
                    type: "do"
                },
                {
                    title: "Ask Questions | Pātai Pātai",
                    content: "Don't hesitate to ask questions about the item, seller, or transaction. Genuine sellers will be happy to provide information.",
                    icon: MessageCircle,
                    type: "do"
                },
                {
                    title: "Start Small | Tīmata Iti",
                    content: "For new users or high-value items, consider starting with smaller transactions to build trust gradually.",
                    icon: CheckCircle,
                    type: "do"
                }
            ]
        }
    ];

    const redFlags = [
        {
            icon: DollarSign,
            title: "Too Good to Be True | Rawa Pai Ki te Pono",
            description: "Prices significantly below market value or offers that seem unrealistic"
        },
        {
            icon: Clock,
            title: "Pressure to Act Fast | Pēhanga Ki te Mahi Tere",
            description: "Urgency tactics or pressure to complete transactions quickly"
        },
        {
            icon: Phone,
            title: "Avoiding Platform | Te Ārai i te Pātaka",
            description: "Requests to communicate or pay outside the platform"
        },
        {
            icon: Users,
            title: "Vague or Inconsistent | Mārama Kore me te Hē",
            description: "Unclear item descriptions, inconsistent photos, or evasive answers"
        }
    ];

    const emergencyContacts = [
        {
            title: "TuiTrade Support | Tautoko TuiTrade",
            phone: "0800 123 456",
            email: "safety@tuitrade.co.nz",
            description: "Report safety concerns or suspicious activity"
        },
        {
            title: "New Zealand Police | Ngā Pirihimana o Aotearoa",
            phone: "111 (Emergency)",
            email: "",
            description: "For immediate safety threats or criminal activity"
        },
        {
            title: "Consumer Protection | Te Tiaki Kaihoko",
            phone: "0800 943 600",
            email: "info@consumerprotection.govt.nz",
            description: "For consumer rights and protection issues"
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
                                <h1 className="text-xl font-semibold text-gray-900">Safety Tips | Ngā Tohutohu Haumaru</h1>
                                <p className="text-sm text-gray-500">Stay safe while buying and selling</p>
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
                        <h2 className="text-3xl font-bold mb-4">Stay Safe on TuiTrade | Kia Haumaru i TuiTrade</h2>
                        <p className="text-xl mb-6">Your safety is our top priority. Follow these guidelines to protect yourself</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Verified tips</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span>Red flags</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="w-5 h-5" />
                                <span>Emergency contacts</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Safety Categories */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Safety Guidelines | Ngā Aratohu Haumaru</h3>
                    <div className="space-y-8">
                        {safetyCategories.map((category, index) => {
                            const IconComponent = category.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <IconComponent className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900">{category.title}</h4>
                                            <p className="text-gray-600 italic text-sm">{category.teReo}</p>
                                            <p className="text-gray-700 mt-1">{category.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {category.tips.map((tip, tipIndex) => {
                                            const TipIcon = tip.icon;
                                            return (
                                                <div key={tipIndex} className={`rounded-lg p-4 border ${tip.type === 'do'
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-red-50 border-red-200'
                                                    }`}>
                                                    <div className="flex items-start space-x-3">
                                                        <div className={`p-2 rounded-full ${tip.type === 'do'
                                                                ? 'bg-green-100'
                                                                : 'bg-red-100'
                                                            }`}>
                                                            <TipIcon className={`w-5 h-5 ${tip.type === 'do'
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                                }`} />
                                                        </div>
                                                        <div>
                                                            <h5 className={`font-semibold mb-2 ${tip.type === 'do'
                                                                    ? 'text-green-800'
                                                                    : 'text-red-800'
                                                                }`}>
                                                                {tip.title}
                                                            </h5>
                                                            <p className={`text-sm ${tip.type === 'do'
                                                                    ? 'text-green-700'
                                                                    : 'text-red-700'
                                                                }`}>
                                                                {tip.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Red Flags Section */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Red Flags to Watch For | Ngā Kara Whero Mātiro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {redFlags.map((flag, index) => {
                            const FlagIcon = flag.icon;
                            return (
                                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                    <FlagIcon className="w-8 h-8 text-red-600 mx-auto mb-3" />
                                    <h4 className="font-semibold text-red-800 mb-2">{flag.title}</h4>
                                    <p className="text-red-700 text-sm">{flag.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Emergency Contacts | Ngā Whakapā Ohorere</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {emergencyContacts.map((contact, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                <h4 className="font-semibold text-gray-900 mb-3">{contact.title}</h4>
                                <p className="text-gray-600 text-sm mb-4">{contact.description}</p>
                                <div className="space-y-2">
                                    {contact.phone && (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900 font-semibold">{contact.phone}</span>
                                        </div>
                                    )}
                                    {contact.email && (
                                        <div className="flex items-center justify-center space-x-2">
                                            <MessageCircle className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900 font-semibold text-sm">{contact.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Safety Commitment */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
                    <Shield className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Our Safety Commitment | Tō Mātou Kupu Taurangi Haumaru</h3>
                    <p className="text-lg mb-6">
                        We're committed to keeping our community safe. We have dedicated teams monitoring for suspicious activity,
                        and we work closely with law enforcement when needed.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="w-5 h-5" />
                            <span>24/7 Safety Monitoring</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <Shield className="w-5 h-5" />
                            <span>Buyer Protection</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>Community Guidelines</span>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help? | Kua hiahia āwhina?</h3>
                    <p className="text-gray-600 mb-6">If you encounter any safety concerns, don't hesitate to reach out</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('contact-us')}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                            Report Safety Issue | Pūrongo Raruraru Haumaru
                        </button>
                        <button
                            onClick={() => onNavigate('help-center')}
                            className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Safety Help Center | Pokapū Āwhina Haumaru
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyTipsPage; 