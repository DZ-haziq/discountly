import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { listStores, listCategories } from '@/lib/firebase/db';
import { Plus, Edit3, Eye, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) redirect('/admin/login');

  const stores = await listStores();
  const categories = await listCategories();

  const published = stores.filter(s => s.status === 'published').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Stores</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{published} published · {stores.length} total</p>
        </div>
        <Link
          href="/admin/stores/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-[var(--black)] text-white text-sm font-medium hover:bg-[var(--charcoal)] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Store</span>
        </Link>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[var(--off-white)] border-b border-[var(--border)] text-[var(--text-muted)]">
              <tr>
                <th className="py-3 px-4">Store</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                    No stores yet.{' '}
                    <Link href="/admin/stores/new" className="underline font-medium text-[var(--text)]">Add your first store</Link>
                  </td>
                </tr>
              ) : stores.map(store => {
                const storeCategories = categories
                  .filter(c => Array.isArray(store.categoryIds) && store.categoryIds.includes(c.id))
                  .map(c => c.name).join(', ');

                return (
                  <tr key={store.slug} className="hover:bg-[var(--off-white)]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {store.logoUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={store.logoUrl} alt="" className="w-8 h-8 rounded object-cover border border-[var(--border)] bg-white" />
                        )}
                        <div>
                          <div className="font-medium text-[var(--text)]">{store.name}</div>
                          <div className="text-[11px] text-[var(--text-muted)] font-mono">{store.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {store.discountPercent ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold">
                          {store.discountPercent}
                        </span>
                      ) : <span className="text-[var(--text-muted)]">—</span>}
                    </td>

                    <td className="py-3 px-3">
                      {store.referralCode ? (
                        <span className="font-mono font-semibold text-xs text-[var(--text)] bg-[var(--off-white)] border border-[var(--border)] px-2 py-0.5 rounded">
                          {store.referralCode}
                        </span>
                      ) : <span className="text-[var(--text-muted)]">—</span>}
                    </td>

                    <td className="py-3 px-3 text-xs text-[var(--text-muted)]">{storeCategories || '—'}</td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        store.status === 'published' ? 'bg-black text-white' :
                        store.status === 'draft' ? 'border border-gray-300 text-gray-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {store.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`/stores/${store.slug}`} target="_blank"
                          className="p-1.5 rounded hover:bg-[var(--gray-200)] text-[var(--text-muted)]" title="View public page">
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <Link href={`/admin/stores/${store.slug}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--border)] hover:bg-[var(--gray-200)] text-xs font-medium text-[var(--text)]">
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
