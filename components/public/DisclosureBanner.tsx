import { Info } from 'lucide-react';
import Link from 'next/link';

export function DisclosureBanner() {
  return (
    <div className="w-full bg-[var(--off-white)] border-b border-[var(--border)] py-2 px-4 text-xs text-[var(--text-muted)]">
      <div className="max-w-[1120px] mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[var(--gray-700)] shrink-0" />
          <span>
            <strong>Editorial transparency:</strong> We independently research every store. When you buy via our links, we may earn an affiliate commission at no extra cost to you.
          </span>
        </div>
        <Link
          href="/how-we-choose-stores"
          className="underline hover:text-[var(--text)] text-right shrink-0"
        >
          How we choose stores
        </Link>
      </div>
    </div>
  );
}
