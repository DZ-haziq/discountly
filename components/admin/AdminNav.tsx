'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Store, PlusCircle, FolderTree, SearchCheck, Settings, ExternalLink, LogOut } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  }

  const navItems = [
    { label: 'Stores', href: '/admin', icon: Store, exact: true },
    { label: 'Add Store', href: '/admin/stores/new', icon: PlusCircle },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'SEO Audit', href: '/admin/seo', icon: SearchCheck },
    { label: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-40">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[var(--black)] text-white flex items-center justify-center font-bold text-sm">
              D
            </div>
            <span className="font-semibold text-base tracking-tight text-[var(--text)]">
              Discountly <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--off-white)] border border-[var(--border)] font-normal text-[var(--text-muted)] ml-1">Admin</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] transition-colors ${
                    isActive
                      ? 'bg-[var(--black)] text-white font-medium'
                      : 'hover:text-[var(--text)] hover:bg-[var(--off-white)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--off-white)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--gray-200)] transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
