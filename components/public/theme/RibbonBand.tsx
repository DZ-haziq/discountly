'use client';

import { useEffect, useRef } from 'react';

const RIBBON_TEXT = 'HAND-CHECKED · FULLY DISCLOSED · NO GIMMICKS · ';
const REPEAT = 6; // how many times the phrase repeats to fill the path

/**
 * Decorative band: forest-green background with a wavy SVG textPath
 * ribbon that flows continuously and speeds up with scroll velocity.
 * Motion is always looping (badge-like); reduced-motion collapses to
 * a static, fully-visible version.
 */
export function RibbonBand() {
  const textRef = useRef<SVGTextPathElement>(null);
  const velRef = useRef(0);
  const offsetRef = useRef(0);
  const lastScrollRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const motionOk = document.documentElement.classList.contains('motion-ok');

    function onScroll() {
      const y = window.scrollY;
      velRef.current = Math.abs(y - lastScrollRef.current);
      lastScrollRef.current = y;
    }

    function tick() {
      // Base speed + velocity boost
      const speed = 0.06 + velRef.current * 0.015;
      velRef.current *= 0.88; // dampen

      offsetRef.current -= speed;
      if (offsetRef.current < -50) offsetRef.current += 50;

      if (textRef.current) {
        textRef.current.setAttribute('startOffset', `${offsetRef.current}%`);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    if (motionOk) {
      window.addEventListener('scroll', onScroll, { passive: true });
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fullText = RIBBON_TEXT.repeat(REPEAT);

  // Sine-wave path across the SVG (width=1440, height=80, amplitude=14)
  const W = 1440;
  const H = 80;
  const A = 14;   // amplitude
  const freq = 2; // number of wave cycles
  const steps = 120;
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const x = (i / steps) * W;
    const y = H / 2 + A * Math.sin((i / steps) * freq * 2 * Math.PI);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const wavePath = pts.join(' ');

  return (
    <section
      aria-label="Decorative ribbon band"
      className="w-full overflow-hidden"
      style={{ background: 'var(--deep-green)', height: '80px' }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        width="100%"
        height="80"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path id="wave-path" d={wavePath} />
        </defs>
        <text
          fontSize="13"
          fill="white"
          fontFamily="var(--font-sora)"
          fontWeight="500"
          letterSpacing="0.22em"
          textAnchor="start"
          dominantBaseline="middle"
        >
          <textPath ref={textRef} href="#wave-path" startOffset="0%">
            {fullText}
          </textPath>
        </text>
      </svg>
    </section>
  );
}
