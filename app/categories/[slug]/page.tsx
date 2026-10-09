import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { StoreCard } from '@/components/public/StoreCard';
import { getCategoryById, listStores, listCategories } from '@/lib/firebase/db';
import { getCategoryMetadata, SITE_BASE_URL } from '@/lib/seo/templates';
import { getItemListJsonLd } from '@/lib/seo/jsonld';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  try {
    const categories = await listCategories();
    return categories.filter(cat => cat && cat.id).map(cat => ({ slug: cat.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = (await params) || {};
  const slug = resolvedParams.slug;
  if (!slug) {
    return { title: 'Category Not Found', robots: { index: false, follow: false } };
  }
  let category = null;
  try {
    category = await getCategoryById(slug);
  } catch {
    return { title: 'Category Not Found', robots: { index: false, follow: false } };
  }

  if (!category) {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false }
    };
  }

  const meta = getCategoryMetadata(category);

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonical
    }
  };
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = (await params) || {};
  const slug = resolvedParams.slug;
  if (!slug) {
    notFound();
  }

  let category = null;
  try {
    category = await getCategoryById(slug);
  } catch (err) {
    console.error('CategoryPage error:', err);
  }

  if (!category) {
    notFound();
  }

  let allCategories: Awaited<ReturnType<typeof listCategories>> = [];
  let stores: Awaited<ReturnType<typeof listStores>> = [];

  try {
    [allCategories, stores] = await Promise.all([
      listCategories(),
      listStores({ status: 'published', categoryId: category.id })
    ]);
  } catch (err) {
    console.error('CategoryPage secondary fetch error:', err);
  }
  const itemListJsonLd = getItemListJsonLd(`${category.name} Stores`, stores);

  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Categories', url: `${SITE_BASE_URL}/stores` },
    { name: category.name, url: `${SITE_BASE_URL}/categories/${category.id}` }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
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
                {category.name}
                <span className="line-2">Online Stores</span>
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 15,
                  color: 'var(--ink-muted)',
                  lineHeight: 1.65,
                }}
              >
                {category.intro}
              </p>
            </div>

            {stores.length === 0 ? (
              <div
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  background: 'var(--cream)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--hairline)',
                }}
              >
                <h3
                  className="heading-display"
                  style={{ fontSize: 18, color: 'var(--ink)', marginBottom: 8 }}
                >
                  No stores in this category yet
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-sora)',
                    fontSize: 14,
                    color: 'var(--ink-muted)',
                  }}
                >
                  Our editorial team is currently researching and verifying stores for this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(store => (
                  <StoreCard key={store.slug} store={store} categories={allCategories} />
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
