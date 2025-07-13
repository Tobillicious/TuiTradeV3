// src/components/ui/PerformanceOptimizer.js
import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { trackEvent } from '../../lib/analytics';

// Performance monitoring and optimization utilities
class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      fcp: 0, // First Contentful Paint
      lcp: 0, // Largest Contentful Paint
      fid: 0, // First Input Delay
      cls: 0, // Cumulative Layout Shift
      ttfb: 0, // Time to First Byte
    };
    this.observers = new Map();
    this.init();
  }

  init() {
    this.setupCoreWebVitals();
    this.setupPerformanceObserver();
    this.setupResourceTiming();
  }

  // Setup Core Web Vitals monitoring
  setupCoreWebVitals() {
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries[entries.length - 1];
          this.metrics.fcp = fcp.startTime;
          this.reportMetric('FCP', fcp.startTime);
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (e) {
        console.warn('FCP observer failed:', e);
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          this.metrics.lcp = lcp.startTime;
          this.reportMetric('LCP', lcp.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observer failed:', e);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('FID', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID observer failed:', e);
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.reportMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observer failed:', e);
      }
    }
  }

  // Setup general performance observer
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.metrics.ttfb = entry.responseStart - entry.requestStart;
              this.reportMetric('TTFB', this.metrics.ttfb);
            }
          });
        });
        observer.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', observer);
      } catch (e) {
        console.warn('Navigation observer failed:', e);
      }
    }
  }

  // Setup resource timing monitoring
  setupResourceTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.initiatorType === 'script' || entry.initiatorType === 'css') {
              this.reportResourceTiming(entry);
            }
          });
        });
        observer.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', observer);
      } catch (e) {
        console.warn('Resource observer failed:', e);
      }
    }
  }

  // Report metric to analytics
  reportMetric(name, value) {
    trackEvent('performance_metric', {
      metric_name: name,
      metric_value: value,
      timestamp: Date.now()
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}: ${value.toFixed(2)}ms`);
    }
  }

  // Report resource timing
  reportResourceTiming(entry) {
    const timing = {
      name: entry.name,
      type: entry.initiatorType,
      duration: entry.duration,
      size: entry.transferSize,
      startTime: entry.startTime
    };

    trackEvent('resource_timing', timing);

    // Alert on slow resources
    if (entry.duration > 3000) {
      console.warn(`🐌 Slow resource: ${entry.name} took ${entry.duration}ms`);
    }
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch (e) {
        console.warn('Error disconnecting observer:', e);
      }
    });
    this.observers.clear();
  }
}

// React hook for performance optimization
export const usePerformanceOptimizer = (options = {}) => {
  const optimizerRef = useRef(null);
  const { enableMonitoring = true, enableOptimizations = true } = options;

  useEffect(() => {
    if (enableMonitoring && !optimizerRef.current) {
      optimizerRef.current = new PerformanceOptimizer();
    }

    return () => {
      if (optimizerRef.current) {
        optimizerRef.current.cleanup();
        optimizerRef.current = null;
      }
    };
  }, [enableMonitoring]);

  const getMetrics = useCallback(() => {
    return optimizerRef.current?.getMetrics() || {};
  }, []);

  return { getMetrics };
};

// Code splitting optimization hook
export const useCodeSplitting = (importFn, options = {}) => {
  const { fallback = null, preload = false } = options;
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadComponent = useCallback(async () => {
    if (Component) return Component;

    setLoading(true);
    setError(null);

    try {
      const module = await importFn();
      const component = module.default || module;
      setComponent(() => component);
      return component;
    } catch (err) {
      setError(err);
      console.error('Code splitting error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [Component, importFn]);

  // Preload component if requested
  useEffect(() => {
    if (preload && !Component && !loading) {
      loadComponent();
    }
  }, [preload, Component, loading, loadComponent]);

  return {
    Component,
    loading,
    error,
    loadComponent
  };
};

// Bundle analysis utility
export const analyzeBundle = () => {
  const resources = performance.getEntriesByType('resource');
  const scripts = resources.filter(r => r.initiatorType === 'script');
  const styles = resources.filter(r => r.initiatorType === 'css');
  const images = resources.filter(r => r.initiatorType === 'img');

  const analysis = {
    totalResources: resources.length,
    scripts: {
      count: scripts.length,
      totalSize: scripts.reduce((sum, s) => sum + (s.transferSize || 0), 0),
      averageLoadTime: scripts.reduce((sum, s) => sum + s.duration, 0) / scripts.length
    },
    styles: {
      count: styles.length,
      totalSize: styles.reduce((sum, s) => sum + (s.transferSize || 0), 0),
      averageLoadTime: styles.reduce((sum, s) => sum + s.duration, 0) / styles.length
    },
    images: {
      count: images.length,
      totalSize: images.reduce((sum, i) => sum + (i.transferSize || 0), 0),
      averageLoadTime: images.reduce((sum, i) => sum + i.duration, 0) / images.length
    }
  };

  return analysis;
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Preload critical resources
export const PreloadCriticalResources = () => {
  useEffect(() => {
    // Preload critical CSS
    const criticalCSS = [
      '/static/css/main.css',
      '/static/css/chunk.css'
    ];

    criticalCSS.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });

    // Preload critical fonts
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    criticalFonts.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return null;
};

// Performance optimization component
const PerformanceOptimizerComponent = ({ children, options = {} }) => {
  const { enableMonitoring = true, enableOptimizations = true } = options;
  const { getMetrics } = usePerformanceOptimizer({ enableMonitoring });
  const memoryInfo = useMemoryMonitor();

  // Report performance metrics periodically
  useEffect(() => {
    if (!enableMonitoring) return;

    const interval = setInterval(() => {
      const metrics = getMetrics();
      if (metrics.fcp > 0 || metrics.lcp > 0) {
        trackEvent('performance_summary', {
          ...metrics,
          memory: memoryInfo,
          timestamp: Date.now()
        });
      }
    }, 30000); // Report every 30 seconds

    return () => clearInterval(interval);
  }, [enableMonitoring, getMetrics, memoryInfo]);

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
          <div>FCP: {getMetrics().fcp?.toFixed(0) || 'N/A'}ms</div>
          <div>LCP: {getMetrics().lcp?.toFixed(0) || 'N/A'}ms</div>
          <div>CLS: {getMetrics().cls?.toFixed(3) || 'N/A'}</div>
        </div>
      )}
    </>
  );
};

export default PerformanceOptimizerComponent;