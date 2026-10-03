import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { SEED_CATEGORIES, SEED_STORES, SEED_STORES_PRIVATE } from '@/lib/firebase/seed';
import { getFirestore } from '@/lib/firebase/admin';

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getFirestore();
    const details: string[] = [];

    // Seed categories
    for (const cat of SEED_CATEGORIES) {
      await db.collection('categories').doc(cat.id).set(cat, { merge: true });
      details.push(`✓ category: ${cat.name}`);
    }

    // Seed stores + private data
    for (const store of SEED_STORES) {
      await db.collection('stores').doc(store.slug).set(store, { merge: true });
      const priv = SEED_STORES_PRIVATE[store.slug];
      if (priv) {
        await db.collection('storesPrivate').doc(store.slug).set(priv, { merge: true });
      }
      details.push(`✓ store: ${store.name}`);
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${SEED_CATEGORIES.length} categories and ${SEED_STORES.length} stores.`,
      details,
    });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    console.error('[seed/route] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
