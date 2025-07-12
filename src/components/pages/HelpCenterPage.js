// src/components/pages/HelpCenterPage.js
import React, { useState } from 'react';
import { ArrowLeft, Search, HelpCircle, MessageCircle, Phone, Mail, FileText, Shield, DollarSign, Truck, User, Settings, ShoppingBag, CreditCard, AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';

const HelpCenterPage = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const helpCategories = [
        {
            icon: ShoppingBag,
            title: "Buying & Selling | Hoko me Hoko",
            teReo: "Hoko me te hoko atu",
            description: "Everything about buying and selling on TuiTrade",
            articles: [
                {
                    title: "How to buy safely | Me pēhea te hoko mā te haumaru",
                    content: "Learn about our buyer protection policies, how to verify sellers, and what to do if something goes wrong with your purchase."
                },
                {
                    title: "How to create a listing | Me pēhea te hanga rārangi",
                    content: "Step-by-step guide to creating effective listings with great photos, descriptions, and pricing strategies."
                },
                {
                    title: "Payment methods | Ngā tikanga utu",
                    content: "Information about accepted payment methods, how payments work, and security measures in place."
                },
                {
                    title: "Shipping and delivery | Tukunga me te tuku",
                    content: "Guidelines for shipping items, tracking packages, and handling delivery issues."
                }
            ]
        },
        {
            icon: User,
            title: "Account & Profile | Pūkete me te Kōtaha",
            teReo: "Pūkete me te kōtaha tangata",
            description: "Managing your account, profile, and settings",
            articles: [
                {
                    title: "Creating and managing your account | Te hanga me te whakahaere i tō pūkete",
                    content: "How to create an account, update your profile, change settings, and manage your personal information."
                },
                {
                    title: "Privacy and security | Tūmataiti me te haumaru",
                    content: "How we protect your data, privacy settings, and security best practices for your account."
                },
                {
                    title: "Verification process | Te tukanga whakamana",
                    content: "How to verify your account, why verification is important, and what documents are required."
                }
            ]
        },
        {
            icon: Shield,
            title: "Safety & Trust | Haumaru me te Whakapono",
            teReo: "Haumaru me te whakapono",
            description: "Staying safe and building trust on the platform",
            articles: [
                {
                    title: "Buyer protection | Te tiaki kaihoko",
                    content: "How our buyer protection works, what's covered, and how to file a claim if needed."
                },
                {
                    title: "Avoiding scams | Te ārai i ngā hē",
                    content: "Common scam tactics to watch out for, red flags, and how to report suspicious activity."
                },
                {
                    title: "Meeting safely | Te hui mā te haumaru",
                    content: "Safety tips for meeting buyers or sellers in person, recommended meeting places, and precautions."
                }
            ]
        },
        {
            icon: Settings,
            title: "Technical Support | Tautoko Hangarau",
            teReo: "Tautoko mō ngā raruraru hangarau",
            description: "Technical issues and platform problems",
            articles: [
                {
                    title: "App and website issues | Ngā raruraru o te taupānga me te paetukutuku",
                    content: "Troubleshooting common app and website problems, browser compatibility, and performance issues."
                },
                {
                    title: "Photo upload problems | Ngā raruraru tuku whakaahua",
                    content: "How to upload photos, supported formats, size limits, and common upload issues."
                },
                {
                    title: "Messaging problems | Ngā raruraru kōrero",
                    content: "Issues with the messaging system, notifications, and communication features."
                }
            ]
        }
    ];

    const faqs = [
        {
            question: "How do I get my money back if I'm not happy with my purchase? | Me pēhea taku moni e whakahoki mai ai mēnā kāore au e pai ki taku hoko?",
            answer: "If you're not satisfied with your purchase, contact the seller first to try to resolve the issue. If that doesn't work, you can file a buyer protection claim within 30 days of purchase. We'll investigate and may provide a refund if the item doesn't match the description or if there are other valid issues."
        },
        {
            question: "What should I do if a seller doesn't respond to my messages? | Me aha ahau mēnā kāore te kaihoko e whakautu ki aku karere?",
            answer: "If a seller doesn't respond within 48 hours, you can report them for poor communication. We recommend waiting a reasonable time before escalating, as sellers may be busy or have technical issues. You can also try messaging them again or look for similar items from other sellers."
        },
        {
            question: "How do I know if a seller is trustworthy? | Me pēhea au e mōhio ai mēnā he pono te kaihoko?",
            answer: "Check the seller's profile for verification badges, read their reviews and ratings, look at their response time, and examine their listing history. Verified sellers with good ratings and positive reviews are generally more trustworthy. Always use our secure payment methods and buyer protection."
        },
        {
            question: "Can I cancel a purchase after I've paid? | Ka taea e au te whakakore i te hoko i muri i taku utu?",
            answer: "You can request a cancellation from the seller within 24 hours of payment. If the seller agrees, they can cancel the transaction and you'll receive a full refund. If the seller has already shipped the item, cancellation may not be possible. Check our cancellation policy for more details."
        },
        {
            question: "What payment methods are accepted? | He aha ngā tikanga utu e whakaaetia ana?",
            answer: "We accept major credit cards, debit cards, bank transfers, and digital wallets like PayPal. All payments are processed securely through our payment partners. We recommend using our secure payment system rather than paying outside the platform for better protection."
        }
    ];

    const contactMethods = [
        {
            icon: MessageCircle,
            title: "Live Chat | Kōrero Ora",
            description: "Get instant help from our support team",
            availability: "Available 24/7",
            action: "Start Chat"
        },
        {
            icon: Mail,
            title: "Email Support | Tautoko Īmēra",
            description: "Send us a detailed message",
            availability: "Response within 24 hours",
            action: "Send Email"
        },
        {
            icon: Phone,
            title: "Phone Support | Tautoko Waea",
            description: "Speak directly with our team",
            availability: "Mon-Fri, 9AM-6PM NZST",
            action: "Call Now"
        }
    ];

    const filteredCategories = helpCategories.filter(category =>
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.articles.some(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                <h1 className="text-xl font-semibold text-gray-900">Help Center | Pokapū Āwhina</h1>
                                <p className="text-sm text-gray-500">Find answers and get support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Section */}
                <div className="mb-12">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for help articles... | Rapu ngā tuhinga āwhina..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions | Ngā Mahi Tere</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactMethods.map((method, index) => {
                            const IconComponent = method.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                                    <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                                    <p className="text-blue-600 text-sm font-semibold mb-4">{method.availability}</p>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                                        {method.action}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Help Categories */}
                {searchQuery === '' && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Help Categories | Ngā Wāhanga Āwhina</h2>
                        <div className="space-y-4">
                            {helpCategories.map((category, index) => {
                                const IconComponent = category.icon;
                                const isExpanded = expandedCategory === index;

                                return (
                                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <button
                                            onClick={() => setExpandedCategory(isExpanded ? null : index)}
                                            className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <IconComponent className="w-6 h-6 text-blue-600" />
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{category.title}</h3>
                                                        <p className="text-gray-600 italic text-sm">{category.teReo}</p>
                                                        <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                                                    </div>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="border-t border-gray-200 p-6 bg-gray-50">
                                                <div className="space-y-4">
                                                    {category.articles.map((article, articleIndex) => (
                                                        <div key={articleIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                                            <h4 className="font-semibold text-gray-900 mb-2">{article.title}</h4>
                                                            <p className="text-gray-600 text-sm">{article.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {searchQuery !== '' && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results | Ngā Hua Rapu</h2>

                        {filteredCategories.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Help Articles | Ngā Tuhinga Āwhina</h3>
                                <div className="space-y-4">
                                    {filteredCategories.map((category, index) => (
                                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            <h4 className="font-semibold text-gray-900 mb-3">{category.title}</h4>
                                            <div className="space-y-3">
                                                {category.articles
                                                    .filter(article =>
                                                        article.title.toLowerCase().includes(searchQuery.toLowerCase())
                                                    )
                                                    .map((article, articleIndex) => (
                                                        <div key={articleIndex} className="border-l-4 border-blue-500 pl-4">
                                                            <h5 className="font-medium text-gray-900 mb-1">{article.title}</h5>
                                                            <p className="text-gray-600 text-sm">{article.content}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredFAQs.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions | Ngā Pātai Auau</h3>
                                <div className="space-y-4">
                                    {filteredFAQs.map((faq, index) => {
                                        const isExpanded = expandedFAQ === index;
                                        return (
                                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedFAQ(isExpanded ? null : index)}
                                                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-900">{faq.question}</span>
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                </button>
                                                {isExpanded && (
                                                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                                                        <p className="text-gray-700">{faq.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {filteredCategories.length === 0 && filteredFAQs.length === 0 && (
                            <div className="text-center py-12">
                                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found | Kāore he hua i kitea</h3>
                                <p className="text-gray-600">Try different keywords or contact our support team</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Contact Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Still need help? | Kua hiahia āwhina tonu?</h3>
                    <p className="text-lg mb-6">Our support team is here to help you with any questions or issues</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Contact Support | Whakapā atu ki te Tautoko
                        </button>
                        <button
                            onClick={() => onNavigate('home')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Back to Home | Hoki ki te Kāinga
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage; 