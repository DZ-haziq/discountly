import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuthInstance, Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;

export function getFirebaseAdminApp(): App | null {
  if (adminApp) {
    return adminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    adminApp = existingApps[0];
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Step 1: Strip surrounding quotes if Vercel wrapped the value in them
    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
    }
    // Step 2: Replace literal \n (backslash + n) with real newlines
    // This handles the Vercel dashboard format where \n is stored as two chars
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    // Path 1: Full service account via individual env vars (preferred for Vercel)
    if (projectId && clientEmail && privateKey) {
      console.log('[Firebase Admin] Initializing. Project:', projectId);
      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey })
      });
      console.log('[Firebase Admin] Initialized successfully.');
      return adminApp;
    }

    // Path 2: Full service account JSON as a single env var (raw JSON or base64)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (serviceAccountJson) {
      let trimmed = serviceAccountJson.trim().replace(/^["']|["']$/g, '');
      if (!trimmed.startsWith('{')) {
        try { trimmed = Buffer.from(trimmed, 'base64').toString('utf-8'); } catch {}
      }
      const serviceAccount = JSON.parse(trimmed);
      if (serviceAccount && typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      adminApp = initializeApp({ credential: cert(serviceAccount) });
      return adminApp;
    }

    console.warn('[Firebase Admin] Missing credentials: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY not set in Vercel.');
  } catch (err) {
    console.error('[Firebase Admin] Initialization error:', err);
  }

  return null;
}

export function getFirestore(): Firestore | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    const db = getAdminFirestore(app);
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {}
    return db;
  } catch {
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return getAdminAuthInstance(app);
  } catch {
    return null;
  }
}
