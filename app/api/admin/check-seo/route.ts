import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { listStores, listCategories } from '@/lib/firebase/db';
import { runSiteSeoAudit } from '@/lib/seo/checks';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stores = await listStores();
    const categories = await listCategories();
    const issues = runSiteSeoAudit(stores, categories);

    return NextResponse.json({
      success: true,
      issues,
      totalStores: stores.length,
      publishedStores: stores.filter(s => s.status === 'published').length,
      indexableStores: stores.filter(s => s.indexable).length
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
