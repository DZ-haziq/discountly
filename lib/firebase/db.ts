import { getFirestore } from './admin';
import { FieldValue, Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Store, StorePrivate, Category, Redirect, Settings, FetchLog } from '../types';
import { evaluateIndexabilityGate } from '../seo/indexability';

// Initial high-quality verified sample data (used when Firestore admin credentials are not active or in dev mode)
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'electronics-and-tech',
    name: 'Electronics & Tech',
    intro: 'Hand-checked online stores specializing in consumer electronics, audio gear, and computer peripherals. We verify direct brand warranties and international shipping policies before listing.',
    order: 1
  },
  {
    id: 'home-and-kitchen',
    name: 'Home & Kitchen',
    intro: 'Curated specialty retailers offering cookware, appliances, and homeware. Each listing includes verified return windows and direct customer support channels.',
    order: 2
  },
  {
    id: 'outdoor-and-gear',
    name: 'Outdoor & Gear',
    intro: 'Independent and established outdoor equipment stores for camping, hiking, and travel. We confirm physical warehouse locations and official distribution channels.',
    order: 3
  },
  {
    id: 'software-and-tools',
    name: 'Software & Tools',
    intro: 'Directory of verified SaaS platforms, productivity utilities, and developer software with clear billing terms and trial policies.',
    order: 4
  }
];

