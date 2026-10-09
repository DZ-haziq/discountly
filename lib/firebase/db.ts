import { getFirestore } from './admin';
import { FieldValue, Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Store, StorePrivate, Category, Redirect, Settings, FetchLog } from '../types';
import { evaluateIndexabilityGate } from '../seo/indexability';

async function withTimeout<T>(promise: Promise<T>, ms = 3500): Promise<T> {
  // Prevent UnhandledPromiseRejection if the underlying promise rejects after timeout
  promise.catch(() => {});
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore operation timed out')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

// In-memory cache for fast page loading (60s TTL)
let cachedStores: { data: Store[]; timestamp: number; key: string }[] = [];
let cachedCategories: { data: Category[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 120 * 1000;

export function invalidateDbCache() {
  cachedStores = [];
  cachedCategories = null;
}

type FirestoreTimestamp = { toDate: () => Date };

function tsToStr(val: unknown): string {
  if (val && typeof (val as FirestoreTimestamp).toDate === 'function') {
    return (val as FirestoreTimestamp).toDate().toISOString();
  }
  return typeof val === 'string' ? val : new Date().toISOString();
}

function tsToDateOnly(val: unknown): string {
  if (val && typeof (val as FirestoreTimestamp).toDate === 'function') {
    return (val as FirestoreTimestamp).toDate().toISOString().split('T')[0];
  }
  return typeof val === 'string' ? val : '';
}

function tsToStrOpt(val: unknown): string | undefined {
  if (!val) return undefined;
  if (typeof (val as FirestoreTimestamp).toDate === 'function') {
    return (val as FirestoreTimestamp).toDate().toISOString();
  }
  return typeof val === 'string' ? val : undefined;
}

function normalizeStore(raw: Store & Record<string, unknown>): Store {
  if (!raw) return raw;
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name : (raw.slug || 'Store');
  const canonicalUrl = typeof raw.canonicalUrl === 'string' ? raw.canonicalUrl : '';
  const shortDescription = typeof raw.shortDescription === 'string' ? raw.shortDescription : '';
  const overview = typeof raw.overview === 'string' ? raw.overview : '';

  return {
    ...raw,
    slug: raw.slug || '',
    name,
    canonicalUrl,
    shortDescription,
    overview,
    categoryIds: Array.isArray(raw.categoryIds) ? raw.categoryIds.filter(Boolean) : [],
    checks: Array.isArray(raw.checks)
      ? raw.checks.map((c: unknown) => {
          if (typeof c === 'string') return { text: c, checkedOn: '' };
          const ch = c as { text?: string; checkedOn?: string };
          return { text: ch?.text || '', checkedOn: ch?.checkedOn || '' };
        })
      : [],
    gateFailures: Array.isArray(raw.gateFailures) ? raw.gateFailures : [],
    discountPercent: (raw.discountPercent as string | undefined) || undefined,
    referralCode: (raw.referralCode as string | undefined) || undefined,
    bannerImageUrl: (raw.bannerImageUrl as string | undefined) || undefined,
    lastReviewedOn: tsToDateOnly(raw.lastReviewedOn),
    createdAt: tsToStr(raw.createdAt),
    updatedAt: tsToStr(raw.updatedAt),
    publishedAt: tsToStrOpt(raw.publishedAt),
  };
}

// --- STORES API ---

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  if (!slug) return null;
  try {
    const db = getFirestore();
    const doc = await withTimeout(db.collection('stores').doc(slug).get());
    if (doc && doc.exists) {
      return normalizeStore({ slug: doc.id, ...doc.data() } as Store & Record<string, unknown>);
    }
    return null;
  } catch (err) {
    console.warn(`[db] getStoreBySlug(${slug}) error:`, err);
    return null;
  }
}

export async function listStores(filter?: { status?: Store['status']; categoryId?: string }): Promise<Store[]> {
  const cacheKey = JSON.stringify(filter || {});
  const now = Date.now();
  const cached = cachedStores.find(c => c.key === cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const db = getFirestore();
    let query: Query = db.collection('stores');

    if (filter?.status) {
      query = query.where('status', '==', filter.status);
    }

    if (filter?.categoryId) {
      try {
        const catQuery = query.where('categoryIds', 'array-contains', filter.categoryId);
        const snapshot = await withTimeout(catQuery.get());
        const results = snapshot.docs.map((d: QueryDocumentSnapshot) =>
          normalizeStore({ slug: d.id, ...d.data() } as Store & Record<string, unknown>)
        );
        cachedStores = cachedStores.filter(c => c.key !== cacheKey).concat({ key: cacheKey, data: results, timestamp: now });
        return results;
      } catch {
        // Composite index missing — fall back to in-memory filter
        const snapshot = await withTimeout(query.get());
        const all = snapshot.docs.map((d: QueryDocumentSnapshot) =>
          normalizeStore({ slug: d.id, ...d.data() } as Store & Record<string, unknown>)
        );
        const results = all.filter(s => Array.isArray(s.categoryIds) && s.categoryIds.includes(filter.categoryId!));
        cachedStores = cachedStores.filter(c => c.key !== cacheKey).concat({ key: cacheKey, data: results, timestamp: now });
        return results;
      }
    }

    const snapshot = await withTimeout(query.get());
    const results = snapshot.docs.map((d: QueryDocumentSnapshot) =>
      normalizeStore({ slug: d.id, ...d.data() } as Store & Record<string, unknown>)
    );
    cachedStores = cachedStores.filter(c => c.key !== cacheKey).concat({ key: cacheKey, data: results, timestamp: now });
    return results;
  } catch (err) {
    console.warn('[db] listStores error:', err);
    if (cached) return cached.data;
    return [];
  }
}

export async function saveStoreWithPrivateData(
  store: Store,
  privateData: StorePrivate,
  oldSlug?: string
): Promise<{ success: boolean; error?: string }> {
  // Compute indexability quality gate automatically
  const gateResult = evaluateIndexabilityGate(store);
  store.indexable = gateResult.indexable;
  store.gateFailures = gateResult.failures;
  store.updatedAt = new Date().toISOString();

  const db = getFirestore();
  try {
    const batch = db.batch();

    if (oldSlug && oldSlug !== store.slug) {
      const oldStoreRef = db.collection('stores').doc(oldSlug);
      const oldPrivateRef = db.collection('storesPrivate').doc(oldSlug);
      const redirectRef = db.collection('redirects').doc(oldSlug);

      batch.delete(oldStoreRef);
      batch.delete(oldPrivateRef);
      batch.set(redirectRef, {
        oldSlug,
        toSlug: store.slug,
        createdAt: new Date().toISOString()
      });
    }

    const storeRef = db.collection('stores').doc(store.slug);
    const privateRef = db.collection('storesPrivate').doc(store.slug);

    batch.set(storeRef, store, { merge: true });
    batch.set(privateRef, privateData, { merge: true });

    await batch.commit();
    invalidateDbCache();
    return { success: true };
  } catch (err: unknown) {
    console.error('Firestore saveStore error:', err);
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteStore(slug: string): Promise<boolean> {
  const db = getFirestore();
  try {
    const batch = db.batch();
    batch.delete(db.collection('stores').doc(slug));
    batch.delete(db.collection('storesPrivate').doc(slug));
    await batch.commit();
    invalidateDbCache();
    return true;
  } catch (err: unknown) {
    console.error('Firestore deleteStore error:', err);
    return false;
  }
}

// --- PRIVATE STORE DATA (NEVER CLIENT-EXPOSED) ---

export async function getStorePrivate(slug: string): Promise<StorePrivate | null> {
  try {
    const db = getFirestore();
    const doc = await withTimeout(db.collection('storesPrivate').doc(slug).get());
    if (doc && doc.exists) {
      return doc.data() as StorePrivate;
    }
    return null;
  } catch (err) {
    console.warn(`[db] getStorePrivate(${slug}) error:`, err);
    return null;
  }
}

// --- CATEGORIES API ---

export async function listCategories(): Promise<Category[]> {
  const now = Date.now();
  if (cachedCategories && now - cachedCategories.timestamp < CACHE_TTL_MS) {
    return cachedCategories.data;
  }

  try {
    const db = getFirestore();
    const snapshot = await withTimeout(db.collection('categories').get());
    const cats = snapshot.docs.map((d: QueryDocumentSnapshot) => {
      const data = d.data() || {};
      return {
        id: d.id,
        name: data['name'] || d.id,
        intro: data['intro'] || '',
        order: typeof data['order'] === 'number' ? data['order'] : 99,
        ...data
      } as Category;
    });
    const sorted = cats.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    cachedCategories = { data: sorted, timestamp: now };
    return sorted;
  } catch (err) {
    console.warn('[db] listCategories error:', err);
    if (cachedCategories) return cachedCategories.data;
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  if (!id) return null;
  try {
    const db = getFirestore();
    const doc = await withTimeout(db.collection('categories').doc(id).get());
    if (doc && doc.exists) {
      const data = doc.data() || {};
      return {
        id: doc.id,
        name: data['name'] || doc.id,
        intro: data['intro'] || '',
        order: typeof data['order'] === 'number' ? data['order'] : 99,
        ...data
      } as Category;
    }
    return null;
  } catch (err) {
    console.warn(`[db] getCategoryById(${id}) error:`, err);
    return null;
  }
}

export async function saveCategory(category: Category): Promise<boolean> {
  try {
    const db = getFirestore();
    await withTimeout(db.collection('categories').doc(category.id).set(category, { merge: true }));
    return true;
  } catch (err: unknown) {
    console.error('Firestore saveCategory error:', err);
    return false;
  }
}

// --- REDIRECTS API ---

export async function getRedirect(oldSlug: string): Promise<Redirect | null> {
  try {
    const db = getFirestore();
    const doc = await withTimeout(db.collection('redirects').doc(oldSlug).get());
    if (doc && doc.exists) {
      return doc.data() as Redirect;
    }
    return null;
  } catch (err) {
    console.warn(`[db] getRedirect(${oldSlug}) error:`, err);
    return null;
  }
}

// --- CLICK TRACKING API ---

export async function incrementClickCount(slug: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const docId = `${slug}_${today}`;
    const db = getFirestore();
    const ref = db.collection('clickCounts').doc(docId);
    await ref.set({ slug, day: today, count: FieldValue.increment(1) }, { merge: true });
  } catch (err) {
    console.warn('[db] incrementClickCount error:', err);
  }
}

export async function getClickStats(): Promise<{ slug: string; totalClicks: number }[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('clickCounts').get();
    const totals = new Map<string, number>();
    for (const doc of snapshot.docs) {
      const data = doc.data() as { slug: string; count: number };
      totals.set(data.slug, (totals.get(data.slug) || 0) + (data.count || 0));
    }
    return Array.from(totals.entries()).map(([slug, totalClicks]) => ({ slug, totalClicks }));
  } catch (err) {
    console.warn('[db] getClickStats error:', err);
    return [];
  }
}

// --- LOGGING & SETTINGS ---

export async function logFetchResult(log: FetchLog): Promise<void> {
  try {
    const db = getFirestore();
    await db.collection('fetchLogs').add(log);
  } catch (err: unknown) {
    console.error('Firestore logFetchResult error:', err);
  }
}

export async function getSiteSettings(): Promise<Settings> {
  try {
    const db = getFirestore();
    const doc = await db.collection('settings').doc('site').get();
    if (doc.exists) {
      return doc.data() as Settings;
    }
  } catch (err) {
    console.warn('[db] getSiteSettings error:', err);
  }
  return {
    siteName: 'Discountly',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://discountly.com',
    minWords: 150,
    adminEmails: []
  };
}

export async function updateSiteSettings(settings: Partial<Settings>): Promise<boolean> {
  try {
    const db = getFirestore();
    await db.collection('settings').doc('site').set(settings, { merge: true });
    return true;
  } catch (err: unknown) {
    console.error('Firestore updateSiteSettings error:', err);
    return false;
  }
}
