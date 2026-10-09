import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { StoreCard } from '@/components/public/StoreCard';
import { listStores, listCategories } from '@/lib/firebase/db';
import { getDirectoryMetadata, SITE_BASE_URL } from '@/lib/seo/templates';
import { getItemListJsonLd } from '@/lib/seo/jsonld';
import { MotionInit } from '@/components/public/theme/MotionInit';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}): Promise<Metadata> {
  const resolved = (await searchParams) || {};
  const rawPage = resolved.page ? parseInt(resolved.page, 10) : 1;
  const pageNum = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
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
  const resolved = (await searchParams) || {};
  const { category, q } = resolved;

  let allStores: Awaited<ReturnType<typeof listStores>> = [];
  let categories: Awaited<ReturnType<typeof listCategories>> = [];

  try {
    const [storesResult, categoriesResult] = await Promise.all([
      listStores({ status: 'published' }),
      listCategories()
    ]);
    allStores = Array.isArray(storesResult) ? storesResult.filter(Boolean) : [];
    categories = Array.isArray(categoriesResult) ? categoriesResult.filter(Boolean) : [];
  } catch (err) {
    console.error('StoresPage data fetch error:', err);
  }

  let filteredStores = allStores;

  if (category) {
    filteredStores = filteredStores.filter(s => s && Array.isArray(s.categoryIds) && s.categoryIds.includes(category));
  }

  if (q) {
    const query = q.toLowerCase();
    filteredStores = filteredStores.filter(
      s =>
        s &&
        ((s.name || '').toLowerCase().includes(query) ||
          (s.shortDescription || '').toLowerCase().includes(query) ||
          (s.overview || '').toLowerCase().includes(query))
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
      <MotionInit />
      <DisclosureBanner />
      <Header />

      <main
        id="main-content"
        className="flex-1"
        style={{ background: 'var(--forest)', padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}
      >
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <div
            style={{
              background: 'var(--white)',
              borderRadius: 'var(--radius)',
              padding: 'clamp(2rem, 4vw, 3rem)',
            }}
          >
            <Breadcrumbs items={breadcrumbItems} />

            <div style={{ maxWidth: '48rem', marginBottom: '2rem' }}>
              <h1
                className="heading-display"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}
              >
                All Online
                <span className="line-2">Stores</span>
              </h1>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65 }}>
                Browse every store in our directory. Each store listing includes categories, warranty details, and facts verified directly against merchant documentation.
              </p>
            </div>

            {/* Filters — CSS-only hover via .pill-link / .pill-link-active */}
            <div
              className="flex flex-wrap items-center gap-2"
              style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--hairline)', marginBottom: '2rem' }}
            >
              <Link
                href="/stores"
                className={!category ? 'pill-link pill-link-active' : 'pill-link'}
              >
                All ({allStores.length})
              </Link>

              {categories.map(cat => {
                const count = allStores.filter(s => s && Array.isArray(s.categoryIds) && s.categoryIds.includes(cat.id)).length;
                const isActive = category === cat.id;
                return (
                  <Link
                    key={cat.id || cat.name}
                    href={`/stores?category=${encodeURIComponent(cat.id || '')}`}
                    className={isActive ? 'pill-link pill-link-active' : 'pill-link'}
                  >
                    {cat.name} ({count})
                  </Link>
                );
              })}
            </div>

            {filteredStores.length === 0 ? (
              <div
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  background: 'var(--cream)',
                  borderRadius: 20,
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, color: 'var(--ink)', marginBottom: 8 }}>
                  No stores found
                </h3>
                <p style={{ fontFamily: 'var(--font-sora)', fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20 }}>
                  We couldn&apos;t find any stores matching the selected criteria.
                </p>
                <Link href="/stores" className="server-btn-primary" style={{ fontSize: 12, padding: '8px 20px' }}>
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
        </div>
      </main>

      <Footer />
    </>
  );
}
