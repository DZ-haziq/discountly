'use client';

import { useEffect, useRef } from 'react';

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;       // ms delay before transition starts
  className?: string;
}

/**
 * Fires once on IntersectionObserver entry.
 * Does NOT un-reveal on scroll-up.
 * Motion is gated on the .motion-ok class; if absent, children are
 * always fully visible (reduced-motion / no-JS safe).
 */
export function FadeUp({ children, delay = 0, className = '' }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Wait one rAF so MotionInit has time to add .motion-ok
    const raf = requestAnimationFrame(() => {
      const motionOk = document.documentElement.classList.contains('motion-ok');
      if (!motionOk) return;

      el.classList.add('fade-up-init');

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              el.classList.add('fade-up-done');
            }, delay);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(el);
    });

    return () => cancelAnimationFrame(raf);
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
