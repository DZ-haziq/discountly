'use client';

import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import Link from 'next/link';

export function DisclosureBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem('discountly_transparency_dismissed');
      if (isDismissed === 'true') {
        setDismissed(true);
      }
    } catch {
      // Ignore sessionStorage exceptions (e.g. private mode)
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem('discountly_transparency_dismissed', 'true');
    } catch {
      // Ignore sessionStorage exceptions
    }
  }

  if (dismissed) return null;

  return (
    <aside
      aria-label="Editorial transparency announcement"
      className="w-full py-2 px-4 transition-all duration-200"
      style={{
        background: 'var(--deep-green)',
        borderBottom: '1px solid rgba(191,227,142,0.18)',
      }}
    >
      <div className="max-w-[1120px] mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Info
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: 'var(--lime)' }}
            aria-hidden="true"
          />
          <span
            style={{
              fontFamily: 'var(--font-sora)',
              fontSize: 11,
              color: 'rgba(240,237,228,0.88)',
              letterSpacing: '0.01em',
            }}
          >
            <strong style={{ color: 'rgba(240,237,228,0.98)', fontWeight: 600 }}>
              Editorial transparency:
            </strong>{' '}
            We independently research every store. When you buy via our links, we may earn an affiliate commission at no extra cost to you.
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/how-we-choose-stores"
            className="touch-target"
            style={{
              fontFamily: 'var(--font-sora)',
              fontSize: 11,
              color: 'var(--lime)',
              textDecoration: 'underline',
              flexShrink: 0,
            }}
          >
            How we choose stores
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss editorial transparency announcement"
            className="touch-target p-1 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
            style={{
              width: 36,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
