// Enhanced Performance Monitor Component
// Tracks Core Web Vitals and provides performance insights

import React, { useState, useEffect, useRef } from 'react';
import {
    Activity,
    Zap,
    Clock,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Info
} from 'lucide-react';

const PerformanceMonitor = ({ onClose, isVisible = false }) => {
    const [metrics, setMetrics] = useState({
        fcp: null, // First Contentful Paint
        lcp: null, // Largest Contentful Paint
        fid: null, // First Input Delay
        cls: null, // Cumulative Layout Shift
        ttfb: null, // Time to First Byte
        fci: null, // First CPU Idle
        tti: null, // Time to Interactive
    });
    const [performanceScore, setPerformanceScore] = useState(0);
    const [recommendations, setRecommendations] = useState([]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        if (isVisible) {
            startMonitoring();
        }
        return () => {
            stopMonitoring();
        };
    }, [isVisible]);

    const startMonitoring = () => {
        setIsMonitoring(true);

        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            // First Contentful Paint
            observerRef.current = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
                    }
                });
            });
            observerRef.current.observe({ entryTypes: ['paint'] });

            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                setMetrics(prev => ({ ...prev, cls: clsValue }));
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }

        // Measure Time to First Byte
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        if (navigationEntry) {
            setMetrics(prev => ({ ...prev, ttfb: navigationEntry.responseStart - navigationEntry.requestStart }));
        }

        // Calculate performance score
        setTimeout(() => {
            calculatePerformanceScore();
        }, 3000);
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
    };

    const calculatePerformanceScore = () => {
        let score = 100;
        const newRecommendations = [];

        // FCP scoring (0-2.5s is good)
        if (metrics.fcp > 2500) {
            score -= 20;
            newRecommendations.push({
                type: 'warning',
                metric: 'FCP',
                message: 'First Contentful Paint is slow',
                suggestion: 'Optimize critical rendering path and reduce server response time'
            });
        }

        // LCP scoring (0-2.5s is good)
        if (metrics.lcp > 2500) {
            score -= 25;
            newRecommendations.push({
                type: 'warning',
                metric: 'LCP',
                message: 'Largest Contentful Paint is slow',
                suggestion: 'Optimize images, use CDN, and implement lazy loading'
            });
        }

        // FID scoring (0-100ms is good)
        if (metrics.fid > 100) {
            score -= 20;
            newRecommendations.push({
                type: 'warning',
                metric: 'FID',
                message: 'First Input Delay is high',
                suggestion: 'Reduce JavaScript execution time and optimize event handlers'
            });
        }

        // CLS scoring (0-0.1 is good)
        if (metrics.cls > 0.1) {
            score -= 15;
            newRecommendations.push({
                type: 'warning',
                metric: 'CLS',
                message: 'Cumulative Layout Shift is high',
                suggestion: 'Set explicit dimensions for images and avoid inserting content above existing content'
            });
        }

        // TTFB scoring (0-600ms is good)
        if (metrics.ttfb > 600) {
            score -= 20;
            newRecommendations.push({
                type: 'warning',
                metric: 'TTFB',
                message: 'Time to First Byte is slow',
                suggestion: 'Optimize server response time and use caching'
            });
        }

        setPerformanceScore(Math.max(0, score));
        setRecommendations(newRecommendations);
    };

    const getMetricStatus = (metric, value, thresholds) => {
        if (!value) return 'pending';
        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.needsImprovement) return 'needs-improvement';
        return 'poor';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'good': return <CheckCircle size={16} className="text-green-500" />;
            case 'needs-improvement': return <AlertTriangle size={16} className="text-yellow-500" />;
            case 'poor': return <AlertTriangle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'text-green-600 bg-green-50';
            case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
            case 'poor': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const formatMetric = (value, unit = 'ms') => {
        if (!value) return 'Measuring...';
        return `${value.toFixed(1)}${unit}`;
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Activity className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
                                <p className="text-gray-600">Core Web Vitals & Performance Metrics</p>
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
                    {/* Performance Score */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Zap className="text-blue-600" size={24} />
                            <h3 className="text-xl font-semibold text-gray-900">Performance Score</h3>
                        </div>
                        <div className="text-center">
                            <div className="text-6xl font-bold text-blue-600 mb-2">
                                {performanceScore}
                            </div>
                            <div className="text-lg text-gray-600 mb-4">out of 100</div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${performanceScore >= 90 ? 'bg-green-500' :
                                            performanceScore >= 70 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                        }`}
                                    style={{ width: `${performanceScore}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                {performanceScore >= 90 ? 'Excellent' :
                                    performanceScore >= 70 ? 'Good' :
                                        performanceScore >= 50 ? 'Needs Improvement' : 'Poor'}
                            </div>
                        </div>
                    </div>

                    {/* Core Web Vitals */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* FCP */}
                            <div className={`p-4 rounded-lg border ${getStatusColor(getMetricStatus('fcp', metrics.fcp, { good: 1800, needsImprovement: 3000 }))
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(getMetricStatus('fcp', metrics.fcp, { good: 1800, needsImprovement: 3000 }))}
                                        <span className="font-medium">First Contentful Paint</span>
                                    </div>
                                    <span className="text-sm font-mono">{formatMetric(metrics.fcp)}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Time until first content is painted
                                </div>
                            </div>

                            {/* LCP */}
                            <div className={`p-4 rounded-lg border ${getStatusColor(getMetricStatus('lcp', metrics.lcp, { good: 2500, needsImprovement: 4000 }))
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(getMetricStatus('lcp', metrics.lcp, { good: 2500, needsImprovement: 4000 }))}
                                        <span className="font-medium">Largest Contentful Paint</span>
                                    </div>
                                    <span className="text-sm font-mono">{formatMetric(metrics.lcp)}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Time until largest content is painted
                                </div>
                            </div>

                            {/* FID */}
                            <div className={`p-4 rounded-lg border ${getStatusColor(getMetricStatus('fid', metrics.fid, { good: 100, needsImprovement: 300 }))
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(getMetricStatus('fid', metrics.fid, { good: 100, needsImprovement: 300 }))}
                                        <span className="font-medium">First Input Delay</span>
                                    </div>
                                    <span className="text-sm font-mono">{formatMetric(metrics.fid)}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Time until first user interaction
                                </div>
                            </div>

                            {/* CLS */}
                            <div className={`p-4 rounded-lg border ${getStatusColor(getMetricStatus('cls', metrics.cls, { good: 0.1, needsImprovement: 0.25 }))
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(getMetricStatus('cls', metrics.cls, { good: 0.1, needsImprovement: 0.25 }))}
                                        <span className="font-medium">Cumulative Layout Shift</span>
                                    </div>
                                    <span className="text-sm font-mono">{formatMetric(metrics.cls, '')}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Visual stability measure
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Metrics */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* TTFB */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <Clock size={16} className="text-gray-500" />
                                        <span className="font-medium">Time to First Byte</span>
                                    </div>
                                    <span className="text-sm font-mono">{formatMetric(metrics.ttfb)}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Server response time
                                </div>
                            </div>

                            {/* Monitoring Status */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp size={16} className="text-gray-500" />
                                        <span className="font-medium">Monitoring Status</span>
                                    </div>
                                    <span className={`text-sm px-2 py-1 rounded-full ${isMonitoring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {isMonitoring ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Real-time performance tracking
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                            <div className="space-y-3">
                                {recommendations.map((rec, index) => (
                                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-medium text-yellow-800">
                                                    {rec.metric}: {rec.message}
                                                </p>
                                                <p className="text-sm text-yellow-700 mt-1">{rec.suggestion}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                                <Activity size={16} className="text-blue-600" />
                                <span className="text-sm font-medium">Refresh Metrics</span>
                            </button>
                            <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                                <Zap size={16} className="text-green-600" />
                                <span className="text-sm font-medium">Optimize Performance</span>
                            </button>
                            <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                                <TrendingUp size={16} className="text-purple-600" />
                                <span className="text-sm font-medium">View Trends</span>
                            </button>
                            <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                                <Info size={16} className="text-orange-600" />
                                <span className="text-sm font-medium">Performance Guide</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Last updated: {new Date().toLocaleTimeString()}
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Close Monitor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceMonitor; 