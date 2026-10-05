'use client';

import { useEffect } from 'react';

/**
 * Adds the `.motion-ok` class to <html> only when the user
 * has NOT opted into prefers-reduced-motion. This gates all
 * scroll animations in CSS so reduced-motion + no-JS shows
 * the finished page with nothing hidden.
 */
export function MotionInit() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq.matches) {
      document.documentElement.classList.add('motion-ok');
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.remove('motion-ok');
      } else {
        document.documentElement.classList.add('motion-ok');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return null;
}
