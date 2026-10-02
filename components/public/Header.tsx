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
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-40">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded bg-[var(--black)] text-white flex items-center justify-center font-bold text-lg tracking-tight transition-transform group-hover:scale-105">
            D
          </div>
          <span className="font-semibold text-xl tracking-tight text-[var(--text)] hidden sm:block">
            Discountly
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search stores..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-full border border-[var(--border)] bg-[var(--off-white)] text-[var(--text)] focus:outline-none focus:border-[var(--black)] focus:bg-white transition-colors"
            />
            {q && (
              <button type="button" onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
            )}
          </div>
        </form>

        {/* Nav */}
        <nav className="flex items-center gap-4 text-sm font-medium text-[var(--text-muted)] shrink-0" aria-label="Main Navigation">
          <Link href="/stores" className="hover:text-[var(--text)] transition-colors hidden sm:block">
            Stores
          </Link>
          <Link href="/about" className="hover:text-[var(--text)] transition-colors hidden md:block">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
