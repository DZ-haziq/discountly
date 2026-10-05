import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { FadeUp } from '@/components/public/theme/FadeUp';
import { MotionInit } from '@/components/public/theme/MotionInit';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export const metadata: Metadata = {
  title: 'How We Choose Stores',
  description: 'Understand the multi-step verification process used by Discountly before listing any online retailer.',
  alternates: { canonical: `${SITE_BASE_URL}/how-we-choose-stores` }
};

const steps = [
  {
    num: '1',
    accent: 'var(--lime)',
    title: 'Official Domain & Security Inspection',
    body: 'We confirm that the merchant operates an official domain, uses modern TLS/HTTPS encryption on checkout pages, and passes Google Web Risk threat screening against social engineering or malware.',
    delay: 120,
  },
  {
    num: '2',
    accent: 'var(--orange)',
    title: 'Documented Policies & Support',
    body: 'A legitimate store must clearly state its return policy, shipping windows, and contact methods (such as physical address, email support, or phone lines). If a store hides its return terms or refuses to honor manufacturer warranties, we will not list it.',
    delay: 200,
  },
  {
    num: '3',
    accent: 'var(--berry)',
    title: 'Regular Re-Verification',
    body: 'Store listings are reviewed on an annual basis. When merchants update their policies or warranty duration, our editors update the listing details and cite the checked date.',
    delay: 280,
  },
];

export default function HowWeChooseStoresPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'How We Choose Stores', url: `${SITE_BASE_URL}/how-we-choose-stores` }
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
              <div className="pill-chip mb-5">Editorial standards</div>
              <h1 className="heading-display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: 'var(--ink)', marginBottom: '1.5rem' }}>
                How We Choose
                <span className="line-2">Stores</span>
              </h1>
            </FadeUp>
            <div style={{ fontFamily: 'var(--font-sora)', fontSize: 'clamp(13px, 1.5vw, 15px)', color: 'var(--ink-muted)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <FadeUp delay={60}>
                <p>We enforce strict editorial quality criteria before any store is published to our public directory. We reject the majority of automated store submissions to ensure high standards.</p>
              </FadeUp>
              {steps.map(s => (
                <FadeUp key={s.num} delay={s.delay}>
                  <div style={{ background: 'var(--cream)', borderRadius: 16, padding: '1.5rem', borderLeft: `3px solid ${s.accent}` }}>
                    <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 10 }}>{s.num}. {s.title}</h2>
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
