import { Metadata } from 'next';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { DisclosureBanner } from '@/components/public/DisclosureBanner';
import { Breadcrumbs } from '@/components/public/Breadcrumbs';
import { FadeUp } from '@/components/public/theme/FadeUp';
import { MotionInit } from '@/components/public/theme/MotionInit';
import { SITE_BASE_URL } from '@/lib/seo/templates';
import { Mail, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Discountly',
  description: 'Get in touch with the editorial team at Discountly for store corrections or inquiries.',
  alternates: { canonical: `${SITE_BASE_URL}/contact` }
};

export default function ContactPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_BASE_URL },
    { name: 'Contact Us', url: `${SITE_BASE_URL}/contact` }
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
              <div className="pill-chip mb-5">Get in touch</div>
              <h1 className="heading-display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}>
                Contact
                <span className="line-2">Editorial Team</span>
              </h1>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: '2rem' }}>
                Have a correction to report regarding an online store listing, or wish to suggest an independent brand for editorial review? Reach out below.
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  icon: Mail,
                  title: 'Editorial Inquiries',
                  desc: 'For listing corrections, policy updates, and brand verifications.',
                  email: 'editorial@discountly.com',
                  delay: 80,
                },
                {
                  icon: MessageSquare,
                  title: 'Affiliate Networks & Inquiries',
                  desc: 'Direct merchant partnership and commercial disclosure queries.',
                  email: 'partners@discountly.com',
                  delay: 160,
                },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <FadeUp key={card.email} delay={card.delay}>
                    <div
                      style={{
                        background: 'var(--cream)',
                        borderRadius: 20,
                        padding: '1.75rem',
                        border: '1px solid var(--hairline)',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'var(--forest)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 14,
                        }}
                      >
                        <Icon style={{ width: 18, height: 18, color: 'var(--lime)' }} />
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 6 }}>
                        {card.title}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-sora)', fontSize: 12, color: 'var(--ink-muted)', marginBottom: 12 }}>
                        {card.desc}
                      </p>
                      <span
                        style={{
                          display: 'inline-block',
                          fontFamily: 'monospace',
                          fontSize: 12,
                          background: 'var(--white)',
                          padding: '4px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--hairline)',
                          color: 'var(--ink)',
                        }}
                      >
                        {card.email}
                      </span>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
