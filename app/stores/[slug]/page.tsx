import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { AffiliateButton } from '@/components/public/AffiliateButton';
import { StoreCard } from '@/components/public/StoreCard';
import { getStoreBySlug, listStores, listCategories } from '@/lib/firebase/db';
import { getStoreMetadata, SITE_BASE_URL } from '@/lib/seo/templates';
import { getStorePageJsonLd, getFaqPageJsonLd } from '@/lib/seo/jsonld';
import { isEligibleForPublicListing } from '@/lib/eligibility';
import { CheckCircle2, Shield, Calendar, ExternalLink, AlertCircle, ChevronDown } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// D13: Replace force-dynamic with revalidate=300.
// Coupon active checks still run at render time since they are pure date math
// against data fetched fresh within each revalidation window.
export const revalidate = 300;

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
  let store = null;
  try {
    store = await getStoreBySlug(slug);
  } catch {
    return { title: 'Store Not Found', robots: { index: false, follow: false } };
  }

  if (!store || store.status !== 'published' || !isEligibleForPublicListing(store)) {
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

  // B8: ineligible published stores also return 404 to public
  // Admin can still see drafts via /admin/stores preview
  if (!isEligibleForPublicListing(store)) notFound();

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
  const hasFaqs = Array.isArray(store.faqs) && store.faqs.length > 0;
  const jsonLd = getStorePageJsonLd(store, primaryCategory || undefined);
  // F21: FAQPage JSON-LD only when actual faqs are present and will be displayed
  const faqJsonLd = hasFaqs ? getFaqPageJsonLd(store.faqs!) : null;

  // B8: related stores must also be eligible
  const relatedStores = allStores
    .filter(s => s && s.slug !== store!.slug && isEligibleForPublicListing(s) && Array.isArray(s.categoryIds) && s.categoryIds.some(c => storeCategoryIds.includes(c)))
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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <DisclosureBanner />
      <Header />

      <main
        id="main-content"
        className="flex-1"
        style={{ background: 'var(--forest)', padding: 'clamp(2.5rem, 5vw, 4.5rem) 0' }}
      >
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <div
            style={{
              background: 'var(--white)',
              borderRadius: 'var(--radius)',
              padding: 'clamp(2rem, 4vw, 3.5rem)',
              border: '1px solid var(--hairline)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Breadcrumbs items={breadcrumbItems} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Main Content Column */}
              <article className="lg:col-span-8 space-y-10">
                {/* Header Profile */}
                <div style={{ borderBottom: '1px solid var(--hairline)', paddingBottom: '2rem' }}>
                  <div className="flex items-start gap-4 mb-4">
                    {store.logoUrl ? (
                      // D14: next/image replaces raw <img>; priority on LCP logo
                      <Image
                        src={store.logoUrl}
                        alt={store.logoAlt || `${store.name} logo`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-xl border border-[var(--hairline)] object-cover bg-white shrink-0"
                        priority
                        unoptimized
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0 heading-display"
                        style={{ background: 'var(--forest)', color: 'var(--lime)' }}
                      >
                        {storeInitial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <h1
                          className="heading-display"
                          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--ink)' }}
                        >
                          {store.name}
                        </h1>
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: 'var(--pill-bg)',
                            color: 'var(--pill-text)',
                            border: '1px solid var(--pill-border)',
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--lime-dark)' }} />
                          Verified Listing
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-2 text-xs flex-wrap"
                        style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-muted)' }}
                      >
                        <span>Official Domain:</span>
                        <a
                          href={store.canonicalUrl}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="underline hover:opacity-80 inline-flex items-center gap-1 font-medium"
                          style={{ color: 'var(--ink)' }}
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

                  <p
                    style={{
                      fontFamily: 'var(--font-sora)',
                      fontSize: 'clamp(15px, 1.8vw, 17px)',
                      color: 'var(--ink)',
                      lineHeight: 1.65,
                      fontWeight: 400,
                    }}
                  >
                    {store.shortDescription}
                  </p>
                </div>

                {/* A5: Overview only rendered when a distinct longDescription field exists.
                    Never auto-generate filler text. */}
                {store.longDescription && (
                  <section className="space-y-3">
                    <h2
                      className="heading-display"
                      style={{ fontSize: '1.25rem', color: 'var(--ink)' }}
                    >
                      Overview
                    </h2>
                    <div
                      style={{
                        fontFamily: 'var(--font-sora)',
                        fontSize: 15,
                        color: 'var(--ink-muted)',
                        lineHeight: 1.7,
                      }}
                    >
                      <p>{store.longDescription}</p>
                    </div>
                  </section>
                )}

                {/* Who It Suits Section */}
                {store.whoItSuits && (
                  <section className="space-y-3">
                    <h2
                      className="heading-display"
                      style={{ fontSize: '1.25rem', color: 'var(--ink)' }}
                    >
                      Who It Suits
                    </h2>
                    <p
                      style={{
                        fontFamily: 'var(--font-sora)',
                        fontSize: 15,
                        color: 'var(--ink-muted)',
                        lineHeight: 1.7,
                      }}
                    >
                      {store.whoItSuits}
                    </p>
                  </section>
                )}

                {/* What We Checked Section */}
                {store.checks && store.checks.length > 0 && (
                  <section
                    style={{
                      background: 'var(--cream)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.5rem',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-[var(--forest)] shrink-0" />
                      <h2
                        className="heading-display"
                        style={{ fontSize: '1.15rem', color: 'var(--ink)' }}
                      >
                        What We Checked
                      </h2>
                    </div>
                    <ul className="space-y-3 text-sm" style={{ fontFamily: 'var(--font-sora)' }}>
                      {store.checks.map((check, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className="w-4 h-4 mt-0.5 shrink-0"
                            style={{ color: 'var(--lime-dark)' }}
                          />
                          <div>
                            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{check.text}</span>
                            {check.checkedOn && (
                              <span
                                className="block text-xs mt-0.5"
                                style={{ color: 'var(--ink-muted)' }}
                              >
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
                    <h2
                      className="heading-display"
                      style={{ fontSize: '1.25rem', color: 'var(--ink)' }}
                    >
                      Shipping & Returns Policy
                    </h2>
                    <p
                      style={{
                        fontFamily: 'var(--font-sora)',
                        fontSize: 15,
                        color: 'var(--ink-muted)',
                        lineHeight: 1.7,
                      }}
                    >
                      {store.shippingReturns.text}
                    </p>
                    <div
                      className="text-xs pt-1 flex items-center gap-2 flex-wrap"
                      style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-muted)' }}
                    >
                      {store.shippingReturns.policyUrl && (
                        <>
                          <span>Source:</span>
                          <a
                            href={store.shippingReturns.policyUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="underline hover:opacity-80 font-medium"
                            style={{ color: 'var(--ink)' }}
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
                  <div
                    style={{
                      background: 'var(--cream)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--forest)' }} />
                    <div
                      style={{
                        fontFamily: 'var(--font-sora)',
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: 'var(--ink-muted)',
                      }}
                    >
                      <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 2 }}>
                        Editor&apos;s Note:
                      </strong>
                      <span>{store.editorNote}</span>
                    </div>
                  </div>
                )}

                {/* E17: Shipping summary (renders only when field has content) */}
                {store.shipping && (
                  <section className="space-y-3">
                    <h2 className="heading-display" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>
                      Shipping
                    </h2>
                    <p style={{ fontFamily: 'var(--font-sora)', fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
                      {store.shipping}
                    </p>
                  </section>
                )}

                {/* E17: Returns summary */}
                {store.returns && (
                  <section className="space-y-3">
                    <h2 className="heading-display" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>
                      Returns
                    </h2>
                    <p style={{ fontFamily: 'var(--font-sora)', fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
                      {store.returns}
                    </p>
                  </section>
                )}

                {/* E17: Warranty summary */}
                {store.warranty && (
                  <section className="space-y-3">
                    <h2 className="heading-display" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>
                      Warranty
                    </h2>
                    <p style={{ fontFamily: 'var(--font-sora)', fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
                      {store.warranty}
                    </p>
                  </section>
                )}

                {/* E17: Pros & Cons */}
                {((store.pros && store.pros.length > 0) || (store.cons && store.cons.length > 0)) && (
                  <section className="space-y-3">
                    <h2 className="heading-display" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>Pros &amp; Cons</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {store.pros && store.pros.length > 0 && (
                        <div>
                          <p className="font-semibold text-sm mb-2" style={{ color: 'var(--forest)' }}>Pros</p>
                          <ul className="space-y-1 text-sm" style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-muted)' }}>
                            {store.pros.map((pro, i) => <li key={i} className="flex items-start gap-2"><span aria-hidden>+</span>{pro}</li>)}
                          </ul>
                        </div>
                      )}
                      {store.cons && store.cons.length > 0 && (
                        <div>
                          <p className="font-semibold text-sm mb-2" style={{ color: 'var(--berry)' }}>Cons</p>
                          <ul className="space-y-1 text-sm" style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-muted)' }}>
                            {store.cons.map((con, i) => <li key={i} className="flex items-start gap-2"><span aria-hidden>−</span>{con}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* E17/F21: FAQs — only rendered when field has content */}
                {hasFaqs && (
                  <section className="space-y-3">
                    <h2 className="heading-display" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>Frequently Asked Questions</h2>
                    <div className="flex flex-col gap-3">
                      {store.faqs!.map((faq, idx) => (
                        <details key={idx} className="faq-item">
                          <summary className="faq-summary">
                            <span>{faq.question}</span>
                            <ChevronDown className="w-4 h-4 shrink-0 text-[var(--forest)]" aria-hidden="true" />
                          </summary>
                          <p className="faq-answer">{faq.answer}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {/* E18: affiliate disclosure + lastChecked */}
                <div
                  style={{
                    background: 'var(--cream)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem 1.25rem',
                    fontSize: 12,
                    fontFamily: 'var(--font-sora)',
                    color: 'var(--ink-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 4 }}>Affiliate Disclosure</strong>
                  Discountly may earn a commission if you purchase through a link on this page, at no extra cost to you.
                  This does not influence which stores are listed or how they are described.
                  {store.lastChecked && (
                    <span className="block mt-1">Last checked: {formatDate(store.lastChecked)}</span>
                  )}
                </div>

                {/* Direct Outbound Action */}
                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--hairline)' }}>
                  <AffiliateButton slug={store.slug} storeName={store.name} size="large" />
                </div>
              </article>

              {/* Sidebar Column */}
              <aside className="lg:col-span-4 space-y-6">
                {/* Action Box Card */}
                <div
                  className="sticky top-24"
                  style={{
                    background: 'var(--cream)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <h3
                    className="heading-display"
                    style={{ fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.5rem' }}
                  >
                    Visit {store.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sora)',
                      fontSize: 13,
                      color: 'var(--ink-muted)',
                      marginBottom: '1.25rem',
                      lineHeight: 1.6,
                    }}
                  >
                    Proceed to the official store to browse inventory, current pricing, and customer support.
                  </p>

                  <AffiliateButton slug={store.slug} storeName={store.name} className="w-full" />

                  <div
                    className="mt-6 pt-6 space-y-3 text-xs"
                    style={{
                      borderTop: '1px solid var(--hairline)',
                      fontFamily: 'var(--font-sora)',
                      color: 'var(--ink-muted)',
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span>Listing Status:</span>
                      <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                        Verified Active
                      </span>
                    </div>
                    {store.countryCode && (
                      <div className="flex justify-between items-center">
                        <span>Primary Region:</span>
                        <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                          {store.countryCode}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span>Categories:</span>
                      <span className="font-semibold text-right" style={{ color: 'var(--ink)' }}>
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
              <section className="mt-16 pt-12" style={{ borderTop: '1px solid var(--hairline)' }}>
                <h2
                  className="heading-display"
                  style={{ fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '1.5rem' }}
                >
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
        </div>
      </main>

      <Footer />
    </>
  );
}
