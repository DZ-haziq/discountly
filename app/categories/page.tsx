import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { listCategories, listStores } from '@/lib/firebase/db';
import { SITE_BASE_URL } from '@/lib/seo/templates';
import { FolderTree, ArrowRight, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Browse Store Categories | Discountly',
  description: 'Explore online stores categorized by electronics, home & kitchen, outdoor gear, and software. Verified return policies, warranties, and direct links.',
  alternates: {
    canonical: `${SITE_BASE_URL}/categories`
  }
};

export default async function CategoriesIndexPage() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let stores: Awaited<ReturnType<typeof listStores>> = [];

  try {
    [categories, stores] = await Promise.all([
      listCategories(),
      listStores({ status: 'published' })
    ]);
  } catch (err) {
    console.error('CategoriesIndexPage data fetch error:', err);
  }

  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Categories', url: `${SITE_BASE_URL}/categories` }
  ];

  return (
    <>
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
              border: '1px solid var(--hairline)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Breadcrumbs items={breadcrumbItems} />

            <div style={{ maxWidth: '48rem', marginBottom: '2.5rem' }}>
              <h1
                className="heading-display"
                style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}
              >
                Store
                <span className="line-2">Categories</span>
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 15,
                  color: 'var(--ink-muted)',
                  lineHeight: 1.65,
                }}
              >
                Find verified online retailers organized by specialty. Every store in each category is checked for official warranties, customer support, and return policies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map(cat => {
                const matchingStores = stores.filter(s => Array.isArray(s.categoryIds) && s.categoryIds.includes(cat.id));
                return (
                  <div
                    key={cat.id}
                    className="p-6 rounded-[var(--radius-sm)] flex flex-col justify-between group transition-all"
                    style={{
                      background: 'var(--cream)',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'var(--white)', border: '1px solid var(--hairline)', color: 'var(--forest)' }}
                          >
                            <FolderTree className="w-4 h-4" />
                          </div>
                          <h2
                            className="heading-display"
                            style={{ fontSize: '1.25rem', color: 'var(--ink)' }}
                          >
                            {cat.name}
                          </h2>
                        </div>
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{
                            background: 'var(--white)',
                            border: '1px solid var(--hairline)',
                            color: 'var(--ink-muted)',
                          }}
                        >
                          {matchingStores.length} {matchingStores.length === 1 ? 'store' : 'stores'}
                        </span>
                      </div>

                      <p
                        className="text-sm leading-relaxed mb-6"
                        style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-muted)' }}
                      >
                        {cat.intro}
                      </p>
                    </div>

                    <div
                      className="flex items-center justify-between pt-4"
                      style={{ borderTop: '1px solid var(--hairline)' }}
                    >
                      <Link
                        href={`/categories/${cat.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80"
                        style={{ color: 'var(--ink)' }}
                      >
                        <span>Browse category</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>

                      <Link
                        href={`/stores?category=${cat.id}`}
                        className="text-xs hover:opacity-80 transition-colors"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        Filter stores
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
