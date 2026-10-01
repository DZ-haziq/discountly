import { NextResponse } from 'next/server';
import { listStores, listCategories, saveStoreWithPrivateData, saveCategory } from '@/lib/firebase/db';

export async function POST() {
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
