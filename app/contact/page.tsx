import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { SITE_BASE_URL } from '@/lib/seo/templates';
import { Mail, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Discountly',
  description: 'Get in touch with the editorial team at Discountly for store corrections or inquiries.',
  alternates: {
    canonical: `${SITE_BASE_URL}/contact`
  }
};

export default function ContactPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Contact Us', url: `${SITE_BASE_URL}/contact` }
  ];

  return (
    <>
      <DisclosureBanner />
      <Header />

      <main id="main-content" className="flex-1 py-10 sm:py-14">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text)] mb-4">
            Contact Editorial Team
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-8">
            Have a correction to report regarding an online store listing, or wish to suggest an independent brand for editorial review? Reach out below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <Mail className="w-6 h-6 text-[var(--black)] mb-3" />
              <h3 className="font-semibold text-base text-[var(--text)] mb-1">Editorial Inquiries</h3>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                For listing corrections, policy updates, and brand verifications.
              </p>
              <span className="text-xs font-mono bg-[var(--off-white)] px-2.5 py-1 rounded border border-[var(--border)]">
                editorial@discountly.com
              </span>
            </div>

            <div className="p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <MessageSquare className="w-6 h-6 text-[var(--black)] mb-3" />
              <h3 className="font-semibold text-base text-[var(--text)] mb-1">Affiliate Networks & Inquiries</h3>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Direct merchant partnership and commercial disclosure queries.
              </p>
              <span className="text-xs font-mono bg-[var(--off-white)] px-2.5 py-1 rounded border border-[var(--border)]">
                partners@discountly.com
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
