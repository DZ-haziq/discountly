'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { RotatingBadge } from './RotatingBadge';
import { RotatingWords } from './RotatingWords';

interface PortalHeroProps {
  headline: string;
  subtext: string;
  storeCount?: number;
  categoryCount?: number;
}

/**
 * A7 fix: The headline text is fully present in SSR HTML.
 * Words are wrapped in spans for CSS-only stagger animation.
 * The `motion` initial state uses opacity:0, which means crawlers
 * see 0-opacity text. Fix: render a visible <h1> as the base; overlay
 * the animation as a CSS-classed element that is aria-hidden.
 * Actually the simpler correct fix is: don't start at opacity:0; use
 * CSS animation classes instead so the base render is always visible.
 *
 * We use a CSS class approach: the h1 is always visible (opacity:1 by default),
 * and we add a JS-driven animation after hydration via `useEffect`.
 */
function SplitHeadline({ text }: { text: string }) {
  const shouldReduce = useReducedMotion();
  const words = text.split(' ');
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after first paint so SSR HTML is always opacity:1
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (shouldReduce || !animated) {
    // SSR / reduced motion: plain visible h1 — full text, normal opacity
    return (
      <h1
        className="heading-display"
        style={{
          fontSize: 'clamp(1.45rem, 5.5vw, 3.25rem)',
          color: 'var(--white)',
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
          maxWidth: '100%',
          overflowWrap: 'break-word',
        }}
      >
        {text}
      </h1>
    );
  }

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05,
      },
    },
  };

  const wordVariant = {
    hidden: { opacity: 1, y: 0 }, // start visible so flash is avoided
    visible: { opacity: 1, y: 0, transition: { duration: 0 } },
  };

  // After client hydrates we run a CSS keyframe approach via motion
  // but we keep text always visible (opacity starts at 1)
  const revealVariant = {
    hidden: { clipPath: 'inset(0 100% 0 0)' },
    visible: {
      clipPath: 'inset(0 0% 0 0)',
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.h1
      className="heading-display"
      style={{
        fontSize: 'clamp(1.45rem, 5.5vw, 3.25rem)',
        color: 'var(--white)',
        lineHeight: 1.12,
        letterSpacing: '-0.02em',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0 0.28em',
        maxWidth: '100%',
        overflowWrap: 'break-word',
      }}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariant}
          style={{ display: 'inline-block', maxWidth: '100%', overflow: 'hidden' }}
        >
          <motion.span variants={revealVariant} style={{ display: 'inline-block' }}>
            {word}
          </motion.span>
        </motion.span>
      ))}
    </motion.h1>
  );
}

