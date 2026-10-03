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

      <main id="main-content" className="flex-1 py-10 sm:py-14">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="max-w-3xl mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-4">
              {category.name} Online Stores
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
              {category.intro}
            </p>
          </div>

          {stores.length === 0 ? (
            <div className="py-16 text-center bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)]">
              <h3 className="text-lg font-medium text-[var(--text)] mb-2">No stores in this category yet</h3>
              <p className="text-sm text-[var(--text-muted)]">
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
      </main>

      <Footer />
    </>
  );
}
