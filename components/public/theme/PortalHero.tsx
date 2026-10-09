'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { RotatingBadge } from './RotatingBadge';
import { RotatingWords } from './RotatingWords';
import {
  CheckCircle2,
  Tag,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface PortalHeroProps {
  headline: string;
  subtext: string;
  storeCount?: number;
  categoryCount?: number;
}

/** Split headline into words with staggered animation */
function SplitHeadline({ text }: { text: string }) {
  const shouldReduce = useReducedMotion();
  const words = text.split(' ');

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.04,
        delayChildren: shouldReduce ? 0 : 0.25,
      },
    },
  };

  const wordVariant = {
    hidden: {
      opacity: 0,
      y: shouldReduce ? 0 : 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
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
        <span key={i} style={{ overflow: 'hidden', display: 'inline-block', maxWidth: '100%' }}>
          <motion.span variants={wordVariant} style={{ display: 'inline-block', maxWidth: '100%' }}>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}

export function PortalHero({ headline, subtext }: PortalHeroProps) {
  const [isParted, setIsParted] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const handleOpen = useCallback(() => {
    if (isParted) return;
    setIsParted(true);
    setTimeout(() => {
      setAnimationComplete(true);
    }, 1100);
  }, [isParted]);

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
        minHeight: 'clamp(560px, 86vh, 900px)',
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

      {/* ── MAIN HERO CONTENT (Completely stationary, does NOT move up) ── */}
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 relative" style={{ zIndex: 2 }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ── LEFT COLUMN ────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Pill Chip + Rotating Words */}
            <div className="flex flex-wrap items-center gap-3">
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
                100% Hand-Checked Editorial Research
              </div>
              <RotatingWords />
            </div>

            {/* Split Headline with smooth word-by-word reveal */}
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
              }}
            >
              {subtext}
            </p>
          </div>

          {/* ── RIGHT COLUMN: Stacked Preview Cards ─────────────── */}
          <div className="lg:col-span-5 hidden md:flex flex-col items-center justify-center relative">
            <div className="absolute -top-12 -right-4 z-20">
              <RotatingBadge />
            </div>

            <div
              className="relative w-full max-w-[360px]"
              style={{ height: '390px' }}
              aria-label="Featured store previews"
            >
              {/* Card 3: Back */}
              <div
                className="absolute inset-0 card-hover-lift rounded-2xl bg-[var(--white)] p-5 flex flex-col justify-between border border-[var(--hairline)] transition-all duration-300"
                style={{ transform: 'translateY(28px) scale(0.92) rotate(3deg)', boxShadow: '0 8px 24px rgba(20,30,14,0.15)', zIndex: 1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--forest)] text-[var(--lime)] font-bold flex items-center justify-center font-mono text-sm">M</div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--ink)]">Matador Equipment</h3>
                      <span className="text-[10px] uppercase font-semibold text-[var(--ink-muted)]">Outdoor &amp; Gear</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#EAF5E1] text-[var(--forest)] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[var(--forest)]" /> Verified
                  </span>
                </div>
                <p className="text-xs text-[var(--ink-muted)] line-clamp-2 my-2 leading-relaxed">Ultralight packable travel gear, waterproof backpacks, and compact outdoor accessories.</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--hairline)]">
                  <span className="font-semibold text-[var(--ink)]">3-Year Warranty</span>
                  <Link href="/stores/matador-equipment" className="text-[var(--forest)] font-bold underline flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></Link>
                </div>
              </div>

              {/* Card 2: Middle */}
              <div
                className="absolute inset-0 card-hover-lift rounded-2xl bg-[var(--white)] p-5 flex flex-col justify-between border border-[var(--hairline)] transition-all duration-300"
                style={{ transform: 'translateY(14px) scale(0.96) rotate(-2deg)', boxShadow: '0 12px 28px rgba(20,30,14,0.18)', zIndex: 2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--forest)] text-[var(--lime)] font-bold flex items-center justify-center font-mono text-sm">F</div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--ink)]">Fellow Products</h3>
                      <span className="text-[10px] uppercase font-semibold text-[var(--ink-muted)]">Home &amp; Kitchen</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#EAF5E1] text-[var(--forest)] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[var(--forest)]" /> Verified
                  </span>
                </div>
                <p className="text-xs text-[var(--ink-muted)] line-clamp-2 my-2 leading-relaxed">Design-driven coffee brewing gear, precision electric kettles, and vacuum canisters.</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--hairline)]">
                  <span className="font-semibold text-[var(--ink)]">Direct Warranty</span>
                  <Link href="/stores/fellow-products" className="text-[var(--forest)] font-bold underline flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></Link>
                </div>
              </div>

              {/* Card 1: Front */}
              <div
                className="absolute inset-0 card-hover-lift rounded-2xl bg-[var(--white)] p-5 flex flex-col justify-between border border-[var(--hairline)] transition-all duration-300"
                style={{ transform: 'translateY(0) scale(1) rotate(0deg)', boxShadow: 'var(--shadow-card)', zIndex: 3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--forest)] text-[var(--lime)] font-bold flex items-center justify-center font-mono text-sm">A</div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--ink)]">Anker Direct</h3>
                      <span className="text-[10px] uppercase font-semibold text-[var(--ink-muted)]">Electronics &amp; Tech</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#EAF5E1] text-[var(--forest)] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[var(--forest)]" /> Verified
                  </span>
                </div>
                <p className="text-xs text-[var(--ink-muted)] line-clamp-2 my-2 leading-relaxed">Official online store for Anker charging accessories, portable power stations, and USB-C hubs.</p>
                <div className="flex items-center gap-2 py-1.5 px-2.5 bg-[var(--cream)] rounded-lg text-xs">
                  <Tag className="w-3 h-3 text-[var(--forest)] shrink-0" />
                  <span className="font-mono font-bold text-[var(--ink)] text-[11px]">HAND-CHECKED</span>
                  <span className="text-[10px] text-[var(--ink-muted)] ml-auto">18-24 Mo Warranty</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--hairline)]">
                  <Link href="/stores/anker-direct" className="text-[var(--ink)] font-semibold hover:underline flex items-center gap-1">
                    <span>Details</span><ArrowRight className="w-3 h-3" />
                  </Link>
                  <a
                    href="/go/anker-direct"
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    aria-label="Visit official Anker Direct store in new tab"
                    className="visit-store-glow font-bold text-xs px-3.5 py-1.5 rounded-full bg-[var(--forest)] text-white hover:bg-[var(--deep-green)] transition-colors shadow-sm inline-flex items-center gap-1"
                  >
                    <span>Visit Store</span><ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── CINEMATIC SPLIT SCREEN CURTAINS (auto-splits on load) ── */}
      {!animationComplete && (
        <div
          onClick={handleOpen}
          aria-hidden={isParted ? 'true' : 'false'}
          className={`fixed inset-0 overflow-hidden select-none ${isParted ? 'pointer-events-none' : 'cursor-pointer'}`}
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
