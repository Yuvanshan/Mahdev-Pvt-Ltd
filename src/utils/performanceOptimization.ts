/**
 * Performance & Lazy Loading Utilities
 * Optimizes image loading, lazy loading, and intersection observer
 */

import React from 'react';

/**
 * Hook for lazy loading images with Intersection Observer
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) {
  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the actual image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
          }
          
          // Load srcset if available
          if (img.dataset.srcset) {
img.srcset = img.dataset.srcset;
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(baseUrl: string): string {
  const variants = ['sm', 'md', 'lg'];
  return variants
    .map((size) => {
      const url = baseUrl.replace(/\.[^/.]+$/, (match) => `-${size}${match}`);
      const width = size === 'sm' ? 640 : size === 'md' ? 1024 : 1920;
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Prefetch images for better performance
 */
export function prefetchImages(urls: string[]): void {
  if (!document) return;

  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Preload critical images
 */
export function preloadCriticalImages(urls: string[]): void {
  if (!document) return;

  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Enable resource hints for performance
 */
export function enablePerformanceHints(domains: string[]): void {
  if (!document) return;

  domains.forEach((domain) => {
    // DNS prefetch
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = `//${domain}`;
    document.head.appendChild(dnsPrefetch);

    // Preconnect
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = `//${domain}`;
    document.head.appendChild(preconnect);
  });
}

/**
 * Optimize Core Web Vitals
 */
export function initializePerformanceMonitoring(): void {
  if (!window.requestIdleCallback) {
    // Polyfill for older browsers
(window as any).requestIdleCallback = (cb: IdleRequestCallback) => {
      const start = Date.now();
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50.0 - (Date.now() - start))
        } as IdleDeadline);
      }, 1);
    };
  }

  // Defer non-critical work
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      // Load non-critical resources
      if ('connection' in navigator) {
        const conn = navigator.connection as any;
        if (conn.effectiveType !== '4g') {
          console.log('Network type:', conn.effectiveType);
        }
      }
    });
  }
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: any): void {
  // Send to analytics service
  if (window.location.hostname !== 'localhost') {
    // In production, send metrics to your analytics service
    console.log('Web Vital:', metric);
  }
}

/**
 * Debounce function for scroll events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function for resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request animation frame utilities
 */
export function scheduleAnimationFrame(callback: FrameRequestCallback): number {
  return requestAnimationFrame(callback);
}

/**
 * Schedule multiple animation frames
 */
export function scheduleAnimationFrames(
  callbacks: FrameRequestCallback[],
  delay: number = 0
): number[] {
  return callbacks.map((callback, index) => {
    return requestAnimationFrame((time) => {
      if (delay && index > 0) {
        setTimeout(() => callback(time), delay * index);
      } else {
        callback(time);
      }
    });
  });
}

/**
 * In-memory cache manager — no localStorage
 */
const _memCache = new Map<string, { value: any; timestamp: number; ttl: number }>();

export const cacheManager = {
  set: (key: string, value: any, ttl: number = 3600000) => {
    _memCache.set(key, { value, timestamp: Date.now(), ttl });
  },

  get: (key: string): any => {
    const entry = _memCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      _memCache.delete(key);
      return null;
    }
    return entry.value;
  },

  remove: (key: string) => {
    _memCache.delete(key);
  },

  clear: () => {
    _memCache.clear();
  }
};


/**
 * Font loading optimization
 */
export function optimizeFontLoading(): void {
  if (!document) return;

  // Preload critical fonts
  const fonts = [
    { href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap', as: 'style' }
  ];

  fonts.forEach((font) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = font.as;
    link.href = font.href;
    document.head.appendChild(link);
  });
}
