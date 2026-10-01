import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export const metadata: Metadata = {
  title: 'About Discountly',
  description: 'Learn about Discountly, our editorial philosophy, and how we research online store directories.',
  alternates: {
    canonical: `${SITE_BASE_URL}/about`
  }
};

export default function AboutPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'About Us', url: `${SITE_BASE_URL}/about` }
  ];

  return (
    <>
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1 py-10 sm:py-14">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-6">
            About Discountly
          </h1>

          <div className="space-y-6 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            <p>
              Discountly was built to provide shoppers with clear, reliable, and hand-checked profiles of online retailers. The internet is filled with auto-generated deal aggregators that scrape merchant data, display obsolete coupon codes, and hide commercial relationships.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">Our Philosophy</h2>
            <p>
              We believe in honest, concise curation. Every merchant listed in Discountly is reviewed by a human editor. We verify that the website has active SSL encryption, transparent return windows, explicit warranty details, and legitimate customer service channels.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">No AI Hallucinations</h2>
            <p>
              We do not use language models or AI scrapers to invent product reviews or fake ratings. Our store overviews are based directly on primary documentation found on the merchant’s official website and verified Google entity data.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">How We Fund Our Site</h2>
            <p>
              Discountly is reader-supported. When you follow an affiliate link to an online store and make a purchase, we may receive a small commission from the merchant or affiliate network at no additional cost to you. We strictly qualify these links using <code>rel=&quot;sponsored&quot;</code> and provide unambiguous disclosures across every page.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
