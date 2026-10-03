import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { AffiliateButton } from '@/components/public/AffiliateButton';
import { StoreCard } from '@/components/public/StoreCard';
import { getStoreBySlug, listStores, listCategories } from '@/lib/firebase/db';
import { getStoreMetadata, SITE_BASE_URL } from '@/lib/seo/templates';
import { getStorePageJsonLd } from '@/lib/seo/jsonld';
import { CheckCircle2, Shield, Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const stores = await listStores({ status: 'published' });
    return stores.filter(s => s && s.slug).map(store => ({ slug: store.slug }));
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
    return { title: 'Store Not Found', robots: { index: false, follow: false } };
  }
  const store = await getStoreBySlug(slug);

  if (!store || store.status !== 'published') {
    return {
      title: 'Store Not Found',
      robots: { index: false, follow: false }
    };
  }

  const meta = getStoreMetadata(store);

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonical
    },
    robots: {
      index: !meta.noindex,
      follow: true
    }
  };
}

export default async function StoreDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = (await params) || {};
  const slug = resolvedParams.slug;
  if (!slug) notFound();

  // Let real Firestore errors propagate (they'll produce a 500, not a cached 404)
  const store = await getStoreBySlug(slug);

  if (!store || store.status !== 'published') notFound();

  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let allStores: Awaited<ReturnType<typeof listStores>> = [];

  try {
    [categories, allStores] = await Promise.all([
      listCategories(),
      listStores({ status: 'published' })
    ]);
  } catch (err) {
    console.error('StoreDetailPage secondary fetch error:', err);
  }

  const storeCategoryIds = Array.isArray(store.categoryIds) ? store.categoryIds : [];
  const primaryCategoryId = storeCategoryIds[0];
  const primaryCategory = primaryCategoryId ? categories.find(c => c && c.id === primaryCategoryId) || null : null;
  const jsonLd = getStorePageJsonLd(store, primaryCategory || undefined);

  // Related stores in the same category
  const relatedStores = allStores
    .filter(s => s && s.slug !== store!.slug && Array.isArray(s.categoryIds) && s.categoryIds.some(c => storeCategoryIds.includes(c)))
    .slice(0, 3);

  let domainHostname = store.canonicalUrl || '';
  if (store.canonicalUrl) {
    try {
      const rawUrl = store.canonicalUrl.startsWith('http') ? store.canonicalUrl : `https://${store.canonicalUrl}`;
      domainHostname = new URL(rawUrl).hostname;
    } catch {
      domainHostname = store.canonicalUrl;
    }
  }

  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Stores', url: `${SITE_BASE_URL}/stores` }
  ];

  if (primaryCategory) {
    breadcrumbItems.push({
      name: primaryCategory.name,
      url: `${SITE_BASE_URL}/categories/${primaryCategory.id}`
    });
  }

  breadcrumbItems.push({
    name: store.name,
    url: `${SITE_BASE_URL}/stores/${store.slug}`
  });

  const storeInitial = (store.name || 'S').charAt(0).toUpperCase();

  return (
    <>
      {jsonLd.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1 py-10 sm:py-14">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Main Content Column */}
            <article className="lg:col-span-8 space-y-10">
              {/* Header Profile */}
              <div className="border-b border-[var(--border)] pb-8">
                <div className="flex items-start gap-4 mb-4">
                  {store.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.logoUrl}
                      alt={store.logoAlt || `${store.name} logo`}
                      className="w-16 h-16 rounded border border-[var(--border)] object-cover bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-[var(--off-white)] border border-[var(--border)] flex items-center justify-center font-bold text-2xl text-[var(--text)] shrink-0">
                      {storeInitial}
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)]">
                        {store.name}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--black)] text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Listing
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] flex-wrap">
                      <span>Official Domain:</span>
                      <a
                        href={store.canonicalUrl}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="underline hover:text-[var(--text)] inline-flex items-center gap-1"
                      >
                        {domainHostname}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {store.lastReviewedOn && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Reviewed: {formatDate(store.lastReviewedOn)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-[var(--text)] leading-relaxed font-normal">
                  {store.shortDescription}
                </p>
              </div>

              {/* Overview Section */}
              <section className="space-y-3">
                <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                  Overview
                </h2>
                <div className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed space-y-4">
                  <p>{store.overview}</p>
                </div>
              </section>

              {/* Who It Suits Section */}
              {store.whoItSuits && (
                <section className="space-y-3">
                  <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                    Who It Suits
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                    {store.whoItSuits}
                  </p>
                </section>
              )}

              {/* What We Checked Section */}
              {store.checks && store.checks.length > 0 && (
                <section className="space-y-4 p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--black)] shrink-0" />
                    <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                      What We Checked
                    </h2>
                  </div>
                  <ul className="space-y-3 text-sm text-[var(--text)]">
                    {store.checks.map((check, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[var(--gray-700)] mt-0.5 shrink-0" />
                        <div>
                          <span>{check.text}</span>
                          {check.checkedOn && (
                            <span className="block text-xs text-[var(--text-muted)] mt-0.5">
                              Checked on: {formatDate(check.checkedOn)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Shipping and Returns Section */}
              {store.shippingReturns && (
                <section className="space-y-3">
                  <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                    Shipping & Returns Policy
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                    {store.shippingReturns.text}
                  </p>
                  <div className="text-xs text-[var(--text-muted)] pt-1 flex items-center gap-2 flex-wrap">
                    {store.shippingReturns.policyUrl && (
                      <>
                        <span>Source:</span>
                        <a
                          href={store.shippingReturns.policyUrl}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="underline hover:text-[var(--text)]"
                        >
                          Official Policy Page
                        </a>
                      </>
                    )}
                    {store.shippingReturns.checkedOn && (
                      <>
                        <span>•</span>
                        <span>Last verified on {formatDate(store.shippingReturns.checkedOn)}</span>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Editor's Note */}
              {store.editorNote && (
                <div className="p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--off-white)] flex items-start gap-3 text-xs sm:text-sm text-[var(--text-muted)]">
                  <AlertCircle className="w-4 h-4 text-[var(--gray-700)] mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[var(--text)] block mb-0.5">Editor&apos;s Note:</strong>
                    <span>{store.editorNote}</span>
                  </div>
                </div>
              )}

              {/* Direct Outbound Action */}
              <div className="pt-6 border-t border-[var(--border)]">
                <AffiliateButton slug={store.slug} storeName={store.name} size="large" />
              </div>
            </article>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Action Box Card */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm sticky top-24">
                <h3 className="text-base font-semibold text-[var(--text)] mb-2">
                  Visit {store.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                  Proceed to the official store to browse inventory, current pricing, and customer support.
                </p>

                <AffiliateButton slug={store.slug} storeName={store.name} className="w-full" />

                <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3 text-xs text-[var(--text-muted)]">
                  <div className="flex justify-between">
                    <span>Listing Status:</span>
                    <span className="font-medium text-[var(--text)]">Verified Active</span>
                  </div>
                  {store.countryCode && (
                    <div className="flex justify-between">
                      <span>Primary Region:</span>
                      <span className="font-medium text-[var(--text)]">{store.countryCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Categories:</span>
                    <span className="font-medium text-[var(--text)]">
                      {storeCategoryIds
                        .map(cid => categories.find(c => c && c.id === cid)?.name)
                        .filter(Boolean)
                        .join(', ') || 'General'}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Related Stores Section */}
          {relatedStores.length > 0 && (
            <section className="mt-16 pt-12 border-t border-[var(--border)]">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)] mb-6">
                Related Stores
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedStores.map(rel => (
                  <StoreCard key={rel.slug} store={rel} categories={categories} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
