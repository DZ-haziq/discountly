import Link from 'next/link';
import { Store, Category } from '@/lib/types';
import { CheckCircle2, ArrowRight, Tag } from 'lucide-react';

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

  return (
    <div className="store-card">
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
              padding: '3px 10px',
              borderRadius: '999px',
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoUrl}
              alt={store.logoAlt || `${storeName} logo`}
              className="shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: '1px solid var(--hairline)',
                objectFit: 'cover',
                background: 'white',
              }}
              loading="lazy"
            />
          ) : (
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--cream)',
                border: '1px solid var(--hairline)',
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: 18,
                color: 'var(--forest)',
              }}
            >
              {initial}
            </div>
          )}
          <div>
            <Link href={`/stores/${store.slug}`} style={{ textDecoration: 'none' }}>
              <h3 className="store-name">{storeName}</h3>
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: 'var(--forest)' }} />
              <span style={{ fontFamily: 'var(--font-sora)', fontSize: 11, color: 'var(--ink-muted)' }}>
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
            className="flex items-center gap-2 mb-3"
            style={{
              padding: '8px 12px',
              background: 'var(--cream)',
              border: '1px dashed var(--hairline)',
              borderRadius: 12,
            }}
          >
            <Tag className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-muted)' }} />
            <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12, color: 'var(--ink)', letterSpacing: '0.08em' }}>
              {store.referralCode}
            </span>
            <span className="ml-auto" style={{ fontFamily: 'var(--font-sora)', fontSize: 11, color: 'var(--ink-muted)' }}>
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

        {/* Footer actions */}
        <div
          className="flex items-center justify-between gap-2 mt-auto"
          style={{ paddingTop: 12, borderTop: '1px solid var(--hairline)' }}
        >
          <Link href={`/stores/${store.slug}`} className="details-link">
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href={`/go/${store.slug}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="visit-store-btn"
          >
            Visit Store
          </a>
        </div>
      </div>
    </div>
  );
}
