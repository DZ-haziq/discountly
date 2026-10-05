'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { RotatingBadge } from './RotatingBadge';

interface PortalHeroProps {
  headline: string;
  subtext: string;
}

/**
 * Scroll-driven portal hero.
 * - Two green panels part outward as the user scrolls
 * - Full-bleed CSS pattern background settles from slight overscale to 1
 * - Lime + orange dots travel to opposite corners
 * - Wordmark grows while tracking tightens and halves separate
 * - Notched hero card reveals behind the parting panels
 * - All driven from scroll position (requestAnimationFrame), reversible
 * - Motion gated on .motion-ok; no-JS / reduced-motion shows finished state
 */
export function PortalHero({ headline, subtext }: PortalHeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const dot1Ref = useRef<HTMLDivElement>(null);
  const dot2Ref = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const word1Ref = useRef<HTMLSpanElement>(null);
  const word2Ref = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const motionOk = document.documentElement.classList.contains('motion-ok');

    if (!motionOk) {
      // Show finished state immediately for reduced-motion
      if (leftPanelRef.current)  leftPanelRef.current.style.transform  = 'translateX(-110%)';
      if (rightPanelRef.current) rightPanelRef.current.style.transform = 'translateX(110%)';
      if (cardRef.current)       cardRef.current.style.opacity = '1';
      return;
    }

    function update() {
      const stage = stageRef.current;
      if (!stage) return;

      const rect = stage.getBoundingClientRect();
      const scrolled = -rect.top; // px scrolled into the sticky stage
      const totalScroll = rect.height - window.innerHeight; // total available scroll
      const rawProgress = scrolled / Math.max(1, totalScroll);
      const p = Math.max(0, Math.min(1, rawProgress)); // 0→1

      // ── Panels ──────────────────────────────────────────────────
      // Travel distance: slightly more than their own width (110%)
      const panelP = Math.min(1, p * 1.6);
      const panelX = panelP * 110; // % of their width
      if (leftPanelRef.current)
        leftPanelRef.current.style.transform = `translateX(-${panelX}%)`;
      if (rightPanelRef.current)
        rightPanelRef.current.style.transform = `translateX(${panelX}%)`;

      // ── Background image scale ────────────────────────────────────
      const bgScale = 1.08 - panelP * 0.08; // 1.08 → 1.00
      if (bgRef.current)
        bgRef.current.style.transform = `scale(${bgScale})`;

      // ── Lime wash opacity ─────────────────────────────────────────
      const washOpacity = panelP * 0.18;
      if (washRef.current)
        washRef.current.style.opacity = String(washOpacity);

      // ── Dots to corners ───────────────────────────────────────────
      const dotP = Math.min(1, p * 2);
      if (dot1Ref.current) {
        dot1Ref.current.style.transform = `translate(${-dotP * 180}px, ${-dotP * 120}px)`;
      }
      if (dot2Ref.current) {
        dot2Ref.current.style.transform = `translate(${dotP * 180}px, ${dotP * 120}px)`;
      }

      // ── Wordmark: grows + tracking tightens + halves separate ─────
      const wmP = Math.min(1, p * 1.8);
      const scale = 1 + wmP * 0.45; // 1 → 1.45
      const tracking = 0.04 - wmP * 0.05; // em, loosens to tightens
      const halvesDX = wmP * 48; // px
      if (wordmarkRef.current) {
        wordmarkRef.current.style.transform = `scale(${scale})`;
        wordmarkRef.current.style.letterSpacing = `${tracking}em`;
      }
      if (word1Ref.current)
        word1Ref.current.style.transform = `translateX(-${halvesDX}px)`;
      if (word2Ref.current)
        word2Ref.current.style.transform = `translateX(${halvesDX}px)`;

      // ── Hero card fade in after panels start parting ──────────────
      const cardOpacity = Math.min(1, Math.max(0, (panelP - 0.3) * 2.5));
      if (cardRef.current)
        cardRef.current.style.opacity = String(cardOpacity);

      rafRef.current = requestAnimationFrame(update);
    }

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    /*
     * Outer wrapper is 2.5vh tall — it creates the scroll travel.
     * The inner stage is sticky so it fills the viewport while scrolling.
     */
    <section
      ref={stageRef}
      style={{ height: '250vh', position: 'relative' }}
      aria-label="Hero section"
    >
      {/* Sticky stage */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        {/* ── Layer 1: CSS pattern background ─────────────────────── */}
        <div
          ref={bgRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse at 30% 60%, rgba(191,227,142,0.09) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(242,154,46,0.07) 0%, transparent 50%),
              repeating-linear-gradient(
                135deg,
                transparent,
                transparent 32px,
                rgba(191,227,142,0.04) 32px,
                rgba(191,227,142,0.04) 33px
              ),
              var(--deep-green)
            `,
            transform: 'scale(1.08)',
            willChange: 'transform',
          }}
        />

        {/* ── Layer 2: Lime wash ───────────────────────────────────── */}
        <div
          ref={washRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--lime)',
            mixBlendMode: 'overlay',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />

        {/* ── Layer 3: Radial vignette ─────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(20,30,14,0.65) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Hero card (behind panels) ────────────────────────────── */}
        <div
          ref={cardRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 1.5rem',
            opacity: 0,
            willChange: 'opacity',
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: 'var(--radius)',
              maxWidth: '560px',
              width: '100%',
              padding: 'clamp(2rem, 5vw, 3.5rem)',
              /* Notch cut from top-right corner */
              clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%)',
              position: 'relative',
            }}
          >
            {/* Rotating badge in the notch area */}
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
              <RotatingBadge />
            </div>

            {/* Pill chip */}
            <div className="pill-chip mb-5">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--lime)',
                  display: 'inline-block',
                }}
              />
              100% Hand-Checked Editorial Research
            </div>

            <h1
              className="heading-display"
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
                color: 'var(--ink)',
                marginBottom: '1rem',
              }}
            >
              {headline}
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-sora)',
                fontSize: 'clamp(13px, 1.4vw, 15px)',
                color: 'var(--ink-muted)',
                lineHeight: 1.65,
                marginBottom: '1.75rem',
              }}
            >
              {subtext}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link
                href="/stores"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 28px',
                  borderRadius: '999px',
                  background: 'var(--forest)',
                  color: 'var(--white)',
                  fontFamily: 'var(--font-sora)',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Browse All Stores
              </Link>
              <Link
                href="/how-we-choose-stores"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 24px',
                  borderRadius: '999px',
                  border: '1px solid var(--hairline)',
                  background: 'transparent',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-sora)',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                How We Choose Stores
              </Link>
            </div>
          </div>
        </div>

        {/* ── Left panel ───────────────────────────────────────────── */}
        <div
          ref={leftPanelRef}
          aria-hidden="true"
          className="hero-panel-left"
          style={{ willChange: 'transform' }}
        >
          {/* Wordmark left half */}
          <div
            style={{
              position: 'absolute',
              bottom: '2.5rem',
              right: 0,
              paddingRight: '1rem',
              overflow: 'hidden',
            }}
          >
            <div
              ref={wordmarkRef}
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                color: 'var(--white)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'flex',
                willChange: 'transform, letter-spacing',
                transformOrigin: 'center center',
              }}
            >
              <span ref={word1Ref} style={{ display: 'inline-block', willChange: 'transform' }}>
                dis
              </span>
              <span ref={word2Ref} style={{ display: 'inline-block', willChange: 'transform' }}>
                countly
              </span>
            </div>
          </div>
        </div>

        {/* ── Right panel ──────────────────────────────────────────── */}
        <div
          ref={rightPanelRef}
          aria-hidden="true"
          className="hero-panel-right"
          style={{ willChange: 'transform' }}
        />

        {/* ── Centre dots ──────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 4,
            display: 'flex',
            gap: '10px',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <div
            ref={dot1Ref}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--lime)',
              willChange: 'transform',
            }}
          />
          <div
            ref={dot2Ref}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--orange)',
              willChange: 'transform',
            }}
          />
        </div>

        {/* ── Scroll cue ───────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'var(--font-sora)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
          aria-hidden="true"
        >
          <span>Scroll</span>
          <div
            style={{
              width: 1,
              height: 36,
              background: 'rgba(191,227,142,0.4)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
