'use client';

import { useState, useEffect } from 'react';

const WORDS = [
  'Electronics',
  'Home & Kitchen',
  'Outdoor Gear',
  'Software & Tools',
];

export function RotatingWords() {
  const [index, setIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setIndex(prev => (prev + 1) % WORDS.length);
        setFadeState('in');
      }, 250);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="inline-flex items-center gap-1.5 flex-wrap text-sm sm:text-base font-medium"
      style={{
        color: 'rgba(240, 237, 228, 0.95)',
        fontFamily: 'var(--font-sora)',
      }}
      aria-label={`Verified stores for ${WORDS[index]}`}
    >
      <span className="text-[var(--lime)] font-semibold">Verified stores for</span>
      <span
        style={{
          display: 'inline-block',
          width: 'clamp(150px, 20vw, 200px)',
          textAlign: 'left',
          overflow: 'hidden',
          verticalAlign: 'bottom',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <span
          className="inline-block transition-all duration-300 font-semibold"
          style={{
            color: 'var(--white)',
            opacity: fadeState === 'in' ? 1 : 0,
            transform: fadeState === 'in' ? 'translateY(0)' : 'translateY(6px)',
          }}
        >
          {WORDS[index]}
        </span>
      </span>
    </div>
  );
}
