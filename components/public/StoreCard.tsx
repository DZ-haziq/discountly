import Link from 'next/link';
import { Store, Category } from '@/lib/types';
import { CheckCircle2, ArrowRight, Tag, Copy } from 'lucide-react';

interface StoreCardProps {
  store: Store;
  categories?: Category[];
}

export function StoreCard({ store, categories = [] }: StoreCardProps) {
  if (!store) return null;
  const categoryIds = Array.isArray(store.categoryIds) ? store.categoryIds : [];
  const storeCategories = (categories || []).filter(c => c && categoryIds.includes(c.id));
  const bgImage = store.bannerImageUrl || store.ogImageUrl || store.logoUrl;
  const storeName = store.name || 'Store';
  const initial = storeName.charAt(0).toUpperCase();

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col group">
      {/* Banner image */}
      {bgImage && (
        <div
          className="h-36 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-black/30" />
          {store.discountPercent && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              {store.discountPercent}
            </div>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Logo + Name */}
        <div className="flex items-center gap-3 mb-3">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logoUrl}
              alt={store.logoAlt || `${storeName} logo`}
              className="w-10 h-10 rounded border border-[var(--border)] object-cover bg-white shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-[var(--off-white)] border border-[var(--border)] flex items-center justify-center font-bold text-lg text-[var(--text)] shrink-0">
              {initial}
            </div>
          )}
          <div>
            <Link href={`/stores/${store.slug}`}>
              <h3 className="font-semibold text-base text-[var(--text)] group-hover:underline underline-offset-2 leading-tight">
                {storeName}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-[var(--gray-700)] shrink-0" />
              <span>Verified</span>
              {!bgImage && store.discountPercent && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-red-500">{store.discountPercent}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3 leading-relaxed flex-1">
          {store.shortDescription}
        </p>

        {/* Referral code */}
        {store.referralCode && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[var(--off-white)] border border-dashed border-[var(--border)] rounded text-xs">
            <Tag className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <span className="font-mono font-semibold text-[var(--text)] tracking-wider">{store.referralCode}</span>
            <span className="text-[var(--text-muted)] ml-auto">Use at checkout</span>
          </div>
        )}

        {/* Categories */}
        {storeCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {storeCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--off-white)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors border border-[var(--border)]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2 text-xs mt-auto">
          <Link
            href={`/stores/${store.slug}`}
            className="font-medium text-[var(--text)] hover:underline flex items-center gap-1"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href={`/go/${store.slug}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="font-medium px-3 py-1.5 rounded bg-[var(--black)] text-white hover:bg-[var(--charcoal)] transition-colors shadow-sm"
          >
            Visit Store
          </a>
        </div>
      </div>
    </div>
  );
}
