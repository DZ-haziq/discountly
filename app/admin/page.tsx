import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { listStores, listCategories, getClickStats } from '@/lib/firebase/db';
import { Plus, Search, ExternalLink, Edit3, Trash2, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

import FirebaseSeedButton from '@/components/admin/FirebaseSeedButton';

export const dynamic = 'force-dynamic';

export default async function AdminStoresPage() {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    redirect('/admin/login');
  }

  const stores = await listStores();
  const categories = await listCategories();
  const clickStats = await getClickStats();

  const clickMap = new Map<string, number>();
  clickStats.forEach(c => clickMap.set(c.slug, c.totalClicks));

  const publishedCount = stores.filter(s => s.status === 'published').length;
  const indexableCount = stores.filter(s => s.indexable).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
            Store Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            {stores.length} total stores ({publishedCount} published, {indexableCount} passing indexability quality gate)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FirebaseSeedButton buttonText="⚡ Sync All to Firebase" showLogs={false} />
          <Link
            href="/admin/stores/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-[var(--black)] text-white text-xs sm:text-sm font-medium hover:bg-[var(--charcoal)] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Store</span>
          </Link>
        </div>
      </div>


      {/* Stores Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[var(--off-white)] border-b border-[var(--border)] text-[var(--text-muted)] font-medium">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Store Name & Domain</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Quality Gate</th>
                <th className="py-3.5 px-3">Categories</th>
                <th className="py-3.5 px-3">Outbound Clicks</th>
                <th className="py-3.5 px-3">Last Verified</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                    No stores in database. Click &ldquo;Add New Store&rdquo; to create your first listing.
                  </td>
                </tr>
              ) : (
                stores.map(store => {
                  const clicks = clickMap.get(store.slug) || 0;
                  const storeCategories = categories.filter(c => store.categoryIds.includes(c.id));

                  return (
                    <tr key={store.slug} className="hover:bg-[var(--off-white)]/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-[var(--text)] flex items-center gap-2">
                          <span>{store.name}</span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          {store.canonicalUrl ? new URL(store.canonicalUrl).hostname : store.slug}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {store.status === 'published' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black text-white">
                            Published
                          </span>
                        ) : store.status === 'draft' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-gray-400 text-gray-700">
                            Draft
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-200 text-gray-600">
                            Archived
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        {store.indexable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-black">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Passed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600" title={store.gateFailures?.join('; ')}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>noindex</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {storeCategories.map(c => (
                            <span
                              key={c.id}
                              className="text-[10px] px-2 py-0.5 rounded bg-[var(--off-white)] border border-[var(--border)]"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-xs">
                        {clicks} clicks
                      </td>

                      <td className="py-3.5 px-3 text-xs text-[var(--text-muted)]">
                        {formatDate(store.lastReviewedOn || store.updatedAt)}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/stores/${store.slug}`}
                            target="_blank"
                            title="View Public Page"
                            className="p-1.5 rounded hover:bg-[var(--gray-200)] text-[var(--text-muted)] hover:text-[var(--text)]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/stores/${store.slug}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--border)] hover:bg-[var(--gray-200)] font-medium text-xs text-[var(--text)]"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
