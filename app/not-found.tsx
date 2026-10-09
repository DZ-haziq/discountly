import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        className="flex-1 flex items-center justify-center px-4"
        style={{ background: 'var(--forest)', padding: 'clamp(3rem, 6vw, 5rem) 0' }}
      >
        <div
          style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius)',
            padding: 'clamp(2.5rem, 5vw, 3.5rem)',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 font-bold text-xl heading-display"
            style={{ background: 'var(--forest)', color: 'var(--lime)' }}
          >
            404
          </div>
          <h1
            className="heading-display mb-3"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: 'var(--ink)' }}
          >
            Page Not Found
          </h1>
          <p
            className="mb-6"
            style={{ fontFamily: 'var(--font-sora)', fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65 }}
          >
            The page or store listing you are looking for may have been moved, renamed, or is undergoing editorial review.
          </p>
          <Link
            href="/stores"
            className="server-btn-primary inline-flex"
            style={{ fontSize: 13, padding: '10px 24px' }}
          >
            Browse All Stores
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
