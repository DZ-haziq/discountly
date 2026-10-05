import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { listStores, listCategories } from '@/lib/firebase/db';
import { getSiteOrganizationJsonLd, getWebSiteJsonLd } from '@/lib/seo/jsonld';
import { PortalHero } from '@/components/public/theme/PortalHero';
import { StoreDeck } from '@/components/public/theme/StoreDeck';
import { WordReveal } from '@/components/public/theme/WordReveal';
import { RibbonBand } from '@/components/public/theme/RibbonBand';
import { FadeUp } from '@/components/public/theme/FadeUp';
import { MotionInit } from '@/components/public/theme/MotionInit';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let stores: Awaited<ReturnType<typeof listStores>> = [];
  let categories: Awaited<ReturnType<typeof listCategories>> = [];

  try {
    [stores, categories] = await Promise.all([
      listStores({ status: 'published' }),
      listCategories()
    ]);
  } catch (err) {
    console.error('HomePage data fetch error:', err);
  }

  const orgJsonLd = getSiteOrganizationJsonLd();
  const webSiteJsonLd = getWebSiteJsonLd();
  const featuredStores = stores.slice(0, 6);

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
      <MotionInit />
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1" style={{ background: 'var(--forest)' }}>

        {/* ── 1. PORTAL HERO ─────────────────────────────────────── */}
        <PortalHero
          headline="A directory of online stores, with the details that matter."
          subtext="Discountly lists online stores with a short description, the categories they sell in, and details we have verified ourselves. When you click through, we may earn a commission at no extra cost to you."
        />

        {/* ── 2. CATEGORIES ──────────────────────────────────────── */}
        <section aria-labelledby="categories-heading" style={{ padding: 'clamp(3rem, 6vw, 5rem) 0' }}>
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', padding: 'clamp(2rem, 4vw, 3rem)' }}>
              <div className="pill-chip mb-6">Explore by category</div>

              <h2
                id="categories-heading"
                className="heading-display"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--ink)', marginBottom: '2rem' }}
              >
                Browse every
                <span className="line-2">category</span>
              </h2>

              {/* Static featured category tiles — CSS hover via .cat-tile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Electronics & Tech', href: '/categories/electronics-and-tech', accent: 'var(--lime)' },
                  { label: 'Home & Kitchen',     href: '/categories/home-and-kitchen',      accent: 'var(--orange)' },
                  { label: 'Outdoor & Gear',     href: '/categories/outdoor-and-gear',      accent: 'var(--berry)' },
                ].map(cat => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="cat-tile"
                    style={{ padding: '2.5rem 1.5rem 1.5rem' }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: cat.accent,
                        marginBottom: '1.5rem',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 700,
                        fontSize: 'clamp(1rem, 2.2vw, 1.4rem)',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.01em',
                        color: 'var(--ink)',
                      }}
                    >
                      {cat.label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Dynamic categories from DB — CSS hover via .pill-link */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {categories.map(cat => (
                    <Link key={cat.id} href={`/categories/${cat.id}`} className="pill-link">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. FEATURED STORES DECK ────────────────────────────── */}
        <section aria-labelledby="featured-heading" style={{ padding: '0 0 clamp(3rem, 6vw, 5rem)' }}>
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: '3rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div className="pill-chip pill-chip-light mb-4">Featured stores</div>
                <h2
                  id="featured-heading"
                  className="heading-display"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: 'var(--white)' }}
                >
                  FEATURED
                  <span className="line-2">STORES</span>
                </h2>
              </div>
              <Link
                href="/stores"
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--lime)',
                  textDecoration: 'underline',
                  flexShrink: 0,
                  marginBottom: 4,
                }}
              >
                View all {stores.length} stores →
              </Link>
            </div>

            <StoreDeck stores={featuredStores} categories={categories} />
          </div>
        </section>

        {/* ── 4. VERIFICATION STORY ──────────────────────────────── */}
        <section aria-labelledby="verification-heading" style={{ padding: 'clamp(4rem, 8vw, 7rem) 0' }}>
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius)', padding: 'clamp(2.5rem, 5vw, 4rem)' }}>
              <div className="pill-chip mb-6">Our verification standards</div>

              <h2
                id="verification-heading"
                className="heading-display"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--ink)', marginBottom: '2rem' }}
              >
                We check so
                <span className="line-2">you don&#8217;t have to</span>
              </h2>

              <WordReveal
                text="We believe affiliate directories should provide real value, not thin content. We do not use automated AI bots to fabricate claims. Every store listed on Discountly is inspected by a human editor who reads the official merchant documentation, verifies security, and checks that policies are clearly stated."
                className="mb-12"
                style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.8rem)', lineHeight: 1.55, maxWidth: '52rem' }}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    num: '1',
                    title: 'Manual Site Inspection',
                    body: 'We open the actual merchant website, inspect checkout encryption, and read their official shipping and returns documentation.',
                    offset: 0,
                    delay: 0,
                    accent: 'var(--lime)',
                  },
                  {
                    num: '2',
                    title: 'Web Risk & Security Checks',
                    body: 'Domains are scanned for malicious software, phishing vectors, and unwanted trackers using Google Web Risk screening.',
                    offset: 32,
                    delay: 120,
                    accent: 'var(--orange)',
                  },
                  {
                    num: '3',
                    title: 'Full Disclosure & No Gimmicks',
                    body: 'We qualify all affiliate links with sponsored attributes and never make fake price or discount promises that cannot be verified.',
                    offset: -16,
                    delay: 240,
                    accent: 'var(--berry)',
                  },
                ].map(step => (
                  <FadeUp key={step.num} delay={step.delay}>
                    <div
                      style={{
                        background: 'var(--white)',
                        borderRadius: 20,
                        padding: '2rem',
                        border: '1px solid var(--hairline)',
                        transform: `translateY(${step.offset}px)`,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'var(--forest)',
                          color: step.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-syne)',
                          fontWeight: 800,
                          fontSize: 16,
                          marginBottom: '1rem',
                        }}
                      >
                        {step.num}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 8 }}>
                        {step.title}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-sora)', fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.65 }}>
                        {step.body}
                      </p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. RIBBON BAND ─────────────────────────────────────── */}
        <RibbonBand />

      </main>

      <Footer />
    </>
  );
}