const INITIAL_STORES: Store[] = [
  {
    slug: 'anker-direct',
    name: 'Anker Direct',
    canonicalUrl: 'https://www.anker.com',
    shortDescription: 'Official online store for Anker charging accessories, portable power stations, and USB-C hubs.',
    overview: 'Anker is a well-established hardware brand known for durable charging cables, multi-port GaN desktop chargers, and high-capacity portable power stations. The official web store provides direct manufacturer warranties, bundled accessories, and regular product release exclusives.',
    whoItSuits: 'Ideal for remote workers, tech enthusiasts, and travelers looking for reliable mobile charging solutions and certified replacement batteries backed by direct manufacturer customer support.',
    checks: [
      { text: 'Official 18 to 24 month hassle-free manufacturer warranty on charging products', checkedOn: '2026-09-15' },
      { text: '30-day money-back guarantee with prepaid return labels for defective units', checkedOn: '2026-09-15' },
      { text: 'Free standard shipping on all orders over $30 within the contiguous US', checkedOn: '2026-09-15' }
    ],
    shippingReturns: {
      text: 'Ships across North America and Western Europe. Returns accepted within 30 days of receipt.',
      policyUrl: 'https://www.anker.com/refund-policy',
      checkedOn: '2026-09-15'
    },
    editorNote: 'Refurbished units come with an official 1-year certified warranty and are clearly marked in the outlet section.',
    countryCode: 'US',
    categoryIds: ['electronics-and-tech'],
    logoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=128&h=128&fit=crop&q=80',
    logoAlt: 'Anker Direct brand logo',
    seoTitle: 'Anker Direct: Store Details & Official Link',
    seoDescription: 'Explore verified store details for Anker Direct. Learn about direct warranties, shipping terms, and visit the official website.',
    primaryKeyword: 'anker direct store details',
    status: 'published',
    indexable: true,
    gateFailures: [],
    provenance: {
      canonicalUrl: { source: 'OWNER_SITE', state: 'confirmed', sourceUrl: 'https://www.anker.com' },
      overview: { source: 'USER', state: 'confirmed' },
      shippingReturns: { source: 'OWNER_SITE', state: 'confirmed', sourceUrl: 'https://www.anker.com/refund-policy' }
    },
    safety: { webRiskOk: true, checkedAt: '2026-09-15T10:00:00Z' },
    publishedAt: '2026-09-15T12:00:00Z',
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-15T12:00:00Z',
    lastReviewedOn: '2026-09-15'
  },
  {
    slug: 'fellow-products',
    name: 'Fellow Products',
    canonicalUrl: 'https://fellowproducts.com',
    shortDescription: 'Design-driven coffee brewing gear, precision electric kettles, and vacuum storage canisters.',
    overview: 'Fellow specializes in specialty coffee equipment characterized by minimalist aesthetics and precise temperature engineering. Their product catalog centers on variable-temperature pour-over kettles, burr grinders, and insulated travel mugs designed for specialty coffee lovers.',
    whoItSuits: 'Home baristas and design-conscious coffee drinkers seeking precision temperature control and minimalist countertop aesthetics.',
    checks: [
      { text: 'Standard 1-year limited warranty with option to register for a complimentary 2-year extension', checkedOn: '2026-09-20' },
      { text: '30-day return policy for unused items in original packaging', checkedOn: '2026-09-20' },
      { text: 'US domestic ground shipping takes 3-7 business days with tracked delivery', checkedOn: '2026-09-20' }
    ],
    shippingReturns: {
      text: 'Domestic and select international shipping available. 30-day return window.',
      policyUrl: 'https://fellowproducts.com/pages/returns-exchanges',
      checkedOn: '2026-09-20'
    },
    editorNote: 'Electrical appliances feature regional voltage specifications (120V US vs 220V EU); ensure you select the correct voltage variant.',
    countryCode: 'US',
    categoryIds: ['home-and-kitchen'],
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=128&h=128&fit=crop&q=80',
    logoAlt: 'Fellow Products brand logo',
    seoTitle: 'Fellow Products: Specialty Coffee Gear & Official Store',
    seoDescription: 'Read our verified store overview for Fellow Products. Details on electric kettles, warranty extension, and official store link.',
    primaryKeyword: 'fellow products coffee store',
    status: 'published',
    indexable: true,
    gateFailures: [],
    provenance: {
      canonicalUrl: { source: 'OWNER_SITE', state: 'confirmed', sourceUrl: 'https://fellowproducts.com' },
      overview: { source: 'USER', state: 'confirmed' }
    },
    safety: { webRiskOk: true, checkedAt: '2026-09-20T10:00:00Z' },
    publishedAt: '2026-09-20T12:00:00Z',
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-20T12:00:00Z',
    lastReviewedOn: '2026-09-20'
  },
  {
    slug: 'matador-equipment',
    name: 'Matador Equipment',
    canonicalUrl: 'https://matadorequipment.com',
    shortDescription: 'Ultralight packable travel gear, waterproof backpacks, and compact outdoor accessories.',
    overview: 'Matador designs technical packable backpacks, waterproof toiletry cases, and outdoor travel accessories engineered for adventure travel. The gear emphasizes lightweight Cordura materials, seam-sealed waterproofing, and extreme compact compressibility.',
    whoItSuits: 'Ultralight hikers, one-bag travelers, and outdoor photographers needing weather-resistant, packable storage that folds down flat.',
    checks: [
      { text: '3-year warranty covering material defects and workmanship on all bags', checkedOn: '2026-09-25' },
      { text: 'Free shipping on US domestic orders above $75', checkedOn: '2026-09-25' },
      { text: '30-day return window from order delivery date', checkedOn: '2026-09-25' }
    ],
    shippingReturns: {
      text: 'Ships from Colorado, USA with worldwide delivery options. 30-day return window.',
      policyUrl: 'https://matadorequipment.com/pages/returns-warranty',
      checkedOn: '2026-09-25'
    },
    editorNote: 'Technical fabrics require hand-washing and air drying to preserve waterproof silicone coating.',
    countryCode: 'US',
    categoryIds: ['outdoor-and-gear'],
    logoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=128&h=128&fit=crop&q=80',
    logoAlt: 'Matador Equipment outdoor gear logo',
    seoTitle: 'Matador Equipment: Packable Travel Gear & Official Store',
    seoDescription: 'Verified store details for Matador Equipment. Learn about packable bags, warranty policies, and official website access.',
    primaryKeyword: 'matador equipment travel gear',
    status: 'published',
    indexable: true,
    gateFailures: [],
    provenance: {
      canonicalUrl: { source: 'OWNER_SITE', state: 'confirmed', sourceUrl: 'https://matadorequipment.com' },
      overview: { source: 'USER', state: 'confirmed' }
    },
    safety: { webRiskOk: true, checkedAt: '2026-09-25T10:00:00Z' },
    publishedAt: '2026-09-25T12:00:00Z',
    createdAt: '2026-09-25T10:00:00Z',
    updatedAt: '2026-09-25T12:00:00Z',
    lastReviewedOn: '2026-09-25'
  }
];

