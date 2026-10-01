import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getStoreBySlug, getStorePrivate, listCategories } from '@/lib/firebase/db';
import { StoreForm } from '@/components/admin/StoreForm';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditStorePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    redirect('/admin/login');
  }

  const resolvedParams = (await params) || {};
  const slug = resolvedParams.slug;
  if (!slug) {
    notFound();
  }
  const store = await getStoreBySlug(slug);
  const privateData = await getStorePrivate(slug);
  const categories = await listCategories();

  if (!store) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-1.5 rounded hover:bg-[var(--gray-200)] text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
              Edit: {store.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-mono">
              /stores/{store.slug}
            </p>
          </div>
        </div>

        <Link
          href={`/stores/${store.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[var(--border)] bg-white text-xs font-medium text-[var(--text)] hover:bg-[var(--off-white)] self-start sm:self-auto"
        >
          <span>View Public Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <StoreForm
        initialStore={store}
        initialPrivate={privateData || undefined}
        categories={categories}
        isEdit={true}
      />
    </div>
  );
}
