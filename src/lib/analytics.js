// =============================================
// analytics.js - Analytics & Event Tracking Utilities
// ---------------------------------------------------
// Provides helpers for tracking user events, page views, and performance metrics.
// Integrates with analytics providers for monitoring app usage and engagement.
// =============================================
// Analytics and User Tracking System for TuiTrade
class AnalyticsManager {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.events = [];
    this.pageViews = [];
    this.userProperties = {};
    this.startTime = Date.now();

    this.init();
  }

  init() {
    // Set up session tracking
    this.setupSessionTracking();

    // Track page visibility changes
    this.setupVisibilityTracking();

    // Track user interactions
    this.setupInteractionTracking();

    // Send data periodically
    this.setupPeriodicSync();
  }

  generateSessionId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  setUserId(userId) {
    this.userId = userId;
    this.setUserProperty('userId', userId);
  }

  setUserProperty(key, value) {
    this.userProperties[key] = value;
  }

  // Track page views
  trackPageView(page, additionalData = {}) {
    const pageViewData = {
      page,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      ...additionalData
    };

    this.pageViews.push(pageViewData);
    this.sendEvent('page_view', pageViewData);
  }

  // Track custom events
  trackEvent(eventName, eventData = {}) {
    const event = {
      eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      ...eventData
    };

    this.events.push(event);
    this.sendEvent('custom_event', event);
  }

  // Track user engagement
  trackEngagement(action, category, label = null, value = null) {
    this.trackEvent('user_engagement', {
      action,
      category,
      label,
      value,
      page: window.location.pathname
    });
  }

  // Track search queries
  trackSearch(query, resultCount, filters = {}) {
    this.trackEvent('search', {
      query,
      resultCount,
      filters,
      page: window.location.pathname
    });
  }

  // Track item interactions
  trackItemInteraction(action, itemId, itemData = {}) {
    this.trackEvent('item_interaction', {
      action, // 'view', 'click', 'watchlist_add', 'watchlist_remove', etc.
      itemId,
      itemData,
      page: window.location.pathname
    });
  }

  // Track conversions
  trackConversion(type, value = null, itemId = null) {
    this.trackEvent('conversion', {
      type, // 'purchase', 'listing_created', 'contact_seller', etc.
      value,
      itemId,
      page: window.location.pathname
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      page: window.location.pathname
    });
  }

  // Track performance metrics
  trackPerformance(metric, value, context = {}) {
    this.trackEvent('performance', {
      metric,
      value,
      context,
      page: window.location.pathname
    });
  }

  // Send events to analytics backend
  async sendEvent(eventType, eventData) {
    try {
      // In a real app, this would send to your analytics service
      // For now, we'll store in localStorage and console.log

      const analyticsData = {
        eventType,
        eventData,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        userProperties: this.userProperties
      };

      // Store in localStorage for now
      const stored = JSON.parse(localStorage.getItem('tuitrade_analytics') || '[]');
      stored.push(analyticsData);

      // Keep only last 1000 events
      if (stored.length > 1000) {
        stored.splice(0, stored.length - 1000);
      }

      localStorage.setItem('tuitrade_analytics', JSON.stringify(stored));

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', analyticsData);
      }

      // In production, send to your analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(analyticsData)
      // });

    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Setup session tracking
  setupSessionTracking() {
    // Track session start
    this.trackEvent('session_start', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        sessionDuration: Date.now() - this.startTime,
        pageViews: this.pageViews.length,
        events: this.events.length
      });
    });
  }

  // Setup visibility tracking
  setupVisibilityTracking() {
    let visibilityStart = Date.now();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_blur', {
          timeOnPage: Date.now() - visibilityStart
        });
      } else {
        visibilityStart = Date.now();
        this.trackEvent('page_focus');
      }
    });
  }

  // Setup interaction tracking
  setupInteractionTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target;
      const tagName = target.tagName.toLowerCase();

      if (['button', 'a', 'input'].includes(tagName)) {
        this.trackEvent('click', {
          element: tagName,
          className: target.className,
          id: target.id,
          text: target.textContent?.slice(0, 100) || null
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      this.trackEvent('form_submit', {
        formId: form.id,
        formClass: form.className,
        action: form.action
      });
    });
  }

  // Setup periodic sync
  setupPeriodicSync() {
    // Send analytics data every 30 seconds
    setInterval(() => {
      this.syncAnalytics();
    }, 30000);
  }

  // Sync analytics data
  async syncAnalytics() {
    try {
      const stored = JSON.parse(localStorage.getItem('tuitrade_analytics') || '[]');

      if (stored.length > 0) {
        // In production, send to your analytics service
        // await fetch('/api/analytics/batch', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(stored)
        // });

        // Clear sent data
        // localStorage.removeItem('tuitrade_analytics');
      }
    } catch (error) {
      console.error('Analytics sync error:', error);
    }
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const stored = JSON.parse(localStorage.getItem('tuitrade_analytics') || '[]');

    return {
      totalEvents: stored.length,
      sessionId: this.sessionId,
      userId: this.userId,
      sessionDuration: Date.now() - this.startTime,
      pageViews: this.pageViews.length,
      events: this.events.length,
      userProperties: this.userProperties
    };
  }

  // A/B Testing support
  getExperimentVariant(experimentName) {
    const storedVariants = JSON.parse(localStorage.getItem('tuitrade_experiments') || '{}');

    if (storedVariants[experimentName]) {
      return storedVariants[experimentName];
    }

    // Simple A/B test - 50/50 split
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    storedVariants[experimentName] = variant;
    localStorage.setItem('tuitrade_experiments', JSON.stringify(storedVariants));

    this.trackEvent('experiment_assignment', {
      experimentName,
      variant
    });

    return variant;
  }

  // Track experiment conversion
  trackExperimentConversion(experimentName, conversionType) {
    const variant = this.getExperimentVariant(experimentName);
    this.trackEvent('experiment_conversion', {
      experimentName,
      variant,
      conversionType
    });
  }
}

// ========== AI Agent Guidance ==========
// The following analytics logic stores events in localStorage and logs to console for development.
// NEXT STEPS: Integrate a real analytics backend (e.g., Google Analytics, Segment, custom API).
// - Replace or supplement localStorage logic with API calls to analytics service.
// - Ensure privacy and compliance for user data.
// Note: Claude or future agents may override these suggestions if they disagree.
// Create singleton instance
export const analytics = new AnalyticsManager();

// Convenience functions
export const trackPageView = (page, data) => analytics.trackPageView(page, data);
export const trackEvent = (eventName, data) => analytics.trackEvent(eventName, data);
export const trackEngagement = (action, category, label, value) =>
  analytics.trackEngagement(action, category, label, value);
export const trackSearch = (query, resultCount, filters) =>
  analytics.trackSearch(query, resultCount, filters);
export const trackItemInteraction = (action, itemId, itemData) =>
  analytics.trackItemInteraction(action, itemId, itemData);
export const trackConversion = (type, value, itemId) =>
  analytics.trackConversion(type, value, itemId);
export const trackError = (error, context) => analytics.trackError(error, context);
export const trackPerformance = (metric, value, context) =>
  analytics.trackPerformance(metric, value, context);
export const setUserId = (userId) => analytics.setUserId(userId);
export const setUserProperty = (key, value) => analytics.setUserProperty(key, value);
export const getExperimentVariant = (experimentName) =>
  analytics.getExperimentVariant(experimentName);
export const trackExperimentConversion = (experimentName, conversionType) =>
  analytics.trackExperimentConversion(experimentName, conversionType);

export default analytics;