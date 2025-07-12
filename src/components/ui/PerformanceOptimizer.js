// Performance Optimization Utilities
// Tools for improving React performance and bundle size

import React, { Suspense, useMemo, useCallback } from 'react';

// Lazy loading wrapper with error boundary
export const LazyWrapper = ({ children, fallback, errorFallback }) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-8">
          <p className="text-red-600">Something went wrong. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [node, setNode] = React.useState(null);

  const observer = useMemo(() => {
    if (typeof IntersectionObserver === 'undefined') return null;
    
    return new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });
  }, [options.threshold, options.rootMargin]);

  React.useEffect(() => {
    if (!observer || !node) return;
    
    observer.observe(node);
    
    return () => {
      observer.disconnect();
    };
  }, [observer, node]);

  return [setNode, isIntersecting];
};

// Virtual list component for large datasets
export const VirtualList = ({ 
  items, 
  renderItem, 
  itemHeight = 100, 
  containerHeight = 400,
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerRef, setContainerRef] = React.useState(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      item: items[i],
      style: {
        position: 'absolute',
        top: i * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    });
  }

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div
      ref={setContainerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ index, item, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Debounced search hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Image lazy loading component
export const LazyImage = ({ src, alt, className, placeholder }) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [imageRef, isIntersecting] = useIntersectionObserver();
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    if (isIntersecting && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setImageLoaded(true);
      };
      img.src = src;
    }
  }, [isIntersecting, src]);

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
      loading="lazy"
    />
  );
};

// Memoized component wrapper
export const withMemo = (Component, propsAreEqual) => {
  return React.memo(Component, propsAreEqual);
};

// Bundle analyzer helper (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('Bundle Size Analysis');
    
    // Log component render counts
    const renderCounts = {};
    const originalCreateElement = React.createElement;
    
    React.createElement = function(type, props, ...children) {
      const componentName = type?.displayName || type?.name || type;
      if (typeof componentName === 'string') {
        renderCounts[componentName] = (renderCounts[componentName] || 0) + 1;
      }
      return originalCreateElement.apply(this, arguments);
    };

    // Log after delay to capture initial renders
    setTimeout(() => {
      console.table(renderCounts);
      console.groupEnd();
    }, 2000);
  }
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = React.useRef();
  
  React.useEffect(() => {
    renderStartTime.current = performance.now();
  });

  React.useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      if (renderTime > 16) { // Alert if render takes longer than 16ms (60fps)
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    }
  });
};

// Preload component for critical resources
export const PreloadCriticalResources = () => {
  React.useEffect(() => {
    // Preload critical fonts
    const fontUrls = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    fontUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      '/logo192.png',
      // Add other critical images here
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null;
};

export default {
  LazyWrapper,
  useIntersectionObserver,
  VirtualList,
  useDebounce,
  LazyImage,
  withMemo,
  analyzeBundleSize,
  usePerformanceMonitor,
  PreloadCriticalResources
};