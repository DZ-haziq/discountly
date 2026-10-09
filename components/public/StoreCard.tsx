import Link from 'next/link';
import { Store, Category } from '@/lib/types';
import { CheckCircle2, ArrowRight, Tag, ExternalLink } from 'lucide-react';

interface StoreCardProps {
  store: Store;
  categories?: Category[];
}

export function StoreCard({ store, categories = [] }: StoreCardProps) {
  if (!store) return null;
  const categoryIds = Array.isArray(store.categoryIds) ? store.categoryIds : [];
  const storeCategories = (categories || []).filter(c => c && categoryIds.includes(c.id));
  const storeName = store.name || 'Store';
  const initial = storeName.charAt(0).toUpperCase();
  const hasDestination = Boolean(store.canonicalUrl && store.canonicalUrl.trim());

  return (
    <div className="store-card card-hover-lift">
      {/* Banner */}
      <div
        style={{
          height: 120,
          background: 'linear-gradient(135deg, var(--forest) 0%, #2a4020 100%)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {store.discountPercent && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'var(--orange)',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '999px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            {store.discountPercent}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Logo + name */}
        <div className="flex items-center gap-3 mb-3">
          {store.logoUrl ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--hairline)] bg-white shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.logoUrl}
                alt={store.logoAlt || `${storeName} logo`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="shrink-0 flex items-center justify-center font-bold text-lg text-white"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--forest)',
                border: '1px solid var(--hairline)',
                fontFamily: 'var(--font-syne)',
              }}
            >
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link href={`/stores/${store.slug}`} style={{ textDecoration: 'none' }} className="block min-w-0" title={storeName}>
              <h3 className="store-name hover:text-[var(--forest)] truncate m-0">{storeName}</h3>
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[var(--forest)]" />
              <span style={{ fontFamily: 'var(--font-sora)', fontSize: 11, color: 'var(--ink-muted)', fontWeight: 600 }}>
                Verified
              </span>
            </div>
          </div>
        </div>

        <p
          className="line-clamp-2 flex-1 mb-3"
          style={{ fontFamily: 'var(--font-sora)', fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}
        >
          {store.shortDescription}
        </p>

        {/* Referral code */}
        {store.referralCode && (
          <div
            className="flex items-center justify-between gap-2 mb-3 p-2 bg-[var(--cream)] border border-dashed border-[var(--hairline)] rounded-xl"
          >
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 shrink-0 text-[var(--forest)]" />
              <span className="font-mono font-bold text-xs text-[var(--ink)] tracking-wider">
                {store.referralCode}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-sora)', fontSize: 11, color: 'var(--ink-muted)' }}>
              Use at checkout
            </span>
          </div>
        )}

        {/* Categories */}
        {storeCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {storeCategories.map(cat => (
              <Link key={cat.id} href={`/categories/${cat.id}`} className="store-cat-pill">
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Footer actions with 44x44px touch targets */}
        <div
          className="flex items-center justify-between gap-2 mt-auto"
          style={{ paddingTop: 12, borderTop: '1px solid var(--hairline)' }}
        >
          <Link
            href={`/stores/${store.slug}`}
            aria-label={`View details for ${storeName}`}
            className="details-link touch-target"
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
              className="visit-store-btn visit-store-glow touch-target"
            >
              <span>Visit Store</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="visit-store-btn touch-target opacity-50 cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
