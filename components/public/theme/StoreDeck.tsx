'use client';

import { useState, useRef, useEffect, useCallback, useMemo, MouseEvent } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import {
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

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
  canonicalUrl?: string;
  destinationUrl?: string;
  categoryIds?: string[];
  referralCode?: string;
  discountPercent?: string;
  verifiedDiscount?: {
    percentOrText: string;
    code?: string;
  };
}

interface StoreDeckProps {
  stores: Store[];
  categories: Category[];
}

function CouponPill({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 p-2.5 bg-[var(--cream)] border border-dashed border-[var(--hairline)] rounded-xl text-xs">
      <div className="flex items-center gap-2 overflow-hidden mr-2 min-w-0 flex-1">
        <Tag className="w-3.5 h-3.5 text-[var(--forest)] shrink-0" aria-hidden="true" />
        <span className="font-mono font-bold text-[var(--ink)] tracking-wider px-2 py-0.5 bg-[var(--white)] rounded border border-[var(--hairline)] truncate max-w-[150px]">
          {code}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-[var(--ink-muted)] hidden xs:inline">
          Use at checkout
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy coupon code ${code}`}
          className="touch-target px-2.5 py-1 rounded-md bg-[var(--forest)] text-[var(--white)] font-semibold text-[11px] hover:bg-[var(--deep-green)] transition-all flex items-center gap-1 cursor-pointer"
          style={{ minHeight: '32px' }}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[var(--lime)]" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Premium Store Card with Top Banner
 * - Hero banner on top with image or gradient and glass badges
 * - Cleanly elevated framed logo (object-contain, no cropping)
 * - Balanced layout: verified badges, store title, categories, clean 2-line description
 * - Feature/perk row prevents empty gaps when no coupon code is present
 * - Interactive 3D tilt on hover with smooth lift-up physics
 */
function TiltStoreCard({
  store,
  categories,
  isDragging,
}: {
  store: Store;
  categories: Category[];
  isDragging: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  const storeName = store.name || 'Store';
  const initial = storeName.charAt(0).toUpperCase();

  const storeCategories = (categories || []).filter(
    c => c && Array.isArray(store.categoryIds) && store.categoryIds!.includes(c.id)
  );

  const discountText =
    store.discountPercent || store.verifiedDiscount?.percentOrText;
  const couponCode = store.referralCode || store.verifiedDiscount?.code;
  const destination = store.destinationUrl || store.canonicalUrl || '';
  const hasDestination = Boolean(destination && destination.trim());

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isDragging || !cardRef.current || e.buttons > 0) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = -y * 10;
      const rotateY = x * 10;
      cardRef.current.style.transform =
        `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale(1.015)`;
      cardRef.current.style.boxShadow = '0 24px 44px -12px rgba(10, 24, 12, 0.22)';
    },
    [isDragging]
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    cardRef.current.style.boxShadow = '0 10px 28px -8px rgba(10, 24, 12, 0.08)';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col justify-between rounded-2xl bg-[var(--white)] border border-[var(--hairline)] overflow-hidden w-full"
      style={{
        minHeight: '410px',
        height: '100%',
        transition: 'transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.26s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        userSelect: 'none',
        boxShadow: '0 10px 28px -8px rgba(10, 24, 12, 0.08)',
      }}
    >
      {/* ── 1. CARD TOP BANNER ── */}
      <div
        className="h-28 sm:h-32 relative w-full overflow-hidden shrink-0"
        style={{
          background: 'linear-gradient(135deg, var(--forest) 0%, #203518 60%, #152410 100%)',
        }}
      >
        {/* Banner image (if available) */}
        {store.bannerImageUrl && !bannerError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.bannerImageUrl}
            alt={`${storeName} banner`}
            className="w-full h-full object-cover"
            onError={() => setBannerError(true)}
          />
        ) : (
          /* Subtle decorative atmospheric pattern if no banner image */
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 80% 20%, rgba(191,227,142,0.4) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(242,154,46,0.3) 0%, transparent 50%)',
            }}
          />
        )}

        {/* Banner soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Top-Right Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {discountText && (
            <span className="bg-[var(--orange)] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
              {discountText}
            </span>
          )}
          <span className="bg-white/20 backdrop-blur-md text-white text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white/20">
            <CheckCircle2 className="w-3 h-3 text-[var(--lime)]" /> Verified
          </span>
        </div>

        {/* Brand Logo cleanly elevated at the bottom-left */}
        <div
          className="absolute -bottom-5 left-5 z-20 w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md border-2 border-white overflow-hidden flex items-center justify-center"
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
        >
          {store.logoUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoUrl}
              alt={store.logoAlt || `${storeName} official logo`}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <span
              className="font-mono font-bold text-lg"
              style={{ color: 'var(--forest)' }}
            >
              {initial}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. CARD BODY ── */}
      <div className="pt-7 px-5 pb-5 flex flex-col flex-1 justify-between gap-3 min-w-0">
        <div className="flex flex-col gap-2 min-w-0">
          {/* Category eyebrow badge on mobile so store name gets full width */}
          {storeCategories.length > 0 && (
            <div className="sm:hidden -mb-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border border-[var(--hairline)] bg-[var(--cream)] text-[var(--forest)] inline-block">
                {storeCategories[0]?.name}
              </span>
            </div>
          )}

          {/* Title + Desktop Category with full overflow protection */}
          <div className="flex items-center justify-between gap-2.5 min-w-0">
            <Link
              href={`/stores/${store.slug}`}
              className="min-w-0 flex-1 block"
              title={storeName}
            >
              <h3
                className="font-bold text-base sm:text-lg text-[var(--ink)] heading-display hover:text-[var(--forest)] transition-colors store-deck-card-title m-0"
                style={{ lineHeight: 1.25 }}
              >
                {storeName}
              </h3>
            </Link>

            {/* Desktop category badge on the right */}
            {storeCategories.length > 0 && (
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border border-[var(--hairline)] bg-[var(--cream)] text-[var(--ink-muted)] shrink-0 max-w-[120px] truncate">
                {storeCategories[0]?.name}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed line-clamp-2 m-0 min-w-0 break-words">
            {store.shortDescription || 'Verified online store reviewed for security, clear policies, and customer warranty terms.'}
          </p>
        </div>

        {/* ── Middle Row: Coupon Code OR Verified Perk (Never leaves dead space) ── */}
        <div className="my-1">
          {couponCode ? (
            <CouponPill code={couponCode} />
          ) : (
            <div className="flex items-center justify-between gap-2 p-2.5 bg-[var(--cream)] border border-[var(--hairline)] rounded-xl text-xs text-[var(--ink-muted)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--forest)] shrink-0" />
                <span className="font-medium text-[11px] sm:text-[11.5px] text-[var(--ink)]">
                  Direct Merchant Warranty &amp; Return Terms
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white border border-[var(--hairline)] text-[var(--forest)] font-semibold shrink-0">
                Audited
              </span>
            </div>
          )}
        </div>

        {/* ── 3. CARD FOOTER: Details link + Visit Store action ── */}
        <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-[var(--hairline)] mt-auto">
          <Link
            href={`/stores/${store.slug}`}
            aria-label={`View details for ${storeName}`}
            className="touch-target text-xs sm:text-sm font-semibold text-[var(--ink)] hover:text-[var(--forest)] hover:underline flex items-center gap-1"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {hasDestination ? (
            <a
              href={`/go/${store.slug}`}
              target="_blank"
              rel="sponsored noopener noreferrer"
              aria-label={`Visit official ${storeName} store in new tab`}
              className="visit-store-glow touch-target text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-full bg-[var(--forest)] text-white hover:bg-[var(--deep-green)] transition-all shadow-sm flex items-center gap-1.5"
              style={{ minHeight: '38px' }}
            >
              <span>Visit Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="touch-target text-xs sm:text-sm font-bold px-4 py-2 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed flex items-center gap-1.5"
              style={{ minHeight: '38px' }}
            >
              <span>Store Unavailable</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function StoreDeck({ stores, categories }: StoreDeckProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Filter stores according to category chips
  const filteredStores = useMemo(() => {
    if (selectedCategory === 'all') return stores;
    return stores.filter(
      s => Array.isArray(s.categoryIds) && s.categoryIds.includes(selectedCategory)
    );
  }, [stores, selectedCategory]);

  const total = filteredStores.length;

  // Initialize Embla Carousel with draggable options
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: total > 2,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    const onPointerDown = () => setIsDragging(true);
    const onPointerUp = () => setIsDragging(false);

    emblaApi.on('pointerDown', onPointerDown);
    emblaApi.on('pointerUp', onPointerUp);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('pointerDown', onPointerDown);
      emblaApi.off('pointerUp', onPointerUp);
    };
  }, [emblaApi, onSelect]);

  // Reset scroll position when category changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0);
      setSelectedIndex(0);
    }
  }, [selectedCategory, emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Category Filter Chips Above Carousel */}
      <div
        className="w-full max-w-full overflow-x-auto no-scrollbar py-1 px-4 flex flex-nowrap sm:flex-wrap items-center sm:justify-center gap-2 select-none"
        role="group"
        aria-label="Category filter chips"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 touch-target px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[var(--lime)] text-[var(--deep-green)] shadow-md'
              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/20'
          }`}
          style={{ minHeight: '38px' }}
        >
          All Stores
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 touch-target px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[var(--lime)] text-[var(--deep-green)] shadow-md'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/20'
            }`}
            style={{ minHeight: '38px' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Drag Carousel Container */}
      {total === 0 ? (
        <div className="card-cream p-8 text-center max-w-md mx-auto my-6">
          <p className="text-sm font-semibold text-[var(--ink)]">
            No stores found in this category.
          </p>
        </div>
      ) : (
        <div className="relative w-full max-w-6xl px-3 sm:px-14 store-deck-carousel-outer">
          {/* Left Arrow Button: Visible on desktop, hidden on mobile */}
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous store"
            className="hidden sm:flex btn-round-icon absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-20 shadow-xl touch-target cursor-pointer hover:scale-105 transition-transform"
            style={{
              background: 'var(--white)',
              color: 'var(--ink)',
              border: '1px solid var(--hairline)',
              width: '42px',
              height: '42px',
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Embla Viewport */}
          <div
            ref={emblaRef}
            className="overflow-hidden cursor-grab active:cursor-grabbing py-3"
            aria-label="Draggable featured stores carousel. Press and drag left or right to explore stores."
          >
            {/* Embla Slides Container: Exactly 2 cards displayed on web (md:), 1 card on mobile */}
            <div className="flex gap-4 sm:gap-6 -ml-2 pl-2 sm:-ml-3 sm:pl-3">
              {filteredStores.map(store => (
                <div
                  key={store.slug}
                  className="flex-[0_0_88%] sm:flex-[0_0_75%] md:flex-[0_0_calc(50%-12px)] min-w-0"
                >
                  <TiltStoreCard
                    store={store}
                    categories={categories}
                    isDragging={isDragging}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow Button: Visible on desktop, hidden on mobile */}
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next store"
            className="hidden sm:flex btn-round-icon absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-20 shadow-xl touch-target cursor-pointer hover:scale-105 transition-transform"
            style={{
              background: 'var(--white)',
              color: 'var(--ink)',
              border: '1px solid var(--hairline)',
              width: '42px',
              height: '42px',
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Mobile Navigation Controls: Sleek thumb-friendly arrows + dots */}
      {total > 0 && (
        <div className="flex sm:hidden items-center justify-between w-full max-w-[280px] px-2 mt-2">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous store slide"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white border border-white/20 transition-all cursor-pointer flex items-center justify-center touch-target"
            style={{ width: '40px', height: '40px' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Carousel pagination tabs">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === selectedIndex}
                aria-label={`Go to slide ${i + 1} of ${scrollSnaps.length}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className="touch-target flex items-center justify-center cursor-pointer p-1.5"
              >
                <span
                  className="transition-all duration-300 rounded-full block"
                  style={{
                    width: i === selectedIndex ? '24px' : '7px',
                    height: '7px',
                    background: i === selectedIndex ? 'var(--lime)' : 'rgba(255, 255, 255, 0.35)',
                  }}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next store slide"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white border border-white/20 transition-all cursor-pointer flex items-center justify-center touch-target"
            style={{ width: '40px', height: '40px' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Desktop Controls: Pagination Dots + Drag Hint */}
      {total > 0 && (
        <div className="hidden sm:flex flex-col items-center gap-2 mt-1">
          {/* Dots list with >= 44x44px touch targets */}
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="Carousel pagination tabs"
          >
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === selectedIndex}
                aria-label={`Go to slide ${i + 1} of ${scrollSnaps.length}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className="touch-target flex items-center justify-center cursor-pointer p-2"
                style={{ minWidth: '36px', minHeight: '36px' }}
              >
                <span
                  className="transition-all duration-300 rounded-full block"
                  style={{
                    width: i === selectedIndex ? '28px' : '8px',
                    height: '8px',
                    background:
                      i === selectedIndex ? 'var(--lime)' : 'rgba(255, 255, 255, 0.35)',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Interactive prompt */}
          <p
            className="text-xs text-white/70 font-semibold flex items-center gap-2 select-none"
            aria-live="polite"
          >
            <span>← Press &amp; drag left or right to explore →</span>
          </p>
        </div>
      )}
    </div>
  );
}
