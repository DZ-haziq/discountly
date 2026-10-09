import { ImageResponse } from 'next/og';

export const alt = 'Discountly: Online store directory';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#1F2D17',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#BFE38E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#141E0E',
              fontSize: '36px',
              fontWeight: '900',
            }}
          >
            D
          </div>
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '36px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            DISCOUNTLY
          </span>
        </div>

        {/* Center Title & Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px' }}>
          <div
            style={{
              fontSize: '60px',
              fontWeight: '900',
              color: '#FFFFFF',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            A directory of online stores, with the details that matter.
          </div>
          <div
            style={{
              fontSize: '26px',
              color: '#BFE38E',
              fontWeight: '500',
            }}
          >
            Hand-checked research · Official warranties · Fully disclosed affiliates
          </div>
        </div>

        {/* Bottom trust footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '2px solid rgba(191,227,142,0.3)',
            paddingTop: '30px',
            color: 'rgba(240,237,228,0.85)',
            fontSize: '20px',
          }}
        >
          <span>Verified Merchant Directory</span>
          <span>discountly.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
