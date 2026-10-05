'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/stores?q=${encodeURIComponent(query)}`);
  }

  return (
    <header
      className="w-full sticky top-0 z-40"
      style={{
        background: 'var(--forest)',
        borderBottom: '1px solid rgba(191,227,142,0.12)',
      }}
    >
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo / wordmark */}
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
        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: 'var(--ink-muted)' }}
            />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search stores…"
              style={{
                width: '100%',
                paddingLeft: '2.25rem',
                paddingRight: q ? '2rem' : '1rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontFamily: 'var(--font-sora)',
                fontSize: 13,
                borderRadius: '999px',
                border: '1px solid rgba(191,227,142,0.2)',
                background: 'rgba(255,255,255,0.07)',
                color: 'var(--white)',
                outline: 'none',
                transition: 'border-color 0.18s, background 0.18s',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(191,227,142,0.5)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(191,227,142,0.2)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              }}
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" style={{ color: 'var(--ink-muted)' }} />
              </button>
            )}
          </div>
        </form>

        {/* Nav */}
        <nav className="flex items-center gap-3 shrink-0" aria-label="Main Navigation">
          <Link href="/stores" className="nav-link hidden sm:block" style={{ fontFamily: 'var(--font-sora)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Stores
          </Link>
          <Link href="/about" className="nav-link hidden md:block" style={{ fontFamily: 'var(--font-sora)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            About
          </Link>
          <Link href="/stores" className="header-browse-btn">
            Browse Stores
          </Link>
        </nav>
      </div>
    </header>
  );
}
