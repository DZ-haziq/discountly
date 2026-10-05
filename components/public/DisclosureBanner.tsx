import { Info } from 'lucide-react';
import Link from 'next/link';

export function DisclosureBanner() {
  return (
    <div
      className="w-full py-2 px-4"
      style={{
        background: 'var(--deep-green)',
        borderBottom: '1px solid rgba(191,227,142,0.15)',
      }}
    >
      <div className="max-w-[1120px] mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Info
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: 'var(--lime)' }}
          />
          <span
            style={{
              fontFamily: 'var(--font-sora)',
              fontSize: 11,
              color: 'rgba(240,237,228,0.75)',
              letterSpacing: '0.01em',
            }}
          >
            <strong style={{ color: 'rgba(240,237,228,0.95)', fontWeight: 600 }}>
              Editorial transparency:
            </strong>{' '}
            We independently research every store. When you buy via our links, we may earn an affiliate commission at no extra cost to you.
          </span>
        </div>
        <Link
          href="/how-we-choose-stores"
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
      </div>
    </div>
  );
}
