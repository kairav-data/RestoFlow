import { useRef } from 'react';

type Dir = 'up' | 'down' | 'left' | 'right';

/** Touch handlers that turn a finger swipe into a direction. Apply the result to an element with `touch-action: none`. */
export function useSwipe(onSwipe: (dir: Dir) => void, threshold = 24) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
      onSwipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
    },
  };
}
