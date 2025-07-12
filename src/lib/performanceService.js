// Advanced Performance Optimization Service - Comprehensive performance enhancements
// Handles lazy loading, caching, code splitting, and runtime optimizations

import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';

// Performance configuration
const PERFORMANCE_CONFIG = {
  caching: {
    defaultTTL: 300000, // 5 minutes
    maxCacheSize: 100, // maximum number of cached items
    compressionEnabled: true
  },
  lazyLoading: {
    rootMargin: '100px', // Start loading 100px before element is visible
    threshold: 0.1,
    imageQuality: 0.8,
    placeholderColor: '#f3f4f6'
  },
  bundleOptimization: {
    chunkSize: 244000, // 244KB chunks
    prefetchDelay: 2000, // 2 seconds after load
    enableCompression: true
  },
  memoryManagement: {
    maxListSize: 1000,
    virtualScrollThreshold: 50,
    gcInterval: 60000 // 1 minute
  }
};

// Advanced caching system with compression and TTL
class AdvancedCache {
  constructor(maxSize = PERFORMANCE_CONFIG.caching.maxCacheSize) {
    this.cache = new Map();
    this.accessTimes = new Map();
    this.maxSize = maxSize;
    this.compressionEnabled = PERFORMANCE_CONFIG.caching.compressionEnabled;
  }

  set(key, value, ttl = PERFORMANCE_CONFIG.caching.defaultTTL) {
    // Remove expired items first
    this.cleanup();
    
    // If cache is full, remove least recently used items
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expiresAt = Date.now() + ttl;
    const compressedValue = this.compressionEnabled ? this.compress(value) : value;
    
    this.cache.set(key, {
      value: compressedValue,
      expiresAt,
      compressed: this.compressionEnabled
    });
    
    this.accessTimes.set(key, Date.now());
  }

  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.delete(key);
      return null;
    }
    
    this.accessTimes.set(key, Date.now());
    
    return cached.compressed ? this.decompress(cached.value) : cached.value;
  }

  delete(key) {
    this.cache.delete(key);
    this.accessTimes.delete(key);
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (now > data.expiresAt) {
        this.delete(key);
      }
    }
  }

  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, time] of this.accessTimes.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  compress(data) {
    try {
      // Simple compression using JSON.stringify and basic encoding
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      console.warn('Compression failed:', error);
      return data;
    }
  }

  decompress(compressedData) {
    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Decompression failed:', error);
      return compressedData;
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitRate || 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, data] of this.cache.entries()) {
      totalSize += JSON.stringify(key).length;
      totalSize += JSON.stringify(data).length;
    }
    return totalSize;
  }
}

// Intersection Observer for lazy loading
class LazyLoadManager {
  constructor() {
    this.observers = new Map();
    this.imageCache = new AdvancedCache(50);
    this.setupDefaultObserver();
  }

  setupDefaultObserver() {
    this.defaultObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const callback = this.observers.get(entry.target);
            if (callback) {
              callback(entry.target);
              this.defaultObserver.unobserve(entry.target);
              this.observers.delete(entry.target);
            }
          }
        });
      },
      {
        rootMargin: PERFORMANCE_CONFIG.lazyLoading.rootMargin,
        threshold: PERFORMANCE_CONFIG.lazyLoading.threshold
      }
    );
  }

  observe(element, callback) {
    this.observers.set(element, callback);
    this.defaultObserver.observe(element);
  }

  unobserve(element) {
    this.defaultObserver.unobserve(element);
    this.observers.delete(element);
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      // Check cache first
      const cached = this.imageCache.get(src);
      if (cached) {
        resolve(cached);
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.imageCache.set(src, { loaded: true, src });
        resolve({ loaded: true, src });
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  generatePlaceholder(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = PERFORMANCE_CONFIG.lazyLoading.placeholderColor;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL();
  }
}

// Virtual scrolling for large lists
class VirtualScrollManager {
  constructor(containerHeight, itemHeight, items) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.items = items;
    this.scrollTop = 0;
    this.overscan = 5; // Extra items to render for smooth scrolling
  }

  getVisibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight),
      this.items.length - 1
    );

    const overscanStart = Math.max(0, startIndex - this.overscan);
    const overscanEnd = Math.min(this.items.length - 1, endIndex + this.overscan);

    return {
      items: this.items.slice(overscanStart, overscanEnd + 1),
      startIndex: overscanStart,
      endIndex: overscanEnd,
      totalHeight: this.items.length * this.itemHeight,
      offsetY: overscanStart * this.itemHeight
    };
  }

  updateScrollTop(scrollTop) {
    this.scrollTop = scrollTop;
  }
}

