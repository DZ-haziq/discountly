import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { FadeUp } from '@/components/public/theme/FadeUp';
import { MotionInit } from '@/components/public/theme/MotionInit';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export const metadata: Metadata = {
  title: 'About Discountly',
  description: 'Learn about Discountly, our editorial philosophy, and how we research online store directories.',
  alternates: { canonical: `${SITE_BASE_URL}/about` }
};

const sections = [
  {
    accent: 'var(--lime)',
    title: 'Our Philosophy',
    delay: 120,
    body: 'We believe in honest, concise curation. Every merchant listed in Discountly is reviewed by a human editor. We verify that the website has active SSL encryption, transparent return windows, explicit warranty details, and legitimate customer service channels.',
  },
  {
    accent: 'var(--orange)',
    title: 'No AI Hallucinations',
    delay: 200,
    body: 'We do not use language models or AI scrapers to invent product reviews or fake ratings. Our store overviews are based directly on primary documentation found on the merchant\u2019s official website and verified Google entity data.',
  },
  {
    accent: 'var(--berry)',
    title: 'How We Fund Our Site',
    delay: 280,
    body: 'Discountly is reader-supported. When you follow an affiliate link to an online store and make a purchase, we may receive a small commission from the merchant or affiliate network at no additional cost to you.',
  },
];

export default function AboutPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'About Us', url: `${SITE_BASE_URL}/about` }
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
              <div className="pill-chip mb-5">Our story</div>
              <h1 className="heading-display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: 'var(--ink)', marginBottom: '1.5rem' }}>
                About
                <span className="line-2">Discountly</span>
              </h1>
            </FadeUp>
            <div style={{ fontFamily: 'var(--font-sora)', fontSize: 'clamp(13px, 1.5vw, 15px)', color: 'var(--ink-muted)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <FadeUp delay={60}>
                <p>Discountly was built to provide shoppers with clear, reliable, and hand-checked profiles of online retailers. The internet is filled with auto-generated deal aggregators that scrape merchant data, display obsolete coupon codes, and hide commercial relationships.</p>
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
