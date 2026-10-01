import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 rounded bg-[var(--black)] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text)] mb-2">
            Page Not Found
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            The page or store listing you are looking for may have been moved, renamed, or is undergoing editorial review.
          </p>
          <Link
            href="/stores"
            className="inline-block px-5 py-2.5 rounded-[var(--radius)] bg-[var(--black)] text-white text-xs font-medium hover:bg-[var(--charcoal)]"
          >
            Browse All Stores
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