const INITIAL_STORES_PRIVATE: Record<string, StorePrivate> = {
  'anker-direct': {
    slug: 'anker-direct',
    affiliateUrl: 'https://www.anker.com/?utm_source=affiliate&aff_id=discountly',
    network: 'Direct Impact',
    updatedAt: '2026-09-15T12:00:00Z'
  },
  'fellow-products': {
    slug: 'fellow-products',
    affiliateUrl: 'https://fellowproducts.com/?aff=discountly',
    network: 'ShareASale',
    updatedAt: '2026-09-20T12:00:00Z'
  },
  'matador-equipment': {
    slug: 'matador-equipment',
    affiliateUrl: 'https://matadorequipment.com/?ref=discountly',
    network: 'AvantLink',
    updatedAt: '2026-09-25T12:00:00Z'
  }
};

// Global in-memory cache for development/fallback
let memoryStores: Map<string, Store> = new Map(INITIAL_STORES.map(s => [s.slug, s]));
let memoryStoresPrivate: Map<string, StorePrivate> = new Map(Object.entries(INITIAL_STORES_PRIVATE));
let memoryCategories: Map<string, Category> = new Map(INITIAL_CATEGORIES.map(c => [c.id, c]));
let memoryRedirects: Map<string, Redirect> = new Map();
let memoryClickCounts: Map<string, number> = new Map();
let memoryFetchLogs: FetchLog[] = [];
let memorySettings: Settings = {
  siteName: 'Discountly',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://discountly.com',
  minWords: 150,
  adminEmails: (process.env.ADMIN_EMAILS || 'admin@discountly.com').split(',').map(e => e.trim())
};

// --- STORES API ---

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const db = getFirestore();
  if (db) {
    try {
      const doc = await db.collection('stores').doc(slug).get();
      if (doc.exists) {
        return doc.data() as Store;
      }
    } catch (err) {
      console.warn('Firestore getStoreBySlug fallback:', err);
    }
  }
  return memoryStores.get(slug) || null;
}

export async function listStores(filter?: { status?: Store['status']; categoryId?: string }): Promise<Store[]> {
  const db = getFirestore();
  if (db) {
    try {
      let query: Query = db.collection('stores');
      if (filter?.status) {
        query = query.where('status', '==', filter.status);
      }
      if (filter?.categoryId) {
        query = query.where('categoryIds', 'array-contains', filter.categoryId);
      }
      const snapshot = await query.get();
      return snapshot.docs.map((d: QueryDocumentSnapshot) => d.data() as Store);
    } catch (err) {
      console.warn('Firestore listStores fallback:', err);
    }
  }

  let results = Array.from(memoryStores.values());
  if (filter?.status) {
    results = results.filter(s => s.status === filter.status);
  }
  if (filter?.categoryId) {
    results = results.filter(s => s.categoryIds.includes(filter.categoryId!));
  }
  return results;
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
  if (db) {
    try {
      const batch = db.batch();

      // Handle slug rename transaction
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
      return { success: true };
    } catch (err: unknown) {
      console.error('Firestore saveStore error:', err);
      return { success: false, error: (err as Error).message };
    }
  }

  // Memory store fallback
  if (oldSlug && oldSlug !== store.slug) {
    memoryStores.delete(oldSlug);
    memoryStoresPrivate.delete(oldSlug);
    memoryRedirects.set(oldSlug, {
      oldSlug,
      toSlug: store.slug,
      createdAt: new Date().toISOString()
    });
  }

  memoryStores.set(store.slug, store);
  memoryStoresPrivate.set(store.slug, privateData);
  return { success: true };
}

export async function deleteStore(slug: string): Promise<boolean> {
  const db = getFirestore();
  if (db) {
    try {
      const batch = db.batch();
      batch.delete(db.collection('stores').doc(slug));
      batch.delete(db.collection('storesPrivate').doc(slug));
      await batch.commit();
      return true;
    } catch {
      return false;
    }
  }
  memoryStores.delete(slug);
  memoryStoresPrivate.delete(slug);
  return true;
}

// --- PRIVATE STORE DATA (NEVER CLIENT-EXPOSED) ---

export async function getStorePrivate(slug: string): Promise<StorePrivate | null> {
  const db = getFirestore();
  if (db) {
    try {
      const doc = await db.collection('storesPrivate').doc(slug).get();
      if (doc.exists) {
        return doc.data() as StorePrivate;
      }
    } catch (err) {
      console.warn('Firestore getStorePrivate fallback:', err);
    }
  }
  return memoryStoresPrivate.get(slug) || null;
}

