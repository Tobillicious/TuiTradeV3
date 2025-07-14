// =============================================
// TeReoAudit.js - Te Reo Māori Coverage Audit Tool
// ------------------------------------------------
// Provides a tool for auditing and reporting Te Reo Māori coverage
// across the app. Used to ensure bilingual support and identify gaps.
// =============================================
// Te Reo Māori Audit Component
// Helps identify areas that need translation coverage and improve Māori language integration

import React, { useState, useEffect } from 'react';
import {
    Languages,
    CheckCircle,
    AlertCircle,
    Info,
    BookOpen,
    Users,
    MapPin,
    Briefcase,
    ShoppingCart,
    Home,
    MessageCircle
} from 'lucide-react';
import { TE_REO_TRANSLATIONS, getBilingualText } from '../../lib/nzLocalizationEnhanced';
import { useTeReo } from './TeReoToggle';

const TeReoAudit = ({ onClose }) => {
    const { isTeReoMode, getText } = useTeReo();
    const [auditResults, setAuditResults] = useState({});
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        performAudit();
    }, []);

    const performAudit = () => {
        const results = {
            greetings: auditSection(TE_REO_TRANSLATIONS.greetings, 'Greetings & Common Phrases'),
            interface: auditSection(TE_REO_TRANSLATIONS.interface, 'Interface Elements'),
            employment: auditSection(TE_REO_TRANSLATIONS.employment, 'Employment Terms'),
            phrases: auditSection(TE_REO_TRANSLATIONS.phrases, 'Common Phrases'),
            coverage: calculateCoverage(),
            missing: identifyMissingTranslations()
        };

        setAuditResults(results);
        generateSuggestions(results);
    };

    const auditSection = (translations, sectionName) => {
        const totalKeys = Object.keys(translations).length;
        const translatedKeys = Object.values(translations).filter(text => text && text.trim()).length;
        const coverage = (translatedKeys / totalKeys) * 100;

        return {
            name: sectionName,
            total: totalKeys,
            translated: translatedKeys,
            coverage: coverage,
            missing: totalKeys - translatedKeys
        };
    };

    const calculateCoverage = () => {
        const allTranslations = {
            ...TE_REO_TRANSLATIONS.greetings,
            ...TE_REO_TRANSLATIONS.interface,
            ...TE_REO_TRANSLATIONS.employment,
            ...TE_REO_TRANSLATIONS.phrases
        };

        const totalKeys = Object.keys(allTranslations).length;
        const translatedKeys = Object.values(allTranslations).filter(text => text && text.trim()).length;

        return {
            total: totalKeys,
            translated: translatedKeys,
            coverage: (translatedKeys / totalKeys) * 100,
            missing: totalKeys - translatedKeys
        };
    };

    const identifyMissingTranslations = () => {
        const missing = [];

        // Check for common marketplace terms that might be missing
        const commonTerms = [
            'buy', 'sell', 'price', 'negotiable', 'condition', 'description',
            'shipping', 'delivery', 'pickup', 'payment', 'secure', 'verified',
            'rating', 'review', 'favorite', 'share', 'report', 'contact',
            'message', 'offer', 'bid', 'auction', 'reserve', 'sold', 'available'
        ];

        commonTerms.forEach(term => {
            if (!TE_REO_TRANSLATIONS.interface[term] &&
                !TE_REO_TRANSLATIONS.phrases[term]) {
                missing.push({
                    term: term,
                    category: 'marketplace',
                    priority: 'high'
                });
            }
        });

        return missing;
    };

    const generateSuggestions = (results) => {
        const suggestions = [];

        if (results.coverage.coverage < 90) {
            suggestions.push({
                type: 'coverage',
                priority: 'high',
                message: `Overall Te Reo coverage is ${results.coverage.coverage.toFixed(1)}%. Aim for 95%+ coverage.`,
                action: 'Add missing translations for better Māori language support.'
            });
        }

        if (results.missing.length > 0) {
            suggestions.push({
                type: 'missing',
                priority: 'medium',
                message: `${results.missing.length} common marketplace terms need translation.`,
                action: 'Prioritize high-frequency terms for immediate translation.'
            });
        }

        Object.entries(results).forEach(([key, section]) => {
            if (key !== 'coverage' && key !== 'missing' && section.coverage < 85) {
                suggestions.push({
                    type: 'section',
                    priority: 'medium',
                    message: `${section.name} section has ${section.coverage.toFixed(1)}% coverage.`,
                    action: `Focus on completing ${section.name} translations.`
                });
            }
        });

        setSuggestions(suggestions);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return <AlertCircle size={16} />;
            case 'medium': return <Info size={16} />;
            case 'low': return <CheckCircle size={16} />;
            default: return <Info size={16} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Languages className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Te Reo Māori Audit</h2>
                                <p className="text-gray-600">Translation coverage analysis</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Overall Coverage */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <BookOpen className="text-green-600" size={24} />
                            <h3 className="text-xl font-semibold text-gray-900">Overall Coverage</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {auditResults.coverage?.coverage?.toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-600">Coverage</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">
                                    {auditResults.coverage?.translated || 0}
                                </div>
                                <div className="text-sm text-gray-600">Translated</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600">
                                    {auditResults.coverage?.missing || 0}
                                </div>
                                <div className="text-sm text-gray-600">Missing</div>
                            </div>
                        </div>
                    </div>

                    {/* Section Breakdown */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(auditResults).map(([key, section]) => {
                                if (key === 'coverage' || key === 'missing') return null;

                                return (
                                    <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">{section.name}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${section.coverage >= 90 ? 'bg-green-100 text-green-800' :
                                                section.coverage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {section.coverage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <span>{section.translated} translated</span>
                                            <span>{section.missing} missing</span>
                                        </div>
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${section.coverage >= 90 ? 'bg-green-500' :
                                                        section.coverage >= 75 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}
                                                    style={{ width: `${section.coverage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Missing Translations */}
                    {auditResults.missing?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Missing Translations</h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {auditResults.missing.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <AlertCircle size={14} className="text-red-500" />
                                            <span className="text-sm text-red-700">{item.term}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                        <div className="space-y-3">
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(suggestion.priority)}`}>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getPriorityIcon(suggestion.priority)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{suggestion.message}</p>
                                            <p className="text-sm opacity-80 mt-1">{suggestion.action}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                                <Languages size={16} className="text-green-600" />
                                <span className="text-sm font-medium">Add Missing Translations</span>
                            </button>
                            <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                                <Users size={16} className="text-blue-600" />
                                <span className="text-sm font-medium">Consult Māori Speakers</span>
                            </button>
                            <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                                <BookOpen size={16} className="text-purple-600" />
                                <span className="text-sm font-medium">Review Cultural Accuracy</span>
                            </button>
                            <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                                <MessageCircle size={16} className="text-orange-600" />
                                <span className="text-sm font-medium">Test User Experience</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Close Audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeReoAudit; 