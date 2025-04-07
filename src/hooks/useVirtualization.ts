import { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualizationConfig {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

/**
 * A custom hook for virtualizing long lists for better performance
 */
export function useVirtualization<T>({
  itemHeight,
  overscan = 3,
  containerHeight = 500
}: VirtualizationConfig) {
  // Track scroll position
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update scrollTop when user scrolls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calculate visible items based on current scroll position
  const getVirtualItems = useCallback((items: T[]) => {
    // Calculate range of visible items
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
    const endIndex = Math.min(items.length, startIndex + visibleCount);

    // Create array of visible items with metadata
    const virtualItems = [];
    for (let i = startIndex; i < endIndex; i++) {
      virtualItems.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight
      });
    }

    // Calculate total height for proper scrollbar
    const totalHeight = items.length * itemHeight;

    return {
      virtualItems,
      startIndex,
      endIndex,
      totalHeight
    };
  }, [scrollTop, itemHeight, containerHeight, overscan]);

  return {
    containerRef,
    getVirtualItems,
    scrollTop
  };
}
