import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { StoreCard } from '@/components/public/StoreCard';
import { listStores, listCategories } from '@/lib/firebase/db';
import { ShieldCheck, Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { getSiteOrganizationJsonLd, getWebSiteJsonLd } from '@/lib/seo/jsonld';

export const revalidate = 60; // ISR revalidation

export default async function HomePage() {
  const stores = await listStores({ status: 'published' });
  const categories = await listCategories();

  const orgJsonLd = getSiteOrganizationJsonLd();
  const webSiteJsonLd = getWebSiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1">
        {/* Dark Cinematic Hero Section */}
        <section className="hero py-16 sm:py-24 border-b border-[var(--border-d)]">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-d)] border border-[var(--border-d)] text-xs font-medium text-[var(--gray-300)] mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>100% Hand-Checked Editorial Research</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-6 leading-[1.15]">
                A directory of online stores, with the details that matter.
              </h1>

              <p className="text-base sm:text-lg text-[var(--gray-300)] leading-relaxed mb-8">
                Discountly lists online stores with a short description, the categories they sell in, and details we have verified ourselves. When you click through, we may earn a commission at no extra cost to you.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/stores"
                  className="px-6 py-3 rounded-[var(--radius)] bg-white text-black font-medium hover:bg-[var(--gray-200)] transition-colors text-center text-sm shadow-md"
                >
                  Browse All Stores
                </Link>
                <Link
                  href="/how-we-choose-stores"
                  className="px-6 py-3 rounded-[var(--radius)] bg-[var(--surface-d)] border border-[var(--border-d)] text-[var(--gray-300)] hover:text-white transition-colors text-center text-sm"
                >
                  How We Choose Stores
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="border-b border-[var(--border)] bg-[var(--surface)] py-6">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Explore by Category
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[var(--off-white)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--white)] hover:border-[var(--gray-700)] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured / Recent Stores Directory */}
        <section className="py-12 sm:py-16">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text)] tracking-tight mb-2">
                  Featured Stores
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Every store listed below has been verified for legitimate website security, return policies, and warranties.
                </p>
              </div>
              <Link
                href="/stores"
                className="text-sm font-medium text-[var(--text)] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View all {stores.length} stores</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map(store => (
                <StoreCard key={store.slug} store={store} categories={categories} />
              ))}
            </div>
          </div>
        </section>

        {/* Editorial Standards Section */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)] py-16">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl font-semibold text-[var(--text)] tracking-tight mb-3">
                Our Verification Standards
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                We believe affiliate directories should provide real value, not thin content. We do not use automated AI bots to fabricate claims.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--off-white)]">
                <div className="w-8 h-8 rounded bg-[var(--black)] text-white flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h3 className="font-semibold text-base text-[var(--text)] mb-2">
                  Manual Site Inspection
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  We open the actual merchant website, inspect checkout encryption, and read their official shipping and returns documentation.
                </p>
              </div>

              <div className="p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--off-white)]">
                <div className="w-8 h-8 rounded bg-[var(--black)] text-white flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h3 className="font-semibold text-base text-[var(--text)] mb-2">
                  Web Risk & Security Checks
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Domains are scanned for malicious software, phishing vectors, and unwanted trackers using Google Web Risk screening.
                </p>
              </div>

              <div className="p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--off-white)]">
                <div className="w-8 h-8 rounded bg-[var(--black)] text-white flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h3 className="font-semibold text-base text-[var(--text)] mb-2">
                  Full Disclosure & No Gimmicks
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  We qualify all affiliate links with sponsored attributes and never make fake price or discount promises that cannot be verified.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
