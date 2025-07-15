// Help Center - Comprehensive support for life-changing platform
// Designed to empower users and maximize their positive impact throughout TuiTrade
// Every help article focuses on enabling users to change lives and create social impact

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, HelpCircle, MessageCircle, Phone, Mail, FileText, Shield, DollarSign, Truck, User, Settings, ShoppingBag, CreditCard, AlertTriangle, CheckCircle, ChevronDown, ChevronRight, Heart, Star, Globe, Award, Zap, Users, Target, Home, Baby, Briefcase, BookOpen, Sparkles } from 'lucide-react';

const HelpCenterPage = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const helpCategories = [
        {
            icon: Heart,
            title: "Life-Changing Impact | Tawhiti Taiao",
            teReo: "Ngā pānga whakataone oranga",
            description: "How every transaction on TuiTrade changes lives across Aotearoa",
            articles: [
                {
                    title: "Understanding TuiTrade's mission | Te Whakatōhea o TuiTrade",
                    content: "Learn how every purchase, sale, and connection on TuiTrade contributes to breaking cycles of poverty and creating opportunities for struggling families. Our platform prioritizes social impact over profit."
                },
                {
                    title: "How your purchases help families | Me pēhea ō hoko e āwhina ai ngā whānau",
                    content: "When you buy on TuiTrade, you're directly supporting families in need. Sellers often use income to fund their children's education, pay for medical treatments, or achieve housing stability."
                },
                {
                    title: "Creating meaningful job opportunities | Te waihanga mahi whakatōhea",
                    content: "Every job posting creates hope for unemployed individuals. Learn how to post jobs that prioritize potential over perfection, giving opportunities to those who need them most."
                },
                {
                    title: "Building community connections | Te hanga hononga hapori",
                    content: "Discover how neighborhood features, mentorship opportunities, and community support networks transform isolated individuals into connected community members."
                }
            ]
        },
        {
            icon: ShoppingBag,
            title: "Buying & Selling | Hoko me Hoko",
            teReo: "Hoko me te hoko atu",
            description: "Safe transactions that create positive social impact",
            articles: [
                {
                    title: "How to buy with purpose | Me pēhea te hoko mā te take",
                    content: "Learn how to choose purchases that support families in need, verify life-changing impact claims, and maximize the social benefit of your spending through TuiTrade."
                },
                {
                    title: "Creating impact-focused listings | Me pēhea te hanga rārangi whakatōhea",
                    content: "Guide to creating listings that highlight how sales will change your life - whether funding education, supporting family, or achieving stability. Include your story to connect with buyers."
                },
                {
                    title: "Safe payment methods | Ngā tikanga utu haumaru",
                    content: "Information about secure payment methods that protect both buyers and sellers, ensuring funds reach families in need safely while maintaining transaction security."
                },
                {
                    title: "Supporting local families | Te tautoko i ngā whānau taone",
                    content: "How to prioritize purchases from local families, understand delivery challenges for struggling sellers, and create supportive buyer-seller relationships."
                }
            ]
        },
        {
            icon: Users,
            title: "Jobs & Opportunities | Mahi me ngā Ritenga",
            teReo: "Ngā mahi me ngā ritenga whaihua",
            description: "Employment opportunities that change lives and build careers",
            articles: [
                {
                    title: "Finding life-changing employment | Te kimi mahi whakataone oranga",
                    content: "How to search for jobs that offer genuine opportunities for growth, support for personal circumstances, and employers who prioritize people over just skills. Filter for family-friendly and inclusive workplaces."
                },
                {
                    title: "Creating inclusive job postings | Te waihanga whakatau mahi",
                    content: "Guide for employers to create job listings that welcome diverse candidates, offer skill development, and provide opportunities for people rebuilding their lives or changing careers."
                },
                {
                    title: "Supporting unemployed community members | Te tautoko i ngā kore mahi",
                    content: "How to connect unemployed neighbors with opportunities, mentor job seekers, and create employment pathways for people facing barriers to traditional hiring."
                },
                {
                    title: "Remote work for parents and caregivers | Mahi tawhiti mō mātua",
                    content: "Finding and creating remote work opportunities that allow parents and caregivers to earn income while maintaining family responsibilities and stability."
                }
            ]
        },
        {
            icon: Home,
            title: "Housing & Stability | Whare me te Ū",
            teReo: "Ngā whare me te whakatau",
            description: "Safe, affordable housing that builds family stability",
            articles: [
                {
                    title: "Finding family-friendly housing | Te kimi whare whānau",
                    content: "How to search for affordable rentals that welcome families, understand landlord preferences for stable tenants, and present your family in the best light for housing applications."
                },
                {
                    title: "Supporting families in housing crisis | Te tautoko whānau whare",
                    content: "How community members can help families find emergency accommodation, connect with housing resources, and provide references or guarantees for struggling families."
                },
                {
                    title: "Creating inclusive rental listings | Te waihanga raina whare",
                    content: "Guide for landlords to create welcoming rental listings, understand tenant challenges, and prioritize stable family housing over maximum profit."
                },
                {
                    title: "Pathway to homeownership | Te ara ki te rangatira whare",
                    content: "Resources and connections for families working toward purchasing their first home, including shared equity schemes and community support programs."
                }
            ]
        },
        {
            icon: User,
            title: "Account & Verification | Pūkete me te Whakamana",
            teReo: "Pūkete me te whakamana tangata",
            description: "Building trust and credibility for maximum impact",
            articles: [
                {
                    title: "Building a trustworthy profile | Te hanga kōtaha pono",
                    content: "How to create a profile that demonstrates your commitment to changing lives, share your story authentically, and build credibility within the TuiTrade community."
                },
                {
                    title: "Privacy for families in need | Tūmataiti mō whānau hiakai",
                    content: "How to protect your family's privacy while sharing enough information to build trust, manage personal information safely, and control who sees your circumstances."
                },
                {
                    title: "Verification for community trust | Whakamana mō te whakapono",
                    content: "How verification builds community trust, what documents are needed, and why verified users create more life-changing opportunities and connections."
                }
            ]
        },
        {
            icon: Shield,
            title: "Safety & Protection | Haumaru me te Tiaki",
            teReo: "Haumaru me te tiaki whānau",
            description: "Protecting families while building community trust",
            articles: [
                {
                    title: "Protecting vulnerable community members | Te tiaki hapori",
                    content: "How our protection systems specifically support families in crisis, elderly community members, and those facing financial hardship. Special safeguards for life-changing transactions."
                },
                {
                    title: "Recognizing genuine need vs exploitation | Te motuhake pono",
                    content: "How to identify authentic families in need versus those who might exploit community generosity. Red flags and verification methods to ensure help reaches those who truly need it."
                },
                {
                    title: "Safe community meetings | Te hui haumaru hapori",
                    content: "Guidelines for safely meeting community members, especially when supporting families in vulnerable situations. Recommended meeting places and safety protocols for high-impact interactions."
                },
                {
                    title: "Reporting concerning behavior | Te pūrongo whakaaro",
                    content: "How to report suspicious activity that might harm vulnerable community members, including financial exploitation, unsafe situations, or misuse of community support."
                }
            ]
        },
        {
            icon: Sparkles,
            title: "Community Impact | Pānga Hapori",
            teReo: "Ngā pānga whakataone hapori",
            description: "Maximizing your positive impact within the TuiTrade community",
            articles: [
                {
                    title: "Becoming a community champion | He rangatira hapori",
                    content: "How to earn community badges, build reputation through helping others, and become a trusted leader who creates opportunities for families in need."
                },
                {
                    title: "Mentoring and skill sharing | Te tohungatanga me te whakatipu",
                    content: "Ways to share your skills with community members, mentor job seekers, and create educational opportunities that lead to long-term life changes."
                },
                {
                    title: "Organizing community support | Te whakahaere tautoko hapori",
                    content: "How to coordinate neighborhood support for families in crisis, organize group purchases to help struggling businesses, and create lasting community connections."
                },
                {
                    title: "Measuring your impact | Te ine i tō pānga",
                    content: "Track the lives you've helped change through TuiTrade, understand your community impact score, and see how your actions contribute to breaking cycles of poverty."
                }
            ]
        },
        {
            icon: Settings,
            title: "Technical Support | Tautoko Hangarau",
            teReo: "Tautoko mō ngā raruraru hangarau",
            description: "Getting technical help to maximize your platform impact",
            articles: [
                {
                    title: "Accessibility features | Ngā āhuatanga uru whānui",
                    content: "How to use TuiTrade's accessibility features, screen reader support, voice navigation, and adaptive technologies to ensure everyone can participate in life-changing opportunities."
                },
                {
                    title: "Mobile app for families on-the-go | Taupānga pūkoro whānau",
                    content: "Using TuiTrade mobile features effectively, offline capabilities for limited data situations, and quick access to urgent opportunities and support."
                },
                {
                    title: "Photo and listing optimization | Whakamana whakaahua",
                    content: "How to create compelling photos and listings even with basic equipment, storytelling techniques for maximum impact, and presenting your needs authentically."
                }
            ]
        }
    ];

    const faqs = [
        {
            question: "How does TuiTrade actually change lives? | Me pēhea a TuiTrade e whakataone ai ngā oranga?",
            answer: "Every transaction creates real impact: sales fund children's education and medical care, job postings provide hope for unemployed families, housing connections stabilize struggling households, and community networks support isolated individuals. We document and track these life changes through our platform."
        },
        {
            question: "How can I help families in my community through TuiTrade? | Me pēhea au e āwhina ai ngā whānau i tōku hapori?",
            answer: "You can buy from families in need, offer employment opportunities, provide housing or references, mentor job seekers, share skills and knowledge, or simply connect isolated community members with support networks. Every positive interaction creates ripple effects of change."
        },
        {
            question: "What if I'm struggling financially myself? | Me aha mēnā he uaua ōku moni?",
            answer: "TuiTrade is designed for mutual support. Share your skills through jobs or services, sell items you no longer need, connect with neighbors for support, access community resources, and remember that small actions like kind messages or connections can create value even without money."
        },
        {
            question: "How do I verify that my help is actually making a difference? | Me pēhea au e mōhio ai he rerekē taku āwhina?",
            answer: "Our platform tracks impact through user updates, community feedback, achievement systems, and life change documentation. You'll receive notifications when your actions lead to positive outcomes, and can see long-term progress through our impact dashboard."
        },
        {
            question: "What happens if someone takes advantage of community generosity? | Me aha mēnā ka whakamahi kē tētahi i te atawhai o te hapori?",
            answer: "We have verification systems, community reporting, and impact tracking to ensure help reaches genuine need. Our trust scores, review systems, and community oversight help identify and prevent exploitation while protecting those who truly need support."
        },
        {
            question: "How can businesses create meaningful employment opportunities? | Me pēhea ngā pakihi e waihanga ai ngā ritenga mahi whai take?",
            answer: "Post jobs that prioritize potential over perfection, offer skill development and mentorship, provide family-friendly policies, consider remote work options, and focus on giving opportunities to people who've faced barriers to traditional employment. Small businesses often create the most meaningful impact."
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

                {/* Life-Changing Mission Section */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center mb-8">
                    <Heart className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Ready to Change Lives? | Kua rite ki te whakataone oranga?</h3>
                    <p className="text-lg mb-6">Every question you ask and action you take brings our community closer to transforming lives across Aotearoa</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <Target className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-2xl font-bold">247+</div>
                            <div className="text-sm">Lives Changed</div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <Users className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-2xl font-bold">50+</div>
                            <div className="text-sm">Children Helped</div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <Award className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-sm">Jobs Created</div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Contact Support | Whakapā atu ki te Tautoko
                        </button>
                        <button
                            onClick={() => onNavigate('home')}
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                        >
                            Start Changing Lives | Tīmata te whakataone oranga
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage; 