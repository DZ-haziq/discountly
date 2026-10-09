'use client';

const TRUST_KEYWORDS = [
  'HAND-CHECKED RESEARCH',
  'NO FAKE PRICES',
  'ZERO SPONSORED RANKINGS',
  'VERIFIED RETURN TERMS',
  'ENCRYPTED CHECKOUT',
  'FULLY DISCLOSED AFFILIATES',
  'NO GIMMICKS',
  'HUMAN INSPECTION',
];

const CATEGORIES_LIST = [
  'ELECTRONICS & TECH',
  'HOME & KITCHEN',
  'OUTDOOR & GEAR',
  'SOFTWARE & TOOLS',
  'VERIFIED SPECIALTY STORES',
  'DIRECT BRAND WARRANTIES',
];

export function TwoMarquees() {
  const trustStr = TRUST_KEYWORDS.join('  ·  ') + '  ·  ';
  const catStr = CATEGORIES_LIST.join('  ·  ') + '  ·  ';

  return (
    <section
      aria-label="Trust and category highlights"
      className="w-full overflow-hidden select-none"
      style={{
        background: 'var(--deep-green)',
        borderTop: '1px solid rgba(191,227,142,0.18)',
        borderBottom: '1px solid rgba(191,227,142,0.18)',
      }}
    >
      {/* Marquee 1: Trust Keywords (moving left) */}
      <div
        className="marquee-container py-3"
        style={{
          borderBottom: '1px solid rgba(191,227,142,0.1)',
        }}
      >
        <div className="marquee-track-left">
          <div className="flex items-center gap-6 pr-6">
            <span
              className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[var(--lime)]"
            >
              {trustStr.repeat(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Marquee 2: Category Names (moving right) */}
      <div
        className="marquee-container py-3"
        style={{
          background: 'rgba(191,227,142,0.06)',
        }}
      >
        <div className="marquee-track-right">
          <div className="flex items-center gap-6 pr-6">
            <span
              className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[rgba(240,237,228,0.92)]"
            >
              {catStr.repeat(4)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