// --- CATEGORIES API ---

export async function listCategories(): Promise<Category[]> {
  const db = getFirestore();
  if (db) {
    try {
      const snapshot = await db.collection('categories').orderBy('order', 'asc').get();
      if (!snapshot.empty) {
        return snapshot.docs.map((d: QueryDocumentSnapshot) => d.data() as Category);
      }
    } catch (err) {
      console.warn('Firestore listCategories fallback:', err);
    }
  }
  return Array.from(memoryCategories.values()).sort((a, b) => a.order - b.order);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getFirestore();
  if (db) {
    try {
      const doc = await db.collection('categories').doc(id).get();
      if (doc.exists) {
        return doc.data() as Category;
      }
    } catch (err) {
      console.warn('Firestore getCategoryById fallback:', err);
    }
  }
  return memoryCategories.get(id) || null;
}

export async function saveCategory(category: Category): Promise<boolean> {
  const db = getFirestore();
  if (db) {
    try {
      await db.collection('categories').doc(category.id).set(category, { merge: true });
      return true;
    } catch {
      return false;
    }
  }
  memoryCategories.set(category.id, category);
  return true;
}

// --- REDIRECTS API ---

export async function getRedirect(oldSlug: string): Promise<Redirect | null> {
  const db = getFirestore();
  if (db) {
    try {
      const doc = await db.collection('redirects').doc(oldSlug).get();
      if (doc.exists) {
        return doc.data() as Redirect;
      }
    } catch (err) {
      console.warn('Firestore getRedirect fallback:', err);
    }
  }
  return memoryRedirects.get(oldSlug) || null;
}

// --- CLICK TRACKING API ---

export async function incrementClickCount(slug: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const docId = `${slug}_${today}`;

  const db = getFirestore();
  if (db) {
    try {
      const ref = db.collection('clickCounts').doc(docId);
      await ref.set({
        slug,
        day: today,
        count: FieldValue.increment(1)
      }, { merge: true });
      return;
    } catch (err) {
      console.warn('Firestore incrementClickCount fallback:', err);
    }
  }

  const current = memoryClickCounts.get(docId) || 0;
  memoryClickCounts.set(docId, current + 1);
}

export async function getClickStats(): Promise<{ slug: string; totalClicks: number }[]> {
  const totals = new Map<string, number>();

  const db = getFirestore();
  if (db) {
    try {
      const snapshot = await db.collection('clickCounts').get();
      for (const doc of snapshot.docs) {
        const data = doc.data() as { slug: string; count: number };
        totals.set(data.slug, (totals.get(data.slug) || 0) + (data.count || 0));
      }
      return Array.from(totals.entries()).map(([slug, totalClicks]) => ({ slug, totalClicks }));
    } catch (err) {
      console.warn('Firestore getClickStats fallback:', err);
    }
  }

  for (const [key, count] of memoryClickCounts.entries()) {
    const slug = key.split('_')[0];
    totals.set(slug, (totals.get(slug) || 0) + count);
  }
  return Array.from(totals.entries()).map(([slug, totalClicks]) => ({ slug, totalClicks }));
}

// --- LOGGING & SETTINGS ---

export async function logFetchResult(log: FetchLog): Promise<void> {
  const db = getFirestore();
  if (db) {
    try {
      await db.collection('fetchLogs').add(log);
      return;
    } catch {}
  }
  memoryFetchLogs.push(log);
  if (memoryFetchLogs.length > 50) memoryFetchLogs.shift();
}

export async function getSiteSettings(): Promise<Settings> {
  const db = getFirestore();
  if (db) {
    try {
      const doc = await db.collection('settings').doc('site').get();
      if (doc.exists) {
        return doc.data() as Settings;
      }
    } catch {}
  }
  return memorySettings;
}

export async function updateSiteSettings(settings: Partial<Settings>): Promise<boolean> {
  const db = getFirestore();
  if (db) {
    try {
      await db.collection('settings').doc('site').set(settings, { merge: true });
      return true;
    } catch {
      return false;
    }
  }
  memorySettings = { ...memorySettings, ...settings };
  return true;
}
