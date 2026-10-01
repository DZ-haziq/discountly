import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Discountly protects your privacy and handles visitor data.',
  alternates: {
    canonical: `${SITE_BASE_URL}/privacy`
  }
};

export default function PrivacyPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Privacy Policy', url: `${SITE_BASE_URL}/privacy` }
  ];

  return (
    <>
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1 py-10 sm:py-14">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-6">
            Privacy Policy
          </h1>

          <div className="space-y-6 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            <p>
              Discountly respects your privacy. We operate with minimal data collection principles.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">Data Collection & Cookies</h2>
            <p>
              We do not track personal identifying information (PII) of public visitors. We do not place third-party advertising tracking pixels on public directory pages.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">Outbound Link Aggregation</h2>
            <p>
              When you click an outbound link to a merchant, our server records an aggregated, anonymous click count for that merchant without storing your IP address, browser fingerprint, or identity.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">Admin Authentication</h2>
            <p>
              Only authenticated editors and administrators use session cookies when accessing the private administrative dashboard.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
