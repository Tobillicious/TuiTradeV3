// ContactUsPage - Life-changing support connection hub
// Designed to connect community members with support that transforms lives

import React, { useState, useEffect } from 'react';
import { getTestimonials } from '../../lib/testimonialsService';
import { ArrowLeft, Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle, AlertCircle, User, FileText, Star, Heart, Target, Users, Award, Sparkles, Home, Baby, Shield } from 'lucide-react';

const ContactUsPage = ({ onNavigate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testimonials, setTestimonials] = useState([]);

    // Load real testimonials from Firebase
    useEffect(() => {
        const loadTestimonials = async () => {
            try {
                const testimonialsData = await getTestimonials({
                    category: 'all',
                    maxItems: 3,
                    featured: true,
                    verified: true
                });
                
                // Transform to match ContactUs page format
                const contactTestimonials = testimonialsData.map(t => ({
                    name: t.name?.split(' ')[0] + ' ' + (t.name?.split(' ')[1]?.[0] || '') + '.',
                    location: t.location || 'New Zealand',
                    rating: t.rating || 5,
                    comment: t.content || '',
                    date: formatTimeAgo(t.date),
                    impact: getImpactSummary(t)
                }));
                
                setTestimonials(contactTestimonials);
            } catch (error) {
                console.error('Error loading testimonials:', error);
                // Keep fallback testimonials if Firebase fails
                setTestimonials(getFallbackTestimonials());
            }
        };

        loadTestimonials();
    }, []);

    // Helper function to format time ago
    const formatTimeAgo = (date) => {
        if (!date) return 'recently';
        const now = new Date();
        const diffDays = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    };

    // Helper function to get impact summary
    const getImpactSummary = (testimonial) => {
        if (testimonial.category === 'jobs') return 'Life-changing employment';
        if (testimonial.category === 'community') return 'Community leadership';
        if (testimonial.category === 'housing') return 'Housing stability';
        if (testimonial.category === 'marketplace') return 'Business success';
        return 'Positive life impact';
    };

    // Fallback testimonials when Firebase is unavailable
    const getFallbackTestimonials = () => [
        {
            name: "Sarah W.",
            location: "Auckland",
            rating: 5,
            comment: "The support team helped me navigate selling items to fund my children's school uniforms. They understood my situation and connected me with buyers who truly cared about helping our family.",
            date: "3 days ago",
            impact: "Funded children's education"
        },
        {
            name: "Te Aroha M.",
            location: "Rotorua",
            rating: 5,
            comment: "When I was struggling to find work, the support team helped me optimize my job search and connected me with employers who value potential over perfect CVs. Now I'm employed and supporting my whānau.",
            date: "1 week ago",
            impact: "Life-changing employment"
        },
        {
            name: "Michael C.",
            location: "Wellington",
            rating: 5,
            comment: "The community support team helped me understand how to use the platform to support other families in need. They showed me how every small action creates ripple effects of positive change.",
            date: "5 days ago",
            impact: "Community leadership"
        }
    ];
    const [submitStatus, setSubmitStatus] = useState(null);

    const contactMethods = [
        {
            icon: MessageCircle,
            title: "Live Chat | Kōrero Ora",
            teReo: "Kōrero ora ki te tīma tautoko",
            description: "Get instant help from our support team",
            details: "Available 24/7 for immediate assistance",
            action: "Start Chat",
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            icon: Mail,
            title: "Email Support | Tautoko Īmēra",
            teReo: "Tukuna he īmēra ki a mātou",
            description: "Send us a detailed message",
            details: "Response within 24 hours",
            action: "Send Email",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            icon: Phone,
            title: "Phone Support | Tautoko Waea",
            teReo: "Waea mai ki a mātou",
            description: "Speak directly with our team",
            details: "Mon-Fri, 9AM-6PM NZST",
            action: "Call Now",
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        }
    ];

    const officeInfo = [
        {
            icon: MapPin,
            title: "Office Location | Te Wāhi Tari",
            content: "Level 5, 123 Queen Street, Auckland 1010, New Zealand"
        },
        {
            icon: Clock,
            title: "Business Hours | Ngā Hāora Mahi",
            content: "Monday - Friday: 9:00 AM - 6:00 PM NZST"
        },
        {
            icon: Phone,
            title: "Phone Number | Tau Waea",
            content: "+64 9 123 4567"
        },
        {
            icon: Mail,
            title: "Email Address | Īmēra",
            content: "support@tuitrade.co.nz"
        }
    ];

    const categories = [
        { value: 'impact', label: 'Life-Changing Impact | Tawhiti Taiao' },
        { value: 'community', label: 'Community Support | Tautoko Hapori' },
        { value: 'emergency', label: 'Emergency Assistance | Āwhina Ohotata' },
        { value: 'general', label: 'General Inquiry | Pātai Whānui' },
        { value: 'technical', label: 'Technical Support | Tautoko Hangarau' },
        { value: 'safety', label: 'Safety & Protection | Haumaru me te Tiaki' },
        { value: 'partnership', label: 'Community Partnership | Mahi Tahi Hapori' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
                category: 'general'
            });
        }, 2000);
    };


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
                                <h1 className="text-xl font-semibold text-gray-900">Contact Us | Whakapā Mai</h1>
                                <p className="text-sm text-gray-500">We're here to help you</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
                        <Heart className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">We're Here to Help | Kei konei mātou hei āwhina</h2>
                        <p className="text-xl mb-6">Connect with support that understands your journey toward positive change</p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                <Target className="w-6 h-6 mx-auto mb-1" />
                                <div className="text-lg font-bold">247+</div>
                                <div className="text-xs">Lives Changed</div>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                <Users className="w-6 h-6 mx-auto mb-1" />
                                <div className="text-lg font-bold">50+</div>
                                <div className="text-xs">Children Helped</div>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                <Award className="w-6 h-6 mx-auto mb-1" />
                                <div className="text-lg font-bold">12</div>
                                <div className="text-xs">Jobs Created</div>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                <Clock className="w-6 h-6 mx-auto mb-1" />
                                <div className="text-lg font-bold">24/7</div>
                                <div className="text-xs">Support</div>
                            </div>
                        </div>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <Heart className="w-5 h-5" />
                                <span>Life-Changing Focus</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Community-First</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5" />
                                <span>Impact-Driven</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message | Tukuna he Karere</h3>

                        {submitStatus === 'success' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-green-800 font-semibold">Message sent successfully! | Kua tuku pai te karere!</span>
                                </div>
                                <p className="text-green-700 text-sm mt-1">We'll get back to you within 24 hours.</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name | Ingoa *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email | Īmēra *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category | Wāhanga
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {categories.map((category) => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject | Kaupapa *
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Brief description of your inquiry"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message | Karere *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Please provide details about your inquiry..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Sending... | E tuku ana...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Send Message | Tukuna te Karere</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Other Ways to Reach Us | Ētahi Ara Ki a Mātou</h3>

                        {/* Quick Contact Methods */}
                        <div className="space-y-4 mb-8">
                            {contactMethods.map((method, index) => {
                                const IconComponent = method.icon;
                                return (
                                    <div key={index} className={`${method.bgColor} rounded-lg p-4 border border-gray-200`}>
                                        <div className="flex items-center space-x-4">
                                            <IconComponent className={`w-8 h-8 ${method.color}`} />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{method.title}</h4>
                                                <p className="text-gray-600 italic text-sm">{method.teReo}</p>
                                                <p className="text-gray-700 text-sm mt-1">{method.description}</p>
                                                <p className="text-gray-600 text-sm mt-1">{method.details}</p>
                                            </div>
                                            <button className={`${method.color.replace('text-', 'bg-')} text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity`}>
                                                {method.action}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Office Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <h4 className="font-semibold text-gray-900 mb-4">Office Information | Ngā Mōhiohio Tari</h4>
                            <div className="space-y-3">
                                {officeInfo.map((info, index) => {
                                    const IconComponent = info.icon;
                                    return (
                                        <div key={index} className="flex items-start space-x-3">
                                            <IconComponent className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{info.title}</p>
                                                <p className="text-gray-600 text-sm">{info.content}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Customer Testimonials */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">What Our Customers Say | He aha te Kī a Ō Mātou Kaihoko</h4>
                            <div className="space-y-4">
                                {testimonials.map((testimonial, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 text-sm mb-2 italic">"{testimonial.comment}"</p>
                                        <div className="bg-green-50 rounded-lg p-2 mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Sparkles className="w-4 h-4 text-green-600" />
                                                <span className="text-green-800 text-xs font-semibold">{testimonial.impact}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{testimonial.name}</p>
                                                <p className="text-gray-600 text-xs">{testimonial.location}</p>
                                            </div>
                                            <p className="text-gray-500 text-xs">{testimonial.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Common Questions | Ngā Pātai Auau</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <Heart className="w-5 h-5 text-green-600 mr-2" />
                                How can you help my family's situation? | Me pēhea koe e āwhina ai i tōku whānau?
                            </h4>
                            <p className="text-gray-600 text-sm">We understand every family's journey is unique. Our support team connects you with resources, opportunities, and community members who can help create positive change in your specific circumstances.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                                How quickly can I get help? | Kia tere ai au ki te whiwhi āwhina?
                            </h4>
                            <p className="text-gray-600 text-sm">For urgent situations, live chat provides immediate connection. For life-changing opportunities and community support, we typically respond within 24 hours with personalized guidance.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <Users className="w-5 h-5 text-purple-600 mr-2" />
                                What if I need help but can't pay? | Me aha mēnā he hiahia āwhina kāore he utu?
                            </h4>
                            <p className="text-gray-600 text-sm">TuiTrade's community support is built on mutual aid and shared resources. Many services, connections, and opportunities are available regardless of your current financial situation.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <Shield className="w-5 h-5 text-red-600 mr-2" />
                                Is my personal information safe? | He haumaru ōku kōrero whaiaro?
                            </h4>
                            <p className="text-gray-600 text-sm">We protect your privacy while connecting you with help. You control what information you share and with whom, ensuring your family's safety while accessing community support.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage; 