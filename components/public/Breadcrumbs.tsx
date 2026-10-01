import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = getBreadcrumbJsonLd(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-xs text-[var(--text-muted)] flex-wrap gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={item.url} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="w-3 h-3 text-[var(--gray-400)] shrink-0" />}
              {isLast ? (
                <span className="font-medium text-[var(--text)]" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="hover:text-[var(--text)] transition-colors">
                  {item.name}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
