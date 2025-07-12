// Advanced Monitoring and Analytics Service - Comprehensive application monitoring
// Handles performance tracking, error reporting, user analytics, and business metrics

import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from './firebase';

// Monitoring configuration
const MONITORING_CONFIG = {
  performanceThresholds: {
    pageLoad: 3000, // 3 seconds
    apiResponse: 1000, // 1 second
    databaseQuery: 500, // 500ms
    fileUpload: 30000 // 30 seconds
  },
  sampleRates: {
    performance: 0.1, // 10% sampling
    errors: 1.0, // 100% sampling
    userActions: 0.3 // 30% sampling
  },
  retentionPeriods: {
    performance: 30, // days
    errors: 90, // days
    analytics: 365, // days
    security: 730 // days
  }
};

// Event types for tracking
const EVENT_TYPES = {
  // Page views and navigation
  PAGE_VIEW: 'page_view',
  NAVIGATION: 'navigation',
  
  // User interactions
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  SEARCH: 'search',
  FILTER_APPLY: 'filter_apply',
  SORT_CHANGE: 'sort_change',
  
  // Job-related events
  JOB_VIEW: 'job_view',
  JOB_APPLY: 'job_apply',
  JOB_SAVE: 'job_save',
  JOB_SHARE: 'job_share',
  JOB_CREATE: 'job_create',
  JOB_EDIT: 'job_edit',
  
  // Application events
  APPLICATION_START: 'application_start',
  APPLICATION_SUBMIT: 'application_submit',
  APPLICATION_SAVE: 'application_save',
  CV_UPLOAD: 'cv_upload',
  
  // Business events
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  PROFILE_UPDATE: 'profile_update',
  
  // E-commerce events
  ITEM_VIEW: 'item_view',
  ADD_TO_CART: 'add_to_cart',
  PURCHASE: 'purchase',
  
  // Performance events
  PERFORMANCE_METRIC: 'performance_metric',
  ERROR: 'error',
  WARNING: 'warning'
};

