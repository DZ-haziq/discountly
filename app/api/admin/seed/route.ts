import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { listStores, listCategories } from '@/lib/firebase/db';

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const stores = await listStores();
    const categories = await listCategories();

    return NextResponse.json({
      success: true,
      message: 'Database active with verified seed data',
      storesCount: stores.length,
      categoriesCount: categories.length
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
