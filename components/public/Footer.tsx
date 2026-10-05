import Link from 'next/link';

export function Footer() {
  return (
    <footer
      className="w-full mt-auto"
      style={{ background: 'var(--forest)', padding: '3rem 0 0' }}
    >
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
        {/* White rounded card */}
        <div
          style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius)',
            padding: 'clamp(2rem, 5vw, 3rem)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="md:col-span-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--forest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-syne)',
                      fontWeight: 800,
                      fontSize: 13,
                      color: 'var(--lime)',
                      textTransform: 'uppercase',
                    }}
                  >
                    D
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 800,
                    fontSize: 18,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    color: 'var(--forest)',
                  }}
                >
                  discountly
                </span>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 13,
                  color: 'var(--ink-muted)',
                  lineHeight: 1.65,
                  maxWidth: '26rem',
                  marginBottom: 14,
                }}
              >
                Online stores, explained clearly. We list verified online stores with hand-checked details, official warranty terms, and transparent affiliate disclosures.
              </p>

              <p
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 11,
                  color: 'var(--ink-muted)',
                  lineHeight: 1.6,
                }}
              >
                Discountly is reader-supported. Some links on this site are affiliate links. When you click through and purchase, we may earn a commission at no extra cost to you.
              </p>
            </div>

            {/* Directory column */}
            <div>
              <h4
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink)',
                  marginBottom: 12,
                }}
              >
                Directory
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'All Stores', href: '/stores' },
                  { label: 'Electronics & Tech', href: '/categories/electronics-and-tech' },
                  { label: 'Home & Kitchen', href: '/categories/home-and-kitchen' },
                  { label: 'Outdoor & Gear', href: '/categories/outdoor-and-gear' },
                ].map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="footer-link" style={{ fontFamily: 'var(--font-sora)', fontSize: 13 }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust column */}
            <div>
              <h4
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink)',
                  marginBottom: 12,
                }}
              >
                Trust &amp; Editorial
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'How We Choose Stores', href: '/how-we-choose-stores' },
                  { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Contact', href: '/contact' },
                ].map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="footer-link" style={{ fontFamily: 'var(--font-sora)', fontSize: 13 }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--hairline)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <p style={{ fontFamily: 'var(--font-sora)', fontSize: 11, color: 'var(--ink-muted)' }}>
              © {new Date().getFullYear()} Discountly. All rights reserved.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/privacy" className="footer-link" style={{ fontFamily: 'var(--font-sora)', fontSize: 11 }}>Privacy</Link>
              <span style={{ color: 'var(--hairline)' }}>•</span>
              <Link href="/affiliate-disclosure" className="footer-link" style={{ fontFamily: 'var(--font-sora)', fontSize: 11 }}>Affiliate Terms</Link>
              <span style={{ color: 'var(--hairline)' }}>•</span>
              <Link href="/contact" className="footer-link" style={{ fontFamily: 'var(--font-sora)', fontSize: 11 }}>Contact</Link>
            </div>
          </div>
        </div>

        {/* Bottom forest strip */}
        <div style={{ height: '2rem' }} />
      </div>
    </footer>
  );
}
