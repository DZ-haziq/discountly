'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Store {
  slug: string;
  name?: string;
  shortDescription?: string;
  logoUrl?: string;
  logoAlt?: string;
  bannerImageUrl?: string;
  ogImageUrl?: string;
  categoryIds?: string[];
  referralCode?: string;
  discountPercent?: string;
}

interface StoreDeckProps {
  stores: Store[];
  categories: Category[];
}

const MAX_VISIBLE = 3; // how many cards show in the stack
const THROW_THRESHOLD_RATIO = 0.1; // fraction of deck width to trigger throw

function DeckCard({
  store,
  categories,
  stackIndex,
  isTop,
}: {
  store: Store;
  categories: Category[];
  stackIndex: number;
  isTop: boolean;
}) {
  const storeName = store.name || 'Store';
  const initial = storeName.charAt(0).toUpperCase();
  const storeCategories = (categories || []).filter(
    c => c && Array.isArray(store.categoryIds) && store.categoryIds!.includes(c.id)
  );

  // Visual offset per stack position (back cards peeking below/behind)
  const offsetY = stackIndex * 10;
  const scale = 1 - stackIndex * 0.04;
  const rotate = stackIndex % 2 === 0 ? stackIndex * -1.5 : stackIndex * 1.5;

  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `translateY(${offsetY}px) scale(${scale}) rotate(${rotate}deg)`,
        zIndex: MAX_VISIBLE - stackIndex,
        borderRadius: 'var(--radius)',
        background: 'var(--white)',
        boxShadow: isTop ? 'var(--shadow-card)' : 'none',
        border: '1px solid var(--hairline)',
        overflow: 'hidden',
        willChange: 'transform',
        transformOrigin: 'bottom center',
        transition: isTop ? 'none' : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: isTop ? 'auto' : 'none',
        userSelect: 'none',
      }}
    >
      {/* Banner area */}
      <div
        className="h-40 relative flex items-end"
        style={{
          background: 'linear-gradient(135deg, var(--forest) 0%, #2a4020 100%)',
        }}
      >
        {/* Logo */}
        <div className="absolute top-4 left-4">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoUrl}
              alt={store.logoAlt || `${storeName} logo`}
              className="w-12 h-12 rounded-xl border-2 border-white/20 object-cover bg-white"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xl text-white">
              {initial}
            </div>
          )}
        </div>

        {/* Discount badge */}
        {store.discountPercent && (
          <div className="absolute top-4 right-4 bg-[var(--orange)] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {store.discountPercent}
          </div>
        )}

        {/* Verified */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs text-white/80 font-medium">
          <CheckCircle2 className="w-3 h-3 text-[var(--lime)]" />
          <span>Verified</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3">
        <div>
          <Link href={`/stores/${store.slug}`}>
            <h3 className="font-semibold text-lg text-[var(--ink)] leading-tight heading-display hover:text-[var(--forest)]">
              {storeName}
            </h3>
          </Link>
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed mt-1 line-clamp-2">
            {store.shortDescription}
          </p>
        </div>

        {/* Referral code */}
        {store.referralCode && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--cream)] border border-dashed border-[var(--hairline)] rounded-xl text-xs">
            <Tag className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />
            <span className="font-mono font-semibold text-[var(--ink)] tracking-wider">
              {store.referralCode}
            </span>
            <span className="text-[var(--ink-muted)] ml-auto">Use at checkout</span>
          </div>
        )}

        {/* Categories */}
        {storeCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {storeCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="text-[11px] uppercase tracking-[0.08em] font-medium px-2.5 py-1 rounded-full border border-[var(--hairline)] bg-[var(--cream)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--forest)] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--hairline)] mt-auto">
          <Link
            href={`/stores/${store.slug}`}
            className="text-sm font-medium text-[var(--ink)] hover:underline flex items-center gap-1"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href={`/go/${store.slug}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="text-sm font-semibold px-5 py-2 rounded-full bg-[var(--forest)] text-white hover:bg-[var(--deep-green)] transition-colors shadow-sm"
          >
            Visit Store
          </a>
        </div>
      </div>
    </div>
  );
}

export function StoreDeck({ stores, categories }: StoreDeckProps) {
  const [topIndex, setTopIndex] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragging = useRef(false);
  const startX = useRef(0);
  const currentDX = useRef(0);
  const topCardRef = useRef<HTMLDivElement>(null);

  const total = stores.length;

  const goNext = useCallback(() => {
    setTopIndex(i => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setTopIndex(i => (i - 1 + total) % total);
  }, [total]);

  // Pointer handlers (drag-to-throw)
  function onPointerDown(e: React.PointerEvent) {
    if (!deckRef.current) return;
    dragging.current = true;
    startX.current = e.clientX;
    currentDX.current = 0;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !topCardRef.current) return;
    const dx = e.clientX - startX.current;
    currentDX.current = dx;
    const rotate = (dx / 300) * 18;
    topCardRef.current.style.transform = `translateX(${dx}px) rotate(${rotate}deg) scale(1.02)`;
  }

  function onPointerUp() {
    if (!dragging.current || !topCardRef.current || !deckRef.current) return;
    dragging.current = false;

    const deckW = deckRef.current.offsetWidth;
    const threshold = deckW * THROW_THRESHOLD_RATIO;
    const dx = currentDX.current;

    if (Math.abs(dx) > threshold) {
      // Throw animation
      const direction = dx > 0 ? 1 : -1;
      topCardRef.current.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1)';
      topCardRef.current.style.transform = `translateX(${direction * deckW * 1.5}px) rotate(${direction * 35}deg) scale(1.02)`;
      setTimeout(() => {
        setTopIndex(i => (i + 1) % total);
      }, 420);
    } else {
      // Snap back
      topCardRef.current.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
      topCardRef.current.style.transform = '';
      setTimeout(() => {
        if (topCardRef.current) topCardRef.current.style.transition = '';
      }, 350);
    }
  }

  // Keyboard
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  }

  if (total === 0) {
    return (
      <div className="card-cream p-10 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-[var(--forest)] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-[var(--lime)]" />
        </div>
        <h3 className="heading-display text-xl text-[var(--ink)] mb-2">No featured stores yet</h3>
        <p className="text-sm text-[var(--ink-muted)]">
          Stores are added after passing our verification standards.
        </p>
      </div>
    );
  }

  // Build visible stack
  const visibleCards = Array.from({ length: Math.min(MAX_VISIBLE, total) }, (_, i) => ({
    store: stores[(topIndex + i) % total],
    stackIndex: i,
  }));

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Deck */}
      <div
        ref={deckRef}
        className="relative w-full max-w-sm"
        style={{ height: '440px', touchAction: 'pan-y' }}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label={`Store deck. ${total} stores. Use arrow keys to navigate.`}
        role="region"
      >
        {/* Render back cards (non-interactive) first */}
        {[...visibleCards].reverse().map(({ store, stackIndex }) => {
          if (stackIndex === 0) return null;
          return (
            <DeckCard
              key={`${store.slug}-${stackIndex}`}
              store={store}
              categories={categories}
              stackIndex={stackIndex}
              isTop={false}
            />
          );
        })}

        {/* Top card — interactive */}
        {visibleCards[0] && (
          <div
            ref={topCardRef}
            className="absolute inset-0"
            style={{
              zIndex: MAX_VISIBLE + 1,
              cursor: 'grab',
              touchAction: 'pan-y',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <DeckCard
              store={visibleCards[0].store}
              categories={categories}
              stackIndex={0}
              isTop
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={goPrev}
          aria-label="Previous store"
          className="btn-round-icon"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Store progress">
          {stores.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === topIndex}
              aria-label={`Store ${i + 1}`}
              onClick={() => setTopIndex(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === topIndex ? '20px' : '6px',
                height: '6px',
                background: i === topIndex ? 'var(--lime)' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          aria-label="Next store"
          className="btn-round-icon"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-white/50 font-medium" aria-live="polite">
        {topIndex + 1} / {total}
      </p>
    </div>
  );
}