export function PortalHero({ headline, subtext }: PortalHeroProps) {
  const [isParted, setIsParted] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Auto-split on page load / reload
  useEffect(() => {
    const t1 = setTimeout(() => setIsParted(true), 600);
    const t2 = setTimeout(() => setAnimationComplete(true), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section
      aria-label="Hero section"
      className="paper-grain relative w-full overflow-hidden flex items-center"
      style={{
        background: 'var(--forest)',
        minHeight: 'clamp(480px, 80vh, 820px)',
        paddingTop: 'clamp(2.5rem, 5vw, 4.5rem)',
        paddingBottom: 'clamp(3rem, 6vw, 5rem)',
      }}
    >
      {/* ── Background: Decorative atmospheric gradients & watermark ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none"
        style={{ zIndex: 0 }}
      >
        <span
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 900,
            fontSize: 'clamp(3rem, 10vw, 7rem)',
            color: 'var(--white)',
            opacity: 0.05,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          DISCOUNTLY
        </span>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(191,227,142,0.12) 0%, transparent 70%)', zIndex: 0 }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(242,154,46,0.08) 0%, transparent 70%)', zIndex: 0 }}
      />

      {/* ── MAIN HERO CONTENT ── */}
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 relative" style={{ zIndex: 2 }}>
        {/* A1 fix: single-column layout — no hardcoded store preview cards */}
        <div className="flex flex-col items-center text-center gap-5 max-w-[720px] mx-auto">
          {/* Pill Chip + Rotating Words */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div
              className="pill-chip pill-chip-light"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(191,227,142,0.4)',
                color: '#F4F8EE',
                fontSize: '11px',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--lime)',
                  display: 'inline-block',
                  boxShadow: '0 0 8px var(--lime)',
                }}
                aria-hidden="true"
              />
              {/* A6 fix: pill chip text is presentational — no heading level */}
              Independent editorial research
            </div>
            <RotatingWords />
          </div>

          {/* A7 fix: SplitHeadline is always visible in SSR; animation is clip-path reveal */}
          <SplitHeadline text={headline} />

          {/* Editorial Lead Paragraph */}
          <p
            style={{
              fontFamily: 'var(--font-sora)',
              fontSize: 'clamp(14.5px, 1.4vw, 16px)',
              color: '#E4ECD9',
              fontWeight: 500,
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '38rem',
            }}
          >
            Every store is researched by a person, checked for security and disclosed in full, so you can click through with confidence.
          </p>

          {/* Subtext Paragraph */}
          <p
            style={{
              fontFamily: 'var(--font-sora)',
              fontSize: 'clamp(13px, 1.3vw, 14px)',
              color: 'rgba(240, 237, 228, 0.78)',
              lineHeight: 1.65,
              margin: 0,
              maxWidth: '36rem',
            }}
          >
            {subtext}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/stores"
              className="btn-primary touch-target"
              style={{
                background: 'var(--lime)',
                color: 'var(--deep-green)',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Browse all stores
            </Link>
            <Link
              href="/categories"
              className="btn-outline-accessible touch-target"
              style={{ fontSize: 13 }}
            >
              Browse by category
            </Link>
          </div>
        </div>

        {/* Decorative badge — no heading levels inside */}
        <div className="absolute -top-8 right-4 hidden lg:block" aria-hidden="true">
          <RotatingBadge />
        </div>
      </div>

      {/* ── CINEMATIC SPLIT SCREEN CURTAINS (auto-splits on load) ── */}
      {!animationComplete && (
        <div
          aria-hidden={isParted ? 'true' : 'false'}
          className={`fixed inset-0 overflow-hidden select-none ${isParted ? 'pointer-events-none' : ''}`}
          style={{ zIndex: 9999 }}
        >
          {/* Left Curtain Panel: "DISCO" */}
          <motion.div
            initial={{ x: '0%' }}
            animate={{ x: isParted ? '-102%' : '0%' }}
            transition={{ duration: 1.0, ease: [0.77, 0, 0.175, 1] as const }}
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-[var(--forest)] border-r border-[rgba(191,227,142,0.18)] flex items-center justify-end overflow-hidden"
          >
            <motion.span
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: isParted ? 0 : 1, x: isParted ? -60 : 0 }}
              transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] as const }}
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
                color: 'var(--white)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: 1,
                display: 'block',
              }}
            >
              DISCO
            </motion.span>
          </motion.div>

          {/* Right Curtain Panel: "UNTLY" */}
          <motion.div
            initial={{ x: '0%' }}
            animate={{ x: isParted ? '102%' : '0%' }}
            transition={{ duration: 1.0, ease: [0.77, 0, 0.175, 1] as const }}
            className="absolute top-0 bottom-0 right-0 w-1/2 bg-[var(--forest)] border-l border-[rgba(191,227,142,0.18)] flex items-center justify-start overflow-hidden"
          >
            <motion.span
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: isParted ? 0 : 1, x: isParted ? 60 : 0 }}
              transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] as const }}
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
                color: 'var(--white)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: 1,
                display: 'block',
              }}
            >
              UNTLY
            </motion.span>
          </motion.div>
        </div>
      )}
    </section>
  );
}
