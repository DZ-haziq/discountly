import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export const metadata: Metadata = {
  title: 'How We Choose Stores',
  description: 'Understand the multi-step verification process used by Discountly before listing any online retailer.',
  alternates: {
    canonical: `${SITE_BASE_URL}/how-we-choose-stores`
  }
};

export default function HowWeChooseStoresPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'How We Choose Stores', url: `${SITE_BASE_URL}/how-we-choose-stores` }
  ];

  return (
    <>
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1 py-10 sm:py-14">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-6">
            How We Choose Stores
          </h1>

          <div className="space-y-6 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            <p>
              We enforce strict editorial quality criteria before any store is published to our public directory. We reject the majority of automated store submissions to ensure high standards.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">1. Official Domain & Security Inspection</h2>
            <p>
              We confirm that the merchant operates an official domain, uses modern TLS/HTTPS encryption on checkout pages, and passes Google Web Risk threat screening against social engineering or malware.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">2. Documented Policies & Support</h2>
            <p>
              A legitimate store must clearly state its return policy, shipping windows, and contact methods (such as physical address, email support, or phone lines). If a store hides its return terms or refuses to honor manufacturer warranties, we will not list it.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">3. Regular Re-Verification</h2>
            <p>
              Store listings are reviewed on an annual basis. When merchants update their policies or warranty duration, our editors update the listing details and cite the checked date.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
