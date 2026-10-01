import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] mt-auto py-12">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-[var(--black)] text-white flex items-center justify-center font-bold text-sm">
                D
              </div>
              <span className="font-semibold text-lg text-[var(--text)]">Discountly</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] max-w-sm mb-4 leading-relaxed">
              Online stores, explained clearly. We list verified online stores with hand-checked details, official warranty terms, and transparent affiliate disclosures.
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Discountly is reader-supported. Some links on this site are affiliate links. When you click through and purchase, we may earn a commission at no extra cost to you.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-3">
              Directory
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <Link href="/stores" className="hover:text-[var(--text)] transition-colors">
                  All Stores
                </Link>
              </li>
              <li>
                <Link href="/categories/electronics-and-tech" className="hover:text-[var(--text)] transition-colors">
                  Electronics & Tech
                </Link>
              </li>
              <li>
                <Link href="/categories/home-and-kitchen" className="hover:text-[var(--text)] transition-colors">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link href="/categories/outdoor-and-gear" className="hover:text-[var(--text)] transition-colors">
                  Outdoor & Gear
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-3">
              Trust & Editorial
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <Link href="/how-we-choose-stores" className="hover:text-[var(--text)] transition-colors">
                  How We Choose Stores
                </Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure" className="hover:text-[var(--text)] transition-colors">
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--text)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--text)] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Discountly. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
            <span>•</span>
            <Link href="/affiliate-disclosure" className="hover:text-[var(--text)]">Affiliate Terms</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[var(--text)]">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