// Memory management utilities
class MemoryManager {
  constructor() {
    this.refs = new WeakMap();
    this.intervals = new Set();
    this.timeouts = new Set();
    this.listeners = new Map();
    this.gcInterval = setInterval(() => this.garbageCollect(), PERFORMANCE_CONFIG.memoryManagement.gcInterval);
  }

  addInterval(interval) {
    this.intervals.add(interval);
    return interval;
  }

  addTimeout(timeout) {
    this.timeouts.add(timeout);
    return timeout;
  }

  addListener(element, event, listener) {
    const key = `${element}_${event}`;
    if (this.listeners.has(key)) {
      element.removeEventListener(event, this.listeners.get(key));
    }
    element.addEventListener(event, listener);
    this.listeners.set(key, listener);
  }

  cleanup() {
    // Clear intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();

    // Clear timeouts
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();

    // Remove event listeners
    this.listeners.forEach((listener, key) => {
      const [element, event] = key.split('_');
      if (element && element.removeEventListener) {
        element.removeEventListener(event, listener);
      }
    });
    this.listeners.clear();

    // Clear GC interval
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
    }
  }

  garbageCollect() {
    // Force garbage collection if available
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }

    // Clear expired timeouts
    this.timeouts.forEach(timeout => {
      if (timeout._destroyed) {
        this.timeouts.delete(timeout);
      }
    });
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}

// Performance optimized React hooks
export const useOptimizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

export const useOptimizedMemo = (factory, deps) => {
  return useMemo(factory, deps);
};

export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  const virtualScrollManager = useMemo(
    () => new VirtualScrollManager(containerHeight, itemHeight, items),
    [items, itemHeight, containerHeight]
  );

  useEffect(() => {
    virtualScrollManager.updateScrollTop(scrollTop);
  }, [scrollTop, virtualScrollManager]);

  const visibleItems = useMemo(
    () => virtualScrollManager.getVisibleItems(),
    [virtualScrollManager, scrollTop]
  );

  return {
    visibleItems,
    totalHeight: visibleItems.totalHeight,
    offsetY: visibleItems.offsetY,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
};

export const useLazyLoad = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();
  const lazyLoadManager = useRef(new LazyLoadManager()).current;

  useEffect(() => {
    const element = ref.current;
    if (element) {
      lazyLoadManager.observe(element, () => {
        setIsVisible(true);
      });

      return () => {
        lazyLoadManager.unobserve(element);
      };
    }
  }, [lazyLoadManager]);

  return [ref, isVisible];
};

export const useImagePreload = (src) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const lazyLoadManager = useRef(new LazyLoadManager()).current;

  useEffect(() => {
    if (src) {
      lazyLoadManager.preloadImage(src)
        .then(() => setIsLoaded(true))
        .catch(setError);
    }
  }, [src, lazyLoadManager]);

  return { isLoaded, error };
};

export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    startTime.current = endTime;
  });

  return {
    renderCount: renderCount.current,
    getRenderTime: () => performance.now() - startTime.current
  };
};

