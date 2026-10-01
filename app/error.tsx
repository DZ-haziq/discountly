'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-8 text-center shadow-md">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          An error occurred while loading this page. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded bg-[var(--black)] text-white text-xs font-medium hover:bg-[var(--charcoal)]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