// Performance metrics
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.initializeObservers();
  }

  initializeObservers() {
    // Performance Observer for navigation and resource timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPerformanceEntry(entry);
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'paint'] });
      this.observers.push(observer);
    }

    // Long Task Observer for performance issues
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordLongTask(entry);
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // longtask not supported in all browsers
      }
    }

    // Memory usage monitoring
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMemoryUsage();
      }, 60000); // Every minute
    }
  }

  recordPerformanceEntry(entry) {
    const metric = {
      name: entry.name,
      type: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp: Date.now()
    };

    if (entry.entryType === 'navigation') {
      metric.loadTime = entry.loadEventEnd - entry.loadEventStart;
      metric.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
      metric.firstPaint = entry.firstPaint;
      metric.firstContentfulPaint = entry.firstContentfulPaint;
    }

    this.sendMetric('performance', metric);
  }

  recordLongTask(entry) {
    const metric = {
      type: 'longtask',
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    };

    this.sendMetric('performance', metric);
  }

  recordMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const metric = {
        type: 'memory',
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };

      this.sendMetric('performance', metric);
    }
  }

  recordCustomMetric(name, value, labels = {}) {
    const metric = {
      name,
      value,
      labels,
      timestamp: Date.now()
    };

    this.sendMetric('custom', metric);
  }

  async sendMetric(type, metric) {
    try {
      // Sample based on configuration
      const sampleRate = MONITORING_CONFIG.sampleRates.performance;
      if (Math.random() > sampleRate) return;

      await addDoc(collection(db, 'performanceMetrics'), {
        type,
        metric,
        timestamp: serverTimestamp(),
        sessionId: this.getSessionId(),
        userId: this.getCurrentUserId(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sending metric:', error);
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('monitoring_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('monitoring_session_id', sessionId);
    }
    return sessionId;
  }

  getCurrentUserId() {
    // Get from auth context or local storage
    return localStorage.getItem('user_id') || 'anonymous';
  }

  generateSessionId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Error tracking and reporting
class ErrorTracker {
  constructor() {
    this.setupGlobalErrorHandlers();
  }

  setupGlobalErrorHandlers() {
    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now()
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.recordError({
          type: 'resource',
          message: `Failed to load ${event.target.tagName}: ${event.target.src || event.target.href}`,
          element: event.target.tagName,
          source: event.target.src || event.target.href,
          timestamp: Date.now()
        });
      }
    }, true);
  }

  async recordError(errorData) {
    try {
      // Always record errors (100% sampling)
      await addDoc(collection(db, 'errorLogs'), {
        ...errorData,
        timestamp: serverTimestamp(),
        sessionId: this.getSessionId(),
        userId: this.getCurrentUserId(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });

      // Send to external error reporting service if configured
      this.sendToExternalService(errorData);
    } catch (error) {
      console.error('Error logging error:', error);
    }
  }

  recordCustomError(error, context = {}) {
    this.recordError({
      type: 'custom',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  sendToExternalService(errorData) {
    // Integration with services like Sentry, Bugsnag, etc.
    if (window.Sentry) {
      window.Sentry.captureException(new Error(errorData.message), {
        extra: errorData
      });
    }
  }

  getSessionId() {
    return sessionStorage.getItem('monitoring_session_id') || 'unknown';
  }

  getCurrentUserId() {
    return localStorage.getItem('user_id') || 'anonymous';
  }
}

// User behavior analytics
class UserAnalytics {
  constructor() {
    this.eventQueue = [];
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    this.startBatchTimer();
  }

  trackEvent(eventType, properties = {}) {
    const event = {
      type: eventType,
      properties: {
        ...properties,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userId: this.getCurrentUserId(),
        url: window.location.href,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    // Sample based on configuration
    const sampleRate = MONITORING_CONFIG.sampleRates.userActions;
    if (Math.random() <= sampleRate) {
      this.eventQueue.push(event);
      
      if (this.eventQueue.length >= this.batchSize) {
        this.flushEvents();
      }
    }
  }

  trackPageView(pageName, properties = {}) {
    this.trackEvent(EVENT_TYPES.PAGE_VIEW, {
      pageName,
      ...properties
    });
  }

  trackUserAction(action, target, properties = {}) {
    this.trackEvent(EVENT_TYPES.BUTTON_CLICK, {
      action,
      target,
      ...properties
    });
  }

  trackJobInteraction(jobId, interaction, properties = {}) {
    this.trackEvent(`JOB_${interaction.toUpperCase()}`, {
      jobId,
      ...properties
    });
  }

  trackBusinessEvent(eventType, properties = {}) {
    this.trackEvent(eventType, {
      ...properties,
      isBusinessEvent: true
    });
  }

  async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await addDoc(collection(db, 'userAnalytics'), {
        events,
        batchTimestamp: serverTimestamp(),
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      // Put events back in queue for retry
      this.eventQueue.unshift(...events);
    }
  }

  startBatchTimer() {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  getSessionId() {
    return sessionStorage.getItem('monitoring_session_id') || 'unknown';
  }

  getCurrentUserId() {
    return localStorage.getItem('user_id') || 'anonymous';
  }
}

// Business metrics collector
class BusinessMetrics {
  constructor() {
    this.metrics = new Map();
  }

  async recordMetric(metricName, value, dimensions = {}) {
    try {
      const metricDoc = doc(db, 'businessMetrics', `${metricName}_${Date.now()}`);
      await setDoc(metricDoc, {
        name: metricName,
        value,
        dimensions,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      });
    } catch (error) {
      console.error('Error recording business metric:', error);
    }
  }

  incrementCounter(metricName, dimensions = {}) {
    this.recordMetric(metricName, 1, dimensions);
  }

  recordJobMetrics(jobId, action, properties = {}) {
    const metricName = `job_${action}`;
    this.recordMetric(metricName, 1, {
      jobId,
      ...properties
    });
  }

  recordUserMetrics(userId, action, properties = {}) {
    const metricName = `user_${action}`;
    this.recordMetric(metricName, 1, {
      userId,
      ...properties
    });
  }

  recordRevenueMetric(amount, currency = 'NZD', source = 'unknown') {
    this.recordMetric('revenue', amount, {
      currency,
      source
    });
  }

  async getDailyMetrics(metricName, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const metricsQuery = query(
        collection(db, 'businessMetrics'),
        where('name', '==', metricName),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(metricsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting daily metrics:', error);
      return [];
    }
  }
}

// Main monitoring service
class MonitoringService {
  constructor() {
    this.performance = new PerformanceMonitor();
    this.errorTracker = new ErrorTracker();
    this.analytics = new UserAnalytics();
    this.businessMetrics = new BusinessMetrics();
    this.isInitialized = false;
  }

  initialize(config = {}) {
    if (this.isInitialized) return;

    // Merge configuration
    Object.assign(MONITORING_CONFIG, config);

    // Set user context
    if (config.userId) {
      localStorage.setItem('user_id', config.userId);
    }

    this.isInitialized = true;
    console.log('MonitoringService initialized');
  }

  // Public API methods
  trackPageView(pageName, properties = {}) {
    this.analytics.trackPageView(pageName, properties);
  }

  trackEvent(eventType, properties = {}) {
    this.analytics.trackEvent(eventType, properties);
  }

  trackError(error, context = {}) {
    this.errorTracker.recordCustomError(error, context);
  }

  trackPerformance(name, value, labels = {}) {
    this.performance.recordCustomMetric(name, value, labels);
  }

  trackBusinessMetric(name, value, dimensions = {}) {
    this.businessMetrics.recordMetric(name, value, dimensions);
  }

  // Job-specific tracking
  trackJobView(jobId, properties = {}) {
    this.analytics.trackJobInteraction(jobId, 'view', properties);
    this.businessMetrics.recordJobMetrics(jobId, 'view', properties);
  }

  trackJobApplication(jobId, applicationId, properties = {}) {
    this.analytics.trackJobInteraction(jobId, 'apply', { applicationId, ...properties });
    this.businessMetrics.recordJobMetrics(jobId, 'application', { applicationId, ...properties });
  }

  trackJobCreation(jobId, properties = {}) {
    this.analytics.trackJobInteraction(jobId, 'create', properties);
    this.businessMetrics.recordJobMetrics(jobId, 'creation', properties);
  }

  // User-specific tracking
  trackUserSignup(userId, method, properties = {}) {
    this.analytics.trackBusinessEvent(EVENT_TYPES.USER_SIGNUP, { userId, method, ...properties });
    this.businessMetrics.recordUserMetrics(userId, 'signup', { method, ...properties });
  }

  trackUserLogin(userId, method, properties = {}) {
    this.analytics.trackBusinessEvent(EVENT_TYPES.USER_LOGIN, { userId, method, ...properties });
    this.businessMetrics.recordUserMetrics(userId, 'login', { method, ...properties });
  }

  // E-commerce tracking
  trackPurchase(transactionId, amount, currency = 'NZD', items = []) {
    this.analytics.trackBusinessEvent(EVENT_TYPES.PURCHASE, {
      transactionId,
      amount,
      currency,
      items
    });
    this.businessMetrics.recordRevenueMetric(amount, currency, 'marketplace');
  }

  // Performance tracking helpers
  startTimer(name) {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.trackPerformance(name, duration);
      return duration;
    };
  }

  async measureAsync(name, asyncFunction) {
    const timer = this.startTimer(name);
    try {
      const result = await asyncFunction();
      timer();
      return result;
    } catch (error) {
      timer();
      this.trackError(error, { operation: name });
      throw error;
    }
  }

  // Health check
  async getHealthStatus() {
    try {
      const healthDoc = await getDoc(doc(db, 'system', 'health'));
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        monitoring: {
          performance: this.performance ? 'active' : 'inactive',
          errors: this.errorTracker ? 'active' : 'inactive',
          analytics: this.analytics ? 'active' : 'inactive',
          businessMetrics: this.businessMetrics ? 'active' : 'inactive'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Cleanup
  destroy() {
    if (this.performance.observers) {
      this.performance.observers.forEach(observer => observer.disconnect());
    }
    this.analytics.flushEvents();
    this.isInitialized = false;
  }
}

// Export event types for use in components
export { EVENT_TYPES, MONITORING_CONFIG };

// Create singleton instance
const monitoringService = new MonitoringService();

export default monitoringService;