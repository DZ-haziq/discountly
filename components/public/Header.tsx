import Link from 'next/link';

export function Header() {
  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-40">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-[var(--black)] text-white flex items-center justify-center font-bold text-lg tracking-tight transition-transform group-hover:scale-105">
            D
          </div>
          <span className="font-semibold text-xl tracking-tight text-[var(--text)]">
            Discountly
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]" aria-label="Main Navigation">
          <Link href="/stores" className="hover:text-[var(--text)] transition-colors">
            All Stores
          </Link>
          <Link href="/how-we-choose-stores" className="hover:text-[var(--text)] transition-colors">
            How We Choose
          </Link>
          <Link href="/about" className="hover:text-[var(--text)] transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
