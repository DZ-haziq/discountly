import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { FadeUp } from '@/components/public/theme/FadeUp';
import { MotionInit } from '@/components/public/theme/MotionInit';
import { SITE_BASE_URL } from '@/lib/seo/templates';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Discountly protects your privacy and handles visitor data.',
  alternates: { canonical: `${SITE_BASE_URL}/privacy` }
};

const sections = [
  {
    accent: 'var(--lime)',
    title: 'Data Collection & Cookies',
    delay: 120,
    body: 'We do not track personal identifying information (PII) of public visitors. We do not place third-party advertising tracking pixels on public directory pages.',
  },
  {
    accent: 'var(--orange)',
    title: 'Outbound Link Aggregation',
    delay: 200,
    body: 'When you click an outbound link to a merchant, our server records an aggregated, anonymous click count for that merchant without storing your IP address, browser fingerprint, or identity.',
  },
  {
    accent: 'var(--berry)',
    title: 'Admin Authentication',
    delay: 280,
    body: 'Only authenticated editors and administrators use session cookies when accessing the private administrative dashboard.',
  },
];

export default function PrivacyPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Privacy Policy', url: `${SITE_BASE_URL}/privacy` }
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
              <div className="pill-chip mb-5">Your privacy</div>
              <h1 className="heading-display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: 'var(--ink)', marginBottom: '1.5rem' }}>
                Privacy
                <span className="line-2">Policy</span>
              </h1>
            </FadeUp>
            <div style={{ fontFamily: 'var(--font-sora)', fontSize: 'clamp(13px, 1.5vw, 15px)', color: 'var(--ink-muted)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <FadeUp delay={60}>
                <p>Discountly respects your privacy. We operate with minimal data collection principles.</p>
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
