// Import React to provide the React namespace for TouchEvent types
import React, { useRef, useCallback } from 'react';

interface UseGesturesProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

export const useGestures = ({ onSwipeLeft, onSwipeRight, threshold = 100 }: UseGesturesProps) => {
  const touchStart = useRef<number | null>(null);

  // Fix: Reference to React.TouchEvent requires the React namespace to be imported
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  }, []);

  // Fix: Reference to React.TouchEvent requires the React namespace to be imported
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return {
    onTouchStart,
    onTouchEnd
  };
};
