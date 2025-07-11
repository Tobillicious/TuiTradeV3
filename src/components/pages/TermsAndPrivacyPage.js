// src/components/pages/TermsAndPrivacyPage.js
import { Home, ChevronRight, Shield, Eye, Scale, Clock } from 'lucide-react';

const TermsAndPrivacyPage = ({ onNavigate }) => {
    return (
        <div className="bg-gray-50 flex-grow">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 flex items-center">
                        <Home size={16} className="mr-2" />
                        Home
                    </button>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="font-semibold text-gray-700">Terms & Privacy</span>
                </div>

                <div className="bg-white rounded-lg shadow-md">
                    {/* Header */}
                    <div className="bg-green-600 text-white p-6 rounded-t-lg">
                        <h1 className="text-3xl font-bold mb-2">Terms of Service & Privacy Policy</h1>
                        <p className="text-green-100">
                            Effective Date: {new Date().toLocaleDateString('en-NZ')}
                        </p>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Terms of Service */}
                        <section>
                            <div className="flex items-center mb-4">
                                <Scale className="w-6 h-6 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
                            </div>

                            <div className="space-y-6 text-gray-700">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
                                    <p>
                                        By accessing and using TuiTrade, you accept and agree to be bound by the terms and provision of this agreement. 
                                        TuiTrade is New Zealand's premier online marketplace connecting buyers and sellers across Aotearoa.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">2. User Responsibilities</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Provide accurate and truthful information in listings</li>
                                        <li>Honour all commitments made in transactions</li>
                                        <li>Treat all users with respect and courtesy</li>
                                        <li>Comply with all applicable New Zealand laws</li>
                                        <li>Not list prohibited or illegal items</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">3. Platform Fees</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Fixed-Price Listings:</strong> 5% final value fee</li>
                                        <li><strong>Auction Listings:</strong> 7.5% final value fee</li>
                                        <li><strong>Classified Listings:</strong> 3% final value fee</li>
                                        <li>Minimum fee of $1.00 NZD applies to all transactions</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">4. Prohibited Items</h3>
                                    <p>The following items are prohibited on TuiTrade:</p>
                                    <ul className="list-disc pl-6 space-y-1 mt-2">
                                        <li>Illegal drugs and controlled substances</li>
                                        <li>Weapons and ammunition</li>
                                        <li>Stolen goods</li>
                                        <li>Counterfeit or pirated items</li>
                                        <li>Adult content and services</li>
                                        <li>Live animals (except through approved dealers)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">5. Dispute Resolution</h3>
                                    <p>
                                        TuiTrade provides a dispute resolution process for transactions. We encourage users to 
                                        communicate directly first. If issues cannot be resolved, our support team will mediate 
                                        based on New Zealand consumer protection laws.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">6. Account Termination</h3>
                                    <p>
                                        TuiTrade reserves the right to suspend or terminate accounts that violate these terms, 
                                        engage in fraudulent activity, or receive multiple valid complaints from other users.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Privacy Policy */}
                        <section className="border-t pt-8">
                            <div className="flex items-center mb-4">
                                <Eye className="w-6 h-6 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                            </div>

                            <div className="space-y-6 text-gray-700">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Information We Collect</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Account Information:</strong> Name, email address, phone number</li>
                                        <li><strong>Profile Information:</strong> Display name, profile picture, location</li>
                                        <li><strong>Transaction Data:</strong> Purchase history, payment information, shipping addresses</li>
                                        <li><strong>Communication:</strong> Messages between users, support inquiries</li>
                                        <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">How We Use Your Information</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Facilitate transactions between buyers and sellers</li>
                                        <li>Process payments and handle disputes</li>
                                        <li>Send important account and transaction notifications</li>
                                        <li>Improve our platform and user experience</li>
                                        <li>Prevent fraud and ensure platform security</li>
                                        <li>Comply with legal requirements</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Information Sharing</h3>
                                    <p>
                                        We only share your personal information when necessary for transactions (e.g., sharing 
                                        contact details with buyers/sellers), when required by law, or with your explicit consent. 
                                        We never sell your personal information to third parties.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Data Security</h3>
                                    <p>
                                        We implement industry-standard security measures to protect your data, including 
                                        encryption, secure payment processing, and regular security audits. However, no 
                                        online platform can guarantee 100% security.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Your Rights</h3>
                                    <p>Under New Zealand privacy laws, you have the right to:</p>
                                    <ul className="list-disc pl-6 space-y-1 mt-2">
                                        <li>Access your personal information</li>
                                        <li>Correct inaccurate information</li>
                                        <li>Request deletion of your data</li>
                                        <li>Object to processing of your data</li>
                                        <li>Data portability</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Cookies and Tracking</h3>
                                    <p>
                                        We use cookies and similar technologies to improve your experience, remember your 
                                        preferences, and analyze platform usage. You can control cookie settings through 
                                        your browser.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Updates to This Policy</h3>
                                    <p>
                                        We may update this policy from time to time. We'll notify users of significant 
                                        changes via email or platform notifications. Continued use of TuiTrade constitutes 
                                        acceptance of any updates.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Contact Information */}
                        <section className="border-t pt-8">
                            <div className="flex items-center mb-4">
                                <Shield className="w-6 h-6 text-green-600 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                            </div>

                            <div className="bg-green-50 p-6 rounded-lg">
                                <p className="text-gray-700 mb-4">
                                    If you have questions about these terms or our privacy practices, please contact us:
                                </p>
                                <div className="space-y-2 text-gray-700">
                                    <p><strong>Email:</strong> legal@tuitrade.co.nz</p>
                                    <p><strong>Address:</strong> TuiTrade Limited, Auckland, New Zealand</p>
                                    <p><strong>Phone:</strong> +64 9 XXX XXXX</p>
                                </div>
                            </div>
                        </section>

                        {/* Acknowledgment */}
                        <section className="border-t pt-8">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <Clock className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-yellow-800">Important Notice</h3>
                                        <p className="text-yellow-700 mt-1">
                                            This is a demo marketplace. These terms and privacy policy are for demonstration 
                                            purposes and would need to be reviewed by legal professionals before actual deployment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndPrivacyPage;