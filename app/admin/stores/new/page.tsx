import { listCategories } from '@/lib/firebase/db';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { redirect } from 'next/navigation';
import { StoreForm } from '@/components/admin/StoreForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewStorePage() {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    redirect('/admin/login');
  }

  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="p-1.5 rounded hover:bg-[var(--gray-200)] text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
            Add New Store Listing
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Create an original, hand-checked store listing following the 150-word quality gate standard.
          </p>
        </div>
      </div>

      <StoreForm categories={categories} isEdit={false} />
    </div>
  );
}
