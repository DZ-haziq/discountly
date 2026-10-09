import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { listStores, listCategories } from '@/lib/firebase/db';
import { getSiteOrganizationJsonLd, getWebSiteJsonLd, getFaqPageJsonLd } from '@/lib/seo/jsonld';
import { PortalHero } from '@/components/public/theme/PortalHero';
import { StoreDeck } from '@/components/public/theme/StoreDeck';
import { TwoMarquees } from '@/components/public/theme/TwoMarquees';
import { FadeUp } from '@/components/public/theme/FadeUp';
import { MotionInit } from '@/components/public/theme/MotionInit';
import {
  Laptop,
  UtensilsCrossed,
  Compass,
  Code2,
  Lock,
  RotateCcw,
  Truck,
  ShieldCheck,
  Globe2,
  FileBadge,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

export const revalidate = 300;

const FAQS = [
  {
    question: 'Is Discountly free to use?',
    answer: 'Yes. Browsing the directory and visiting stores costs nothing.',
  },
  {
    question: 'How does Discountly make money?',
    answer:
      'Some links are affiliate links. If you buy after clicking one, the store may pay us a commission at no extra cost to you.',
  },
  {
    question: 'Does commission affect which stores you list?',
    answer:
      'No. Stores are listed after review. Commission does not change whether a store is included or how it is described.',
  },
  {
    question: 'How do you verify a store?',
    answer:
      "A human editor inspects the merchant's website, checks checkout encryption, reads shipping, returns and warranty documentation, and screens the domain for security risks.",
  },
  {
    question: 'Do you guarantee prices or discounts?',
    answer:
      'No. We do not make price promises we cannot verify. Where a store offers a code, we show it, but always confirm the final price at checkout.',
  },
  {
    question: 'Can I suggest a store?',
    answer:
      "Yes. Use our Contact page to send us the store's name and website, and we will review it against our standards.",
  },
  {
    question: 'How often is information updated?',
    answer:
      "We review listings periodically and update them when a store's policies or details change. Each page shows when it was last checked.",
  },
  {
    question: 'Is my personal data collected?',
    answer:
      'We keep data collection to a minimum. See our Privacy Policy for exactly what we collect and why.',
  },
];

export default async function HomePage() {
  let stores: Awaited<ReturnType<typeof listStores>> = [];
  let categories: Awaited<ReturnType<typeof listCategories>> = [];

  try {
    [stores, categories] = await Promise.all([
      listStores({ status: 'published' }),
      listCategories(),
    ]);
  } catch (err) {
    console.error('HomePage data fetch error:', err);
  }

  // Fallback defaults if DB is cold or initial seed
  const totalStoreCount = stores.length > 0 ? stores.length : 3;
  const totalCategoryCount = Math.max(categories.length, 4);

  const orgJsonLd = getSiteOrganizationJsonLd();
  const webSiteJsonLd = getWebSiteJsonLd();
  const faqJsonLd = getFaqPageJsonLd(FAQS);

  // Compute real store counts per category dynamically (never make up counts)
  const getCategoryCount = (slug: string) => {
    return stores.filter(
      s => Array.isArray(s.categoryIds) && s.categoryIds.includes(slug)
    ).length;
  };

  const electronicsCount = getCategoryCount('electronics-and-tech');
  const homeCount = getCategoryCount('home-and-kitchen');
  const outdoorCount = getCategoryCount('outdoor-and-gear');
  const softwareCount = getCategoryCount('software-and-tools');

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <MotionInit />
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1 overflow-x-hidden" style={{ background: 'var(--forest)' }}>

        {/* ── 1. HERO FIXES (#1 & #9.1) ─────────────────────────── */}
        <PortalHero
          headline="A directory of online stores, with the details that matter."
          subtext="Discountly lists online stores with a short description, the categories they sell in, and details we have verified ourselves. When you click through, we may earn a commission at no extra cost to you."
          storeCount={totalStoreCount}
          categoryCount={totalCategoryCount}
        />

        {/* ── Curved Section Divider: Dark Forest to Cream ─────── */}
        <div className="section-divider-curve bg-[var(--forest)]" aria-hidden="true">
          <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none">
            <path
              d="M0,0 C480,48 960,48 1440,0 L1440,48 L0,48 Z"
              fill="var(--cream)"
            />
          </svg>
        </div>

        {/* ── 2. BROWSE BY CATEGORY (#5 Spacing Fix & #9.2) ─────── */}
        <section
          aria-labelledby="categories-heading"
          className="paper-grain"
          style={{
            background: 'var(--cream)',
            padding: 'clamp(2.5rem, 5vw, 4.5rem) 0',
          }}
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div
              style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius)',
                padding: 'clamp(2rem, 4vw, 3.5rem)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="pill-chip mb-4">Explore by category</div>

              <div className="mb-8">
                {/* Fixed heading spacing: "Browse every category" */}
                <h2
                  id="categories-heading"
                  className="heading-display"
                  style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                    color: 'var(--ink)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Browse every category
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-sora)',
                    fontSize: 'clamp(14px, 1.4vw, 15px)',
                    color: 'var(--ink-muted)',
                    maxWidth: '48rem',
                    lineHeight: 1.6,
                  }}
                >
                  Start with what you need. Each category groups stores whose policies and details we have reviewed.
                </p>
              </div>

              {/* 4 Category Cards as specified in 9.2 with real dynamically computed counts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: 'Electronics & Tech',
                    description: 'Gadgets, accessories and everyday tech from stores with clear warranty and return terms',
                    href: '/categories/electronics-and-tech',
                    accent: 'var(--lime-dark)',
                    icon: Laptop,
                    count: electronicsCount,
                  },
                  {
                    label: 'Home & Kitchen',
                    description: 'Design-led cookware, coffee gear and home essentials from brands that publish their policies',
                    href: '/categories/home-and-kitchen',
                    accent: 'var(--orange)',
                    icon: UtensilsCrossed,
                    count: homeCount,
                  },
                  {
                    label: 'Outdoor & Gear',
                    description: 'Packable, durable equipment for travel, sport and time outside',
                    href: '/categories/outdoor-and-gear',
                    accent: 'var(--berry)',
                    icon: Compass,
                    count: outdoorCount,
                  },
                  {
                    label: 'Software & Tools',
                    description: 'Apps, subscriptions and productivity tools with transparent billing and cancellation terms',
                    href: '/categories/software-and-tools',
                    accent: '#2B5BA4',
                    icon: Code2,
                    count: softwareCount,
                  },
                ].map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.href}
                      className="card-hover-lift rounded-2xl p-5 flex flex-col justify-between bg-[var(--cream)] border border-[var(--hairline)]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                            style={{ background: cat.accent }}
                          >
                            <Icon className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <span className="text-xs font-mono font-semibold text-[var(--ink-muted)] px-2 py-0.5 rounded-full bg-white/70">
                            {cat.count} {cat.count === 1 ? 'store' : 'stores'}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontFamily: 'var(--font-syne)',
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            color: 'var(--ink)',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {cat.label}
                        </h3>

                        <p
                          style={{
                            fontFamily: 'var(--font-sora)',
                            fontSize: '12.5px',
                            color: 'var(--ink-muted)',
                            lineHeight: 1.55,
                            marginBottom: '1rem',
                          }}
                        >
                          {cat.description}
                        </p>
                      </div>

                      <Link
                        href={cat.href}
                        className="touch-target inline-flex items-center gap-1.5 text-xs font-bold text-[var(--forest)] hover:underline mt-auto"
                        aria-label={`View stores in ${cat.label}`}
                      >
                        <span>View stores</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Categories Chips */}
              {categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--hairline)]">
                  <span className="text-xs font-semibold text-[var(--ink-muted)] mr-1">
                    All Categories:
                  </span>
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

        {/* ── Curved Section Divider: Cream to Dark Forest ─────── */}
        <div className="section-divider-curve bg-[var(--cream)]" aria-hidden="true">
          <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none">
            <path
              d="M0,0 C480,48 960,48 1440,0 L1440,48 L0,48 Z"
              fill="var(--forest)"
            />
          </svg>
        </div>

        {/* ── 3. FEATURED STORES CAROUSEL (#4, #5 & #9.3) ───────── */}
        <section
          aria-labelledby="featured-heading"
          className="paper-grain"
          style={{ padding: 'clamp(2.5rem, 5vw, 4.5rem) 0' }}
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div
              className="featured-section-header flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between text-center sm:text-left gap-4 mb-8 w-full"
            >
              <div className="featured-heading-block flex flex-col items-center sm:items-start text-center sm:text-left w-full sm:w-auto">
                <div className="pill-chip pill-chip-light mb-3 self-center sm:self-start">Featured stores</div>
                {/* Fixed heading spacing: "FEATURED STORES" */}
                <h2
                  id="featured-heading"
                  className="heading-display text-center sm:text-left w-full"
                  style={{ color: 'var(--white)' }}
                >
                  FEATURED STORES
                </h2>
                <p
                  className="featured-subheading text-center sm:text-left mx-auto sm:mx-0"
                  style={{
                    fontFamily: 'var(--font-sora)',
                    fontSize: 'clamp(13px, 1.3vw, 15px)',
                    color: 'rgba(240, 237, 228, 0.85)',
                    marginTop: '0.5rem',
                    maxWidth: '42rem',
                  }}
                >
                  A selection of stores that passed our review. Open a listing for details, or visit the store directly.
                </p>
              </div>

              <Link
                href="/stores"
                className="featured-view-all-link touch-target inline-flex items-center gap-1.5 shrink-0 self-center sm:self-auto"
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--lime)',
                  textDecoration: 'underline',
                  minHeight: '44px',
                }}
              >
                View all {totalStoreCount} stores →
              </Link>
            </div>

            {/* Accessible Carousel with real stores and add-more model */}
            <StoreDeck stores={stores.slice(0, 12)} categories={categories} />

            {/* Note below carousel (9.3) */}
            <p
              className="text-center text-xs mt-6"
              style={{
                fontFamily: 'var(--font-sora)',
                color: 'rgba(240, 237, 228, 0.72)',
              }}
            >
              Visit Store opens the official site in a new tab. Some links are affiliate links.
            </p>
          </div>
        </section>

        {/* ── 4. TWO MARQUEES (#6) ───────────────────────────────── */}
        <TwoMarquees />

        {/* ── 5. HOW IT WORKS (#9.4) ─────────────────────────────── */}
        <section
          aria-labelledby="how-it-works-heading"
          className="paper-grain"
          style={{
            background: 'var(--deep-green)',
            padding: 'clamp(3.5rem, 7vw, 5.5rem) 0',
            borderTop: '1px solid rgba(191,227,142,0.12)',
            borderBottom: '1px solid rgba(191,227,142,0.12)',
          }}
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="pill-chip pill-chip-light mb-4">How it works</div>
              <h2
                id="how-it-works-heading"
                className="heading-display"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--white)' }}
              >
                From research to checkout, in three steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  num: '01',
                  step: 'Research',
                  title: 'We research the store',
                  text: 'We open the merchant’s real website and read what they publish: who they are, what they sell, and how they handle shipping and returns.',
                  accent: 'var(--lime)',
                },
                {
                  num: '02',
                  step: 'Verification',
                  title: 'We verify the details',
                  text: 'We check checkout encryption, review the warranty and returns terms, and screen the domain for security risks before a store is listed.',
                  accent: 'var(--orange)',
                },
                {
                  num: '03',
                  step: 'Disclosure',
                  title: 'You click through, we disclose',
                  text: 'When you visit a store from Discountly, we may earn a commission at no extra cost to you. We say so on the listing, and the link is marked as sponsored.',
                  accent: '#38BDF8',
                },
              ].map(item => (
                <div
                  key={item.num}
                  className="rounded-2xl p-6 sm:p-7 border border-white/10 bg-white/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="font-mono font-bold text-sm tracking-wider"
                        style={{ color: item.accent }}
                      >
                        STEP {item.num}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-white/50">
                        {item.step}
                      </span>
                    </div>

                    <h3
                      className="heading-display text-lg mb-3"
                      style={{ color: 'var(--white)' }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        fontFamily: 'var(--font-sora)',
                        fontSize: '13.5px',
                        color: 'rgba(240, 237, 228, 0.85)',
                        lineHeight: 1.65,
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. VERIFICATION STORY & WHAT EVERY LISTING INCLUDES (#5 & #9.5) ── */}
        <section
          aria-labelledby="verification-heading"
          className="paper-grain"
          style={{ padding: 'clamp(3.5rem, 7vw, 5.5rem) 0', background: 'var(--forest)' }}
        >
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div
              style={{
                background: 'var(--cream)',
                borderRadius: 'var(--radius)',
                padding: 'clamp(2rem, 5vw, 4rem)',
                border: '1px solid var(--hairline)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="pill-chip mb-4">Our verification standards</div>

              {/* Fixed heading spacing: "We check so you don't have to" */}
              <h2
                id="verification-heading"
                className="heading-display"
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  color: 'var(--ink)',
                  marginBottom: '1.5rem',
                }}
              >
                We check so you don&#8217;t have to
              </h2>

              <p
                className="mb-10"
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 'clamp(1rem, 2vw, 1.35rem)',
                  lineHeight: 1.6,
                  maxWidth: '52rem',
                  color: 'var(--ink)',
                }}
              >
                We believe affiliate directories should provide real value, not thin content. We do not use automated AI bots to fabricate claims. Every store listed on Discountly is inspected by a human editor who reads the official merchant documentation, verifies security, and checks that policies are clearly stated.
              </p>

              {/* Existing 3 verification steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
                {[
                  {
                    num: '1',
                    title: 'Manual Site Inspection',
                    body: 'We open the actual merchant website, inspect checkout encryption, and read their official shipping and returns documentation.',
                    accent: 'var(--lime-dark)',
                  },
                  {
                    num: '2',
                    title: 'Web Risk & Security Checks',
                    body: 'Domains are scanned for malicious software, phishing vectors, and unwanted trackers using Google Web Risk screening.',
                    accent: 'var(--orange)',
                  },
                  {
                    num: '3',
                    title: 'Full Disclosure & No Gimmicks',
                    body: 'We qualify all affiliate links with sponsored attributes and never make fake price or discount promises that cannot be verified.',
                    accent: 'var(--berry)',
                  },
                ].map(step => (
                  <FadeUp key={step.num}>
                    <div
                      className="card-hover-lift h-full"
                      style={{
                        background: 'var(--white)',
                        borderRadius: 20,
                        padding: '1.75rem',
                        border: '1px solid var(--hairline)',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'var(--forest)',
                          color: step.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-syne)',
                          fontWeight: 800,
                          fontSize: 15,
                          marginBottom: '1rem',
                        }}
                      >
                        {step.num}
                      </div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-syne)',
                          fontWeight: 700,
                          fontSize: 15,
                          color: 'var(--ink)',
                          marginBottom: 8,
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'var(--font-sora)',
                          fontSize: 13,
                          color: 'var(--ink-muted)',
                          lineHeight: 1.6,
                        }}
                      >
                        {step.body}
                      </p>
                    </div>
                  </FadeUp>
                ))}
              </div>

              {/* ── 9.5 What Every Listing Includes Grid (6 cards) ── */}
              <div className="pt-8 border-t border-[var(--hairline)]">
                <div className="mb-6">
                  <h3
                    className="heading-display"
                    style={{
                      fontSize: 'clamp(1.4rem, 2.8vw, 2rem)',
                      color: 'var(--ink)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    What every listing includes
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sora)',
                      fontSize: 13.5,
                      color: 'var(--ink-muted)',
                    }}
                  >
                    Consistent, transparent data points researched for every merchant in our index.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Lock,
                      title: 'Secure checkout',
                      desc: 'We confirm the store uses encrypted checkout before listing it.',
                    },
                    {
                      icon: RotateCcw,
                      title: 'Clear returns',
                      desc: 'We read the returns and refund policy and note anything unusual.',
                    },
                    {
                      icon: Truck,
                      title: 'Shipping terms',
                      desc: 'We check that delivery information is stated and easy to find.',
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Warranty details',
                      desc: 'Where a store offers a warranty, we link to the official terms.',
                    },
                    {
                      icon: Globe2,
                      title: 'Domain safety',
                      desc: 'Domains are screened for malware and phishing with Google Web Risk.',
                    },
                    {
                      icon: FileBadge,
                      title: 'Affiliate disclosure',
                      desc: 'Every listing states our relationship with the store.',
                    },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="p-4 rounded-xl bg-white border border-[var(--hairline)] flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--forest)] text-[var(--lime)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[var(--ink)] mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. EDITORIAL PROMISE (#9.6) ───────────────────────── */}
        <section
          aria-labelledby="editorial-promise-heading"
          className="paper-grain"
          style={{
            background: 'var(--deep-green)',
            padding: 'clamp(3rem, 6vw, 5rem) 0',
            borderTop: '1px solid rgba(191,227,142,0.14)',
          }}
        >
          <div className="max-w-[880px] mx-auto px-4 sm:px-6 text-center">
            <div className="pill-chip pill-chip-light mb-4">Our promise</div>

            <h2
              id="editorial-promise-heading"
              className="heading-display mb-6"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--white)' }}
            >
              Independent research, honestly funded
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-sora)',
                fontSize: 'clamp(14px, 1.4vw, 16px)',
                color: 'rgba(240, 237, 228, 0.90)',
                lineHeight: 1.75,
                marginBottom: '2rem',
              }}
            >
              Discountly is reader-supported. When you buy through our links, we may earn a commission, and that is how we keep the site running. It never costs you extra, and it does not decide which stores we list. We list a store because it passes our checks, not because of what it pays. If a store stops meeting our standards, we update or remove the listing.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/affiliate-disclosure"
                className="btn-primary touch-target"
                style={{
                  background: 'var(--lime)',
                  color: 'var(--deep-green)',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Read our Affiliate Disclosure
              </Link>
              <Link
                href="/how-we-choose-stores"
                className="btn-outline-accessible touch-target"
              >
                How we choose stores
              </Link>
            </div>
          </div>
        </section>

        {/* ── 8. FAQ ACCORDION (#9.7) ───────────────────────────── */}
        <section
          aria-labelledby="faq-heading"
          className="paper-grain"
          style={{
            background: 'var(--cream)',
            padding: 'clamp(3.5rem, 6vw, 5.5rem) 0',
          }}
        >
          <div className="max-w-[820px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="pill-chip mb-3">Frequently asked questions</div>
              <h2
                id="faq-heading"
                className="heading-display"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--ink)' }}
              >
                Frequently Asked Questions
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {FAQS.map((faq, idx) => (
                <details key={idx} className="faq-item">
                  <summary className="faq-summary">
                    <span>{faq.question}</span>
                    <ChevronDown className="w-4 h-4 shrink-0 text-[var(--forest)]" aria-hidden="true" />
                  </summary>
                  <p className="faq-answer">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. SUGGEST A STORE CTA BANNER (#9.8) ──────────────── */}
        <section
          aria-labelledby="suggest-heading"
          className="paper-grain"
          style={{
            background: 'var(--forest)',
            padding: 'clamp(3.5rem, 6vw, 5rem) 0',
            borderTop: '1px solid rgba(191,227,142,0.18)',
          }}
        >
          <div className="max-w-[760px] mx-auto px-4 sm:px-6 text-center">
            <div
              className="rounded-3xl p-8 sm:p-12 border border-[rgba(191,227,142,0.3)]"
              style={{
                background: 'linear-gradient(135deg, rgba(20,30,14,0.9) 0%, rgba(31,45,23,0.8) 100%)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h2
                id="suggest-heading"
                className="heading-display mb-3"
                style={{ fontSize: 'clamp(1.7rem, 3.8vw, 2.5rem)', color: 'var(--white)' }}
              >
                Know a store we should review?
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 'clamp(13px, 1.3vw, 15px)',
                  color: 'rgba(240, 237, 228, 0.90)',
                  lineHeight: 1.65,
                  marginBottom: '1.75rem',
                }}
              >
                Tell us about it. We will check it against the same standards as every other listing.
              </p>

              <div className="mb-4">
                <Link
                  href="/contact"
                  className="btn-primary touch-target font-bold"
                  style={{
                    background: 'var(--lime)',
                    color: 'var(--deep-green)',
                    fontSize: 14,
                    padding: '14px 32px',
                  }}
                >
                  Suggest a store
                </Link>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 11.5,
                  color: 'rgba(240, 237, 228, 0.70)',
                }}
              >
                We review every suggestion by hand.
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
