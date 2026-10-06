'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Menu } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onScroll() {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 30);

      // Smart navbar: hide on scroll down, show on scroll up
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current + 6) {
          // Scrolling down
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY.current - 6) {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/stores?q=${encodeURIComponent(query)}`);
  }

  return (
    <header
      className={`w-full sticky top-0 z-40 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'backdrop-blur-md bg-[rgba(20,30,14,0.88)] shadow-md border-b border-[rgba(191,227,142,0.15)]'
          : 'bg-[rgba(31,45,23,0.95)] border-b border-[rgba(191,227,142,0.1)]'
      }`}
    >
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Logo / Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'transform 0.18s',
            }}
            className="group-hover:scale-105"
          >
            <span
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: 15,
                color: 'var(--deep-green)',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              D
            </span>
          </div>
          <span
            className="hidden sm:block"
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 800,
              fontSize: 18,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              color: 'var(--white)',
            }}
          >
            discountly
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden sm:block">
          <div className="relative flex items-center">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'rgba(240,237,228,0.7)' }}
              aria-hidden="true"
            />
            <label htmlFor="header-search-input" className="sr-only">
              Search stores
            </label>
            <input
              id="header-search-input"
              ref={inputRef}
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search stores…"
              style={{
                width: '100%',
                minHeight: '40px',
                paddingLeft: '2.3rem',
                paddingRight: q ? '2.5rem' : '1rem',
                paddingTop: '0.4rem',
                paddingBottom: '0.4rem',
                fontFamily: 'var(--font-sora)',
                fontSize: 13,
                borderRadius: '999px',
                border: '1px solid rgba(191,227,142,0.22)',
                background: 'rgba(255,255,255,0.07)',
                color: 'var(--white)',
                outline: 'none',
                transition: 'border-color 0.18s, background 0.18s',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(191,227,142,0.6)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(191,227,142,0.22)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              }}
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 touch-target p-1"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4 text-white/70 hover:text-white" />
              </button>
            )}
          </div>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 shrink-0" aria-label="Main Navigation">
          <Link
            href="/stores"
            className="nav-link"
            style={{ fontFamily: 'var(--font-sora)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Stores
          </Link>
          <Link
            href="/categories"
            className="nav-link"
            style={{ fontFamily: 'var(--font-sora)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Categories
          </Link>
          <Link
            href="/how-we-choose-stores"
            className="nav-link"
            style={{ fontFamily: 'var(--font-sora)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            How We Choose
          </Link>
          <Link
            href="/about"
            className="nav-link"
            style={{ fontFamily: 'var(--font-sora)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            About
          </Link>
          <Link
            href="/stores"
            className="header-browse-btn"
            style={{ textDecoration: 'none' }}
          >
            Browse Stores
          </Link>
        </nav>

        {/* Mobile / Tablet actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/stores"
            className="header-browse-btn text-xs px-3 py-1.5"
            style={{ textDecoration: 'none' }}
          >
            Browse Stores
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="touch-target p-2 rounded-lg text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t border-[rgba(191,227,142,0.15)] bg-[rgba(20,30,14,0.98)] px-4 py-4 space-y-2 shadow-xl backdrop-blur-md"
        >
          <form onSubmit={handleSearch} className="mb-4 sm:hidden">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'rgba(240,237,228,0.7)' }}
                aria-hidden="true"
              />
              <label htmlFor="mobile-search-input" className="sr-only">
                Search stores
              </label>
              <input
                id="mobile-search-input"
                type="search"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search stores…"
                className="w-full min-h-[44px] pl-9 pr-4 py-2 rounded-full bg-white/10 text-white text-sm outline-none border border-white/20"
              />
            </div>
          </form>

          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            <Link
              href="/stores"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3 py-2 text-white/90 hover:text-[var(--lime)] font-semibold text-sm rounded-lg hover:bg-white/5"
            >
              Stores
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3 py-2 text-white/90 hover:text-[var(--lime)] font-semibold text-sm rounded-lg hover:bg-white/5"
            >
              Categories
            </Link>
            <Link
              href="/how-we-choose-stores"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3 py-2 text-white/90 hover:text-[var(--lime)] font-semibold text-sm rounded-lg hover:bg-white/5"
            >
              How We Choose
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3 py-2 text-white/90 hover:text-[var(--lime)] font-semibold text-sm rounded-lg hover:bg-white/5"
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
