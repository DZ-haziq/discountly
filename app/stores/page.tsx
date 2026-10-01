import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { StoreCard } from '@/components/public/StoreCard';
import { listStores, listCategories } from '@/lib/firebase/db';
import { getDirectoryMetadata, SITE_BASE_URL } from '@/lib/seo/templates';
import { getItemListJsonLd } from '@/lib/seo/jsonld';
import Link from 'next/link';

export const revalidate = 60;

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNum = page ? parseInt(page, 10) : 1;
  const meta = getDirectoryMetadata(pageNum);

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonical
    }
  };
}

export default async function StoresDirectoryPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const allStores = await listStores({ status: 'published' });
  const categories = await listCategories();

  let filteredStores = allStores;

  if (category) {
    filteredStores = filteredStores.filter(s => s.categoryIds.includes(category));
  }

  if (q) {
    const query = q.toLowerCase();
    filteredStores = filteredStores.filter(
      s =>
        s.name.toLowerCase().includes(query) ||
        s.shortDescription.toLowerCase().includes(query) ||
        s.overview.toLowerCase().includes(query)
    );
  }

  const itemListJsonLd = getItemListJsonLd('All Online Stores', filteredStores);

  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'All Stores', url: `${SITE_BASE_URL}/stores` }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1 py-10 sm:py-14">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="max-w-3xl mb-8">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-3">
              All Online Stores
            </h1>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              Browse every store in our directory. Each store listing includes categories, warranty details, and facts verified directly against merchant documentation.
            </p>
          </div>

          {/* Filters & Category Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-[var(--border)]">
            <Link
              href="/stores"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                !category
                  ? 'bg-[var(--black)] text-white border-[var(--black)]'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              All Categories ({allStores.length})
            </Link>

            {categories.map(cat => {
              const count = allStores.filter(s => s.categoryIds.includes(cat.id)).length;
              const isActive = category === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/stores?category=${cat.id}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    isActive
                      ? 'bg-[var(--black)] text-white border-[var(--black)]'
                      : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
                  }`}
                >
                  {cat.name} ({count})
                </Link>
              );
            })}
          </div>

          {filteredStores.length === 0 ? (
            <div className="py-16 text-center bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)]">
              <h3 className="text-lg font-medium text-[var(--text)] mb-2">No stores found</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                We couldn&apos;t find any stores matching the selected criteria.
              </p>
              <Link
                href="/stores"
                className="inline-block px-4 py-2 rounded bg-[var(--black)] text-white text-xs font-medium"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map(store => (
                <StoreCard key={store.slug} store={store} categories={categories} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
