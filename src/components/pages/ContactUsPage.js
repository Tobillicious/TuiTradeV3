// src/components/pages/ContactUsPage.js
import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle, AlertCircle, User, FileText, Star } from 'lucide-react';

const ContactUsPage = ({ onNavigate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        { value: 'general', label: 'General Inquiry | Pātai Whānui' },
        { value: 'technical', label: 'Technical Support | Tautoko Hangarau' },
        { value: 'billing', label: 'Billing & Payments | Utu me ngā Tukunga' },
        { value: 'safety', label: 'Safety & Trust | Haumaru me te Whakapono' },
        { value: 'feedback', label: 'Feedback & Suggestions | Urupare me ngā Tohutohu' },
        { value: 'partnership', label: 'Partnership & Business | Mahi Tahi me te Pakihi' }
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

    const testimonials = [
        {
            name: "Kiri M.",
            location: "Wellington",
            rating: 5,
            comment: "The support team was incredibly helpful when I had issues with my first sale. They responded quickly and solved everything perfectly.",
            date: "2 days ago"
        },
        {
            name: "Tama R.",
            location: "Christchurch",
            rating: 5,
            comment: "Great customer service! They helped me understand the buyer protection process and made me feel confident about using the platform.",
            date: "1 week ago"
        },
        {
            name: "Aroha K.",
            location: "Auckland",
            rating: 5,
            comment: "Fast response time and very knowledgeable staff. They really care about their users and it shows in their service.",
            date: "3 days ago"
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
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Get in Touch | Whakapā Mai</h2>
                        <p className="text-xl mb-6">Our friendly team is ready to help with any questions or concerns</p>
                        <div className="flex justify-center space-x-8 text-sm">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" />
                                <span>24/7 Support</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Quick Response</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Star className="w-5 h-5" />
                                <span>Expert Help</span>
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions | Ngā Pātai Auau</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-2">How quickly do you respond? | Kia tere te whakautu?</h4>
                            <p className="text-gray-600 text-sm">We aim to respond to all inquiries within 24 hours. For urgent matters, live chat is available 24/7 for immediate assistance.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-2">What information should I include? | He aha ngā mōhiohio me tāpiri?</h4>
                            <p className="text-gray-600 text-sm">Please include your name, email, and a detailed description of your issue or question. Screenshots are helpful for technical problems.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-2">Can I call outside business hours? | Ka taea te waea i waho o ngā hāora mahi?</h4>
                            <p className="text-gray-600 text-sm">Our phone support is available Monday-Friday, 9AM-6PM NZST. For after-hours support, please use live chat or email.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-2">How do I report a problem? | Me pēhea te pūrongo i te raruraru?</h4>
                            <p className="text-gray-600 text-sm">You can report problems through our contact form, live chat, or by calling our support team. Please provide as much detail as possible.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage; 