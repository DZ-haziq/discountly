import Link from 'next/link';
import { Store, Category } from '@/lib/types';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface StoreCardProps {
  store: Store;
  categories?: Category[];
}

export function StoreCard({ store, categories = [] }: StoreCardProps) {
  const storeCategories = categories.filter(c => store.categoryIds.includes(c.id));

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 sm:p-6 transition-all duration-200 hover:shadow-md flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.logoAlt || `${store.name} logo`}
                className="w-12 h-12 rounded border border-[var(--border)] object-cover bg-white shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-[var(--off-white)] border border-[var(--border)] flex items-center justify-center font-bold text-lg text-[var(--text)] shrink-0">
                {store.name.charAt(0)}
              </div>
            )}
            <div>
              <Link href={`/stores/${store.slug}`}>
                <h3 className="font-semibold text-lg text-[var(--text)] group-hover:underline underline-offset-2">
                  {store.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--gray-700)] shrink-0" />
                <span>Verified store</span>
                {store.countryCode && (
                  <>
                    <span>•</span>
                    <span>{store.countryCode}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">
          {store.shortDescription}
        </p>

        {storeCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
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
      </div>

      <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3 text-xs">
        <Link
          href={`/stores/${store.slug}`}
          className="font-medium text-[var(--text)] hover:underline flex items-center gap-1"
        >
          <span>Read store details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href={`/go/${store.slug}`}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="font-medium px-3 py-1.5 rounded bg-[var(--black)] text-white hover:bg-[var(--charcoal)] transition-colors shadow-sm"
        >
          Visit Store
        </Link>
      </div>
    </div>
  );
}
