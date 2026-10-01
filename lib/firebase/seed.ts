import { getClientFirestore, getClientAuth } from './client';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export const SEED_CATEGORIES = [
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

export const SEED_STORES = [
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

export const SEED_STORES_PRIVATE: Record<string, any> = {
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

export async function pushSeedDataToFirestore(onProgress?: (msg: string) => void): Promise<{ success: boolean; message: string; details: string[] }> {
  const details: string[] = [];
  const log = (msg: string) => {
    details.push(msg);
    if (onProgress) onProgress(msg);
  };

  try {
    const db = getClientFirestore();
    const auth = getClientAuth();

    log('Connecting to Firebase Firestore...');

    // 1. Seed Categories
    for (const cat of SEED_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      log(`✓ Seeded category to Firestore: ${cat.name} (${cat.id})`);
    }

    // 2. Seed Stores & StoresPrivate
    for (const store of SEED_STORES) {
      await setDoc(doc(db, 'stores', store.slug), store, { merge: true });
      if (SEED_STORES_PRIVATE[store.slug]) {
        await setDoc(doc(db, 'storesPrivate', store.slug), SEED_STORES_PRIVATE[store.slug], { merge: true });
      }
      log(`✓ Seeded store to Firestore: ${store.name} (${store.slug})`);
    }

    // 3. Provision Admin User in Firebase Auth
    const adminEmail = 'discountly@gmail.com';
    const adminPass = 'Test1234@';
    try {
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPass);
        log(`✓ Admin user verified in Firebase Auth: ${adminEmail}`);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
          log(`✓ Created admin user in Firebase Auth: ${adminEmail}`);
        } else {
          log(`ℹ Firebase Auth status: ${signInErr.message}`);
        }
      }
    } catch (authErr: any) {
      log(`ℹ Auth note: ${authErr.message}`);
    }

    log('🎉 All dummy stores, categories, and admin data successfully written into Firebase!');
    return { success: true, message: 'All data successfully written to Firebase!', details };
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    log(`❌ Error seeding Firebase: ${errMsg}`);
    return { success: false, message: errMsg, details };
  }
}
