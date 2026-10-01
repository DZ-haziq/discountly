import Link from 'next/link';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface AffiliateButtonProps {
  slug: string;
  storeName: string;
  className?: string;
  size?: 'default' | 'large';
}

export function AffiliateButton({ slug, storeName, className = '', size = 'default' }: AffiliateButtonProps) {
  const isLarge = size === 'large';

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={`/go/${slug}`}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2.5 rounded-[var(--radius)] bg-[var(--black)] text-white font-medium hover:bg-[var(--charcoal)] transition-all shadow-sm active:scale-[0.99] ${
          isLarge ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm'
        } ${className}`}
      >
        <span>Visit {storeName}</span>
        <ExternalLink className="w-4 h-4 opacity-80 shrink-0" />
      </Link>

      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--gray-700)] shrink-0" />
        <span>Affiliate link: we may earn a commission if you buy, at no extra cost to you.</span>
      </div>
    </div>
  );
}
