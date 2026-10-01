import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'Full disclosure of our affiliate relationships and how commissions work on Discountly.',
  alternates: {
    canonical: `${SITE_BASE_URL}/affiliate-disclosure`
  }
};

export default function AffiliateDisclosurePage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Affiliate Disclosure', url: `${SITE_BASE_URL}/affiliate-disclosure` }
  ];

  return (
    <>
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1 py-10 sm:py-14">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-6">
            Affiliate Disclosure
          </h1>

          <div className="space-y-6 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            <p>
              In compliance with FTC guidelines and Google search spam policies, we provide full disclosure regarding how Discountly earns compensation.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">How Affiliate Links Work</h2>
            <p>
              Some of the links on Discountly are affiliate tracking links. If you click on an affiliate link and subsequently make a purchase on the merchant&apos;s website, Discountly may receive a referral commission from the seller or affiliate network.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">No Extra Cost To You</h2>
            <p>
              This referral commission comes at no additional cost to you. The prices and terms you see on the merchant&apos;s website remain identical whether you use our link or navigate directly.
            </p>

            <h2 className="text-xl font-semibold text-[var(--text)] pt-4">Technical Link Qualification</h2>
            <p>
              All affiliate links on our site use explicit link qualifications: <code>rel=&quot;sponsored nofollow noopener noreferrer&quot;</code> and route through our outbound redirection gateway to protect user privacy.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
