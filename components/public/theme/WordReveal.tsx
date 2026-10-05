'use client';

import { useEffect, useRef } from 'react';

interface WordRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Splits text into word spans. As the user scrolls through this element,
 * words transition from light grey → dark ink one by one.
 * Reversible on scroll-up. Motion gated on .motion-ok.
 */
export function WordReveal({ text, className = '', style }: WordRevealProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  const words = text.split(' ');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const motionOk = document.documentElement.classList.contains('motion-ok');
    if (!motionOk) return;

    const spans = Array.from(container.querySelectorAll<HTMLSpanElement>('[data-word]'));

    function update() {
      const rect = container!.getBoundingClientRect();
      const viewH = window.innerHeight;

      // Progress: 0 when top of element reaches bottom of viewport,
      //           1 when bottom of element reaches top of viewport
      const total = rect.height + viewH;
      const done = viewH - rect.top;
      const progress = Math.max(0, Math.min(1, done / total));

      const revealCount = Math.round(progress * spans.length);

      spans.forEach((span, i) => {
        if (i < revealCount) {
          span.style.color = 'var(--ink)';
          span.style.opacity = '1';
        } else {
          span.style.color = 'var(--ink-muted)';
          span.style.opacity = '0.35';
        }
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <p ref={containerRef} className={className} style={style} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          data-word
          style={{
            color: 'var(--ink-muted)',
            opacity: 0.35,
            display: 'inline',
            transition: 'color 0.3s ease, opacity 0.3s ease',
          }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
