import type { Metadata } from 'next';
import { Syne, Sora } from 'next/font/google';
import './globals.css';
import { SITE_NAME, SITE_TAGLINE, SITE_BASE_URL } from '@/lib/seo/templates';

export const maxDuration = 30;

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-syne',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-sora',
});

function getMetadataBase(): URL {
  try {
    return new URL(SITE_BASE_URL);
  } catch {
    return new URL('https://discountly.com');
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME}: Online store directory`
  },
  description: 'Browse online stores by category. Each listing links to the official store and discloses our affiliate relationship.',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    title: `${SITE_NAME}: ${SITE_TAGLINE}`,
    description: 'Browse verified online stores with hand-checked details, warranties, and official links.'
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_TAGLINE
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col body-sora selection:bg-[var(--lime)] selection:text-[var(--ink)]" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--forest)] text-white rounded-full font-medium shadow-md text-sm"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