// HOCs for performance optimization
export const withPerformanceOptimization = (Component) => {
  const OptimizedComponent = memo((props) => {
    return <Component {...props} />;
  });

  OptimizedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`;
  return OptimizedComponent;
};

export const withLazyLoading = (importFunction, LoadingComponent = null) => {
  const LazyComponent = React.lazy(importFunction);
  
  return function LazyLoadedComponent(props) {
    return (
      <Suspense fallback={LoadingComponent || <div>Loading...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

// Bundle optimization utilities
class BundleOptimizer {
  constructor() {
    this.loadedChunks = new Set();
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  async preloadChunk(chunkName) {
    if (this.loadedChunks.has(chunkName)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `/static/js/${chunkName}.chunk.js`;
      script.onload = () => {
        this.loadedChunks.add(chunkName);
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  queuePreload(chunkName) {
    if (!this.loadedChunks.has(chunkName) && !this.preloadQueue.includes(chunkName)) {
      this.preloadQueue.push(chunkName);
      this.processPreloadQueue();
    }
  }

  async processPreloadQueue() {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      return;
    }

    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      const chunkName = this.preloadQueue.shift();
      try {
        await this.preloadChunk(chunkName);
        // Add delay to prevent overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to preload chunk ${chunkName}:`, error);
      }
    }

    this.isPreloading = false;
  }

  preloadRoute(routeName) {
    // Map route names to chunk names
    const routeChunkMap = {
      'jobs': 'jobs-page',
      'profile': 'profile-page',
      'dashboard': 'dashboard-page',
      'analytics': 'analytics-page'
    };

    const chunkName = routeChunkMap[routeName];
    if (chunkName) {
      this.queuePreload(chunkName);
    }
  }
}

// Main performance service
class PerformanceService {
  constructor() {
    this.cache = new AdvancedCache();
    this.lazyLoadManager = new LazyLoadManager();
    this.memoryManager = new MemoryManager();
    this.bundleOptimizer = new BundleOptimizer();
    this.isInitialized = false;
  }

  initialize(config = {}) {
    if (this.isInitialized) return;

    // Merge configuration
    Object.assign(PERFORMANCE_CONFIG, config);

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    // Preload critical resources
    this.preloadCriticalResources();

    this.isInitialized = true;
    console.log('PerformanceService initialized');
  }

  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getLCP, getFID, getCLS }) => {
        getLCP(console.log);
        getFID(console.log);
        getCLS(console.log);
      });
    }

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.duration > 1000) { // Log slow resources
            console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  preloadCriticalResources() {
    // Preload critical CSS
    const criticalCSS = [
      '/static/css/main.css',
      '/static/css/vendor.css'
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
  }

  // Public API methods
  optimizeImages(images) {
    return images.map(img => ({
      ...img,
      optimized: true,
      webp: img.src.replace(/\.(jpg|jpeg|png)$/, '.webp'),
      placeholder: this.lazyLoadManager.generatePlaceholder(img.width || 300, img.height || 200)
    }));
  }

  compressData(data) {
    return this.cache.compress(data);
  }

  decompressData(compressedData) {
    return this.cache.decompress(compressedData);
  }

  cacheData(key, data, ttl) {
    this.cache.set(key, data, ttl);
  }

  getCachedData(key) {
    return this.cache.get(key);
  }

  preloadRoute(routeName) {
    this.bundleOptimizer.preloadRoute(routeName);
  }

  getPerformanceMetrics() {
    return {
      cache: this.cache.getStats(),
      memory: this.memoryManager.getMemoryUsage(),
      timing: performance.timing ? {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      } : null
    };
  }

  cleanup() {
    this.memoryManager.cleanup();
    this.cache.clear();
    this.isInitialized = false;
  }
}

// Export performance utilities
export {
  AdvancedCache,
  LazyLoadManager,
  VirtualScrollManager,
  MemoryManager,
  BundleOptimizer,
  PERFORMANCE_CONFIG
};

// Create singleton instance
const performanceService = new PerformanceService();

export default performanceService;