import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { FadeUp } from '@/components/public/theme/FadeUp';
import { MotionInit } from '@/components/public/theme/MotionInit';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'Full disclosure of our affiliate relationships and how commissions work on Discountly.',
  alternates: { canonical: `${SITE_BASE_URL}/affiliate-disclosure` }
};

const sections = [
  {
    accent: 'var(--lime)',
    title: 'How Affiliate Links Work',
    delay: 120,
    body: 'Some of the links on Discountly are affiliate tracking links. If you click on an affiliate link and subsequently make a purchase on the merchant\u2019s website, Discountly may receive a referral commission from the seller or affiliate network.',
  },
  {
    accent: 'var(--orange)',
    title: 'No Extra Cost To You',
    delay: 200,
    body: 'This referral commission comes at no additional cost to you. The prices and terms you see on the merchant\u2019s website remain identical whether you use our link or navigate directly.',
  },
  {
    accent: 'var(--berry)',
    title: 'Technical Link Qualification',
    delay: 280,
    body: 'All affiliate links on our site use explicit link qualifications: rel="sponsored nofollow noopener noreferrer" and route through our outbound redirection gateway to protect user privacy.',
  },
];

export default function AffiliateDisclosurePage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Affiliate Disclosure', url: `${SITE_BASE_URL}/affiliate-disclosure` }
  ];

  return (
    <>
      <MotionInit />
      <DisclosureBanner />
      <Header />
      <main id="main-content" className="flex-1" style={{ background: 'var(--forest)', padding: 'clamp(3rem, 6vw, 5rem) 0' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', padding: 'clamp(2rem, 5vw, 3.5rem)', maxWidth: '760px', margin: '0 auto' }}>
            <Breadcrumbs items={breadcrumbItems} />
            <FadeUp>
              <div className="pill-chip mb-5">Transparency</div>
              <h1 className="heading-display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: 'var(--ink)', marginBottom: '1.5rem' }}>
                Affiliate
                <span className="line-2">Disclosure</span>
              </h1>
            </FadeUp>
            <div style={{ fontFamily: 'var(--font-sora)', fontSize: 'clamp(13px, 1.5vw, 15px)', color: 'var(--ink-muted)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <FadeUp delay={60}>
                <p>In compliance with FTC guidelines and Google search spam policies, we provide full disclosure regarding how Discountly earns compensation.</p>
              </FadeUp>
              {sections.map(s => (
                <FadeUp key={s.title} delay={s.delay}>
                  <div style={{ background: 'var(--cream)', borderRadius: 16, padding: '1.5rem', borderLeft: `3px solid ${s.accent}` }}>
                    <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 10 }}>{s.title}</h2>
                    <p>{s.body}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
