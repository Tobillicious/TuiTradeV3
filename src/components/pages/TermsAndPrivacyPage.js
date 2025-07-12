// src/components/pages/TermsAndPrivacyPage.js
import React, { useState } from 'react';
import { ArrowLeft, Shield, FileText, Eye, Lock, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';

const TermsAndPrivacyPage = ({ onNavigate }) => {
    const [activeSection, setActiveSection] = useState('terms');
    const [expandedTerms, setExpandedTerms] = useState(null);
    const [expandedPrivacy, setExpandedPrivacy] = useState(null);

    const termsSections = [
        {
            id: 'general',
            title: "General Terms | Ngā Tikanga Whānui",
            teReo: "Ngā tikanga whānui mō te whakamahi",
            content: [
                {
                    title: "Acceptance of Terms | Te Whakaaetanga o ngā Tikanga",
                    text: "By using TuiTrade, you agree to be bound by these terms and conditions. These terms apply to all users of the platform, including buyers, sellers, and visitors."
                },
                {
                    title: "Eligibility | Te Whai Wāhi",
                    text: "You must be at least 18 years old to use TuiTrade. You must have the legal capacity to enter into binding agreements. Users must provide accurate and complete information."
                },
                {
                    title: "Account Responsibility | Te Kawenga Pūkete",
                    text: "You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized use of your account."
                }
            ]
        },
        {
            id: 'buying-selling',
            title: "Buying and Selling | Te Hoko me te Hoko Atu",
            teReo: "Ngā tikanga mō te hoko me te hoko atu",
            content: [
                {
                    title: "Listing Requirements | Ngā Whakaritenga Rārangi",
                    text: "All listings must be accurate, complete, and truthful. Items must be legal to sell in New Zealand. Photos must be of the actual item being sold."
                },
                {
                    title: "Payment and Delivery | Te Utu me te Tukunga",
                    text: "Buyers must pay for items within the agreed timeframe. Sellers must ship items within 2 business days of receiving payment. Both parties must communicate promptly."
                },
                {
                    title: "Returns and Refunds | Te Whakahoki me te Whakahoki Moni",
                    text: "Returns are subject to seller's return policy. TuiTrade may mediate disputes and may provide refunds under buyer protection policies."
                }
            ]
        },
        {
            id: 'prohibited',
            title: "Prohibited Items and Activities | Ngā Taonga me ngā Mahi Kua Āraihia",
            teReo: "Ngā taonga me ngā mahi kua āraihia",
            content: [
                {
                    title: "Illegal Items | Ngā Taonga Hē",
                    text: "You may not list items that are illegal to sell, possess, or import in New Zealand. This includes drugs, weapons, counterfeit goods, and stolen items."
                },
                {
                    title: "Fraudulent Activity | Ngā Mahi Hē",
                    text: "Any form of fraud, misrepresentation, or deceptive practices is strictly prohibited. This includes fake listings, price manipulation, and identity theft."
                },
                {
                    title: "Spam and Harassment | Te Tuku Karere Tūkino me te Whakaweti",
                    text: "Users may not spam other users or engage in harassment, threats, or abusive behavior. Respectful communication is required at all times."
                }
            ]
        },
        {
            id: 'liability',
            title: "Limitation of Liability | Te Whakaiti Kawenga",
            teReo: "Te whakaiti i ngā kawenga",
            content: [
                {
                    title: "Platform Liability | Te Kawenga Pātaka",
                    text: "TuiTrade acts as a platform connecting buyers and sellers. We are not responsible for the quality, safety, or legality of items listed by users."
                },
                {
                    title: "User Disputes | Ngā Tautohe Kaiwhakamahi",
                    text: "Disputes between users are primarily the responsibility of the parties involved. TuiTrade may provide mediation services but is not liable for user losses."
                },
                {
                    title: "Force Majeure | Ngā Kaha Nui",
                    text: "TuiTrade is not liable for service interruptions caused by events beyond our control, including natural disasters, government actions, or technical failures."
                }
            ]
        }
    ];

    const privacySections = [
        {
            id: 'collection',
            title: "Information We Collect | Ngā Mōhiohio Ka Kohia e Mātou",
            teReo: "Ngā mōhiohio ka kohia e mātou",
            content: [
                {
                    title: "Personal Information | Ngā Mōhiohio Whaiaro",
                    text: "We collect information you provide, including name, email, phone number, address, and payment information. We also collect information about your listings and transactions."
                },
                {
                    title: "Usage Information | Ngā Mōhiohio Whakamahi",
                    text: "We collect information about how you use our platform, including pages visited, searches performed, and interactions with other users."
                },
                {
                    title: "Device Information | Ngā Mōhiohio Pūrere",
                    text: "We collect technical information about your device, including IP address, browser type, and operating system for security and analytics purposes."
                }
            ]
        },
        {
            id: 'use',
            title: "How We Use Your Information | Me Pēhea Mātou e Whakamahi ai i Ō Mōhiohio",
            teReo: "Me pēhea mātou e whakamahi ai i ō mōhiohio",
            content: [
                {
                    title: "Service Provision | Te Tuku Ratonga",
                    text: "We use your information to provide our marketplace services, process transactions, and communicate with you about your account and listings."
                },
                {
                    title: "Safety and Security | Te Haumaru me te Haumaru",
                    text: "We use information to verify user identities, prevent fraud, and maintain the safety and security of our platform and community."
                },
                {
                    title: "Improvement and Analytics | Te Whakapai me ngā Tātai",
                    text: "We analyze usage patterns to improve our services, develop new features, and provide personalized recommendations."
                }
            ]
        },
        {
            id: 'sharing',
            title: "Information Sharing | Te Tiriti Mōhiohio",
            teReo: "Te tiriti i ngā mōhiohio",
            content: [
                {
                    title: "With Other Users | Ki Ētahi Kaiwhakamahi",
                    text: "We share limited information with other users as necessary for transactions, including your name, location, and feedback ratings."
                },
                {
                    title: "Service Providers | Ngā Kaiwhakarato Ratonga",
                    text: "We share information with trusted service providers who help us operate our platform, including payment processors and shipping partners."
                },
                {
                    title: "Legal Requirements | Ngā Whakaritenga Ture",
                    text: "We may share information when required by law, to protect our rights, or to investigate potential violations of our terms."
                }
            ]
        },
        {
            id: 'rights',
            title: "Your Rights | Ō Māu Tika",
            teReo: "Ō māu tika",
            content: [
                {
                    title: "Access and Correction | Te Urunga me te Whakatika",
                    text: "You have the right to access and correct your personal information. You can update most information through your account settings."
                },
                {
                    title: "Deletion | Te Whakakore",
                    text: "You may request deletion of your account and personal information, subject to our legal obligations to retain certain information."
                },
                {
                    title: "Data Portability | Te Kawe Mōhiohio",
                    text: "You have the right to receive a copy of your personal information in a portable format for transfer to another service."
                }
            ]
        }
    ];

    const cookies = [
        {
            name: "Essential Cookies",
            description: "Required for basic platform functionality",
            examples: "Authentication, security, session management",
            duration: "Session to 1 year"
        },
        {
            name: "Analytics Cookies",
            description: "Help us understand how users interact with our platform",
            examples: "Page views, user behavior, performance metrics",
            duration: "2 years"
        },
        {
            name: "Marketing Cookies",
            description: "Used for personalized advertising and recommendations",
            examples: "Ad preferences, retargeting, social media integration",
            duration: "1-2 years"
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
                                <h1 className="text-xl font-semibold text-gray-900">Terms & Privacy | Ngā Tikanga me te Tūmataiti</h1>
                                <p className="text-sm text-gray-500">Legal information and privacy policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveSection('terms')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeSection === 'terms'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FileText className="inline w-4 h-4 mr-2" />
                                Terms of Service
                            </button>
                            <button
                                onClick={() => setActiveSection('privacy')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeSection === 'privacy'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Shield className="inline w-4 h-4 mr-2" />
                                Privacy Policy
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Terms of Service */}
                {activeSection === 'terms' && (
                    <div>
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
                            <FileText className="w-16 h-16 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold mb-4 text-center">Terms of Service | Ngā Tikanga Ratonga</h2>
                            <p className="text-xl text-center opacity-90">
                                Last updated: {new Date().toLocaleDateString('en-NZ')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {termsSections.map((section) => (
                                <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => setExpandedTerms(expandedTerms === section.id ? null : section.id)}
                                        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                                                <p className="text-gray-600 italic text-sm">{section.teReo}</p>
                                            </div>
                                            {expandedTerms === section.id ? (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    {expandedTerms === section.id && (
                                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                                            <div className="space-y-6">
                                                {section.content.map((item, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                                        <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                                                        <p className="text-gray-700">{item.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Privacy Policy */}
                {activeSection === 'privacy' && (
                    <div>
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
                            <Shield className="w-16 h-16 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold mb-4 text-center">Privacy Policy | Te Kaupapa Tūmataiti</h2>
                            <p className="text-xl text-center opacity-90">
                                Last updated: {new Date().toLocaleDateString('en-NZ')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {privacySections.map((section) => (
                                <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => setExpandedPrivacy(expandedPrivacy === section.id ? null : section.id)}
                                        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                                                <p className="text-gray-600 italic text-sm">{section.teReo}</p>
                                            </div>
                                            {expandedPrivacy === section.id ? (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    {expandedPrivacy === section.id && (
                                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                                            <div className="space-y-6">
                                                {section.content.map((item, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                                        <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                                                        <p className="text-gray-700">{item.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Cookies Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cookie Policy | Te Kaupapa Kuki</h3>
                                <p className="text-gray-700 mb-6">
                                    We use cookies and similar technologies to enhance your experience on TuiTrade.
                                </p>

                                <div className="space-y-4">
                                    {cookies.map((cookie, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">{cookie.name}</h4>
                                                <span className="text-sm text-gray-500">{cookie.duration}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm mb-2">{cookie.description}</p>
                                            <p className="text-gray-600 text-sm">
                                                <strong>Examples:</strong> {cookie.examples}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Information */}
                <div className="mt-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Questions About Our Terms or Privacy? | He Pātai Mō Ō Mātou Tikanga Rānei Tūmataiti?</h3>
                    <p className="text-lg mb-6">Contact our legal team for clarification on any terms or privacy matters</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate('contact-us')}
                            className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Contact Legal Team | Whakapā ki te Tīma Ture
                        </button>
                        <button
                            onClick={() => onNavigate('help-center')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-700 transition-colors"
                        >
                            Help Center | Pokapū Āwhina
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndPrivacyPage;