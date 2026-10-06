import { ExternalLink, ShieldCheck } from 'lucide-react';

interface AffiliateButtonProps {
  slug: string;
  storeName: string;
  className?: string;
  size?: 'default' | 'large';
  destinationUrl?: string;
}

export function AffiliateButton({
  slug,
  storeName,
  className = '',
  size = 'default',
  destinationUrl,
}: AffiliateButtonProps) {
  const isLarge = size === 'large';
  const isDisabled = destinationUrl !== undefined && !destinationUrl;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {isDisabled ? (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="affiliate-btn opacity-50 cursor-not-allowed"
          style={{
            fontSize: isLarge ? 15 : 13,
            padding: isLarge ? '14px 32px' : '10px 24px',
            minHeight: '44px',
          }}
        >
          <span>Store Unavailable</span>
        </button>
      ) : (
        <a
          href={`/go/${slug}`}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="affiliate-btn visit-store-glow"
          style={{
            fontSize: isLarge ? 15 : 13,
            padding: isLarge ? '14px 32px' : '10px 24px',
            minHeight: '44px',
          }}
        >
          <span>Visit {storeName}</span>
          <ExternalLink style={{ width: 16, height: 16, opacity: 0.9, flexShrink: 0 }} />
        </a>
      )}

      <div
        className="flex items-center gap-1.5"
        style={{ fontFamily: 'var(--font-sora)', fontSize: 11, color: 'var(--ink-muted)' }}
      >
        <ShieldCheck style={{ width: 13, height: 13, color: 'var(--forest)', flexShrink: 0 }} />
        <span>Affiliate link: we may earn a commission if you buy, at no extra cost to you.</span>
      </div>
    </div>
  );
}
