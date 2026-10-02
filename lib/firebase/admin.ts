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
    // Handle quotes, literal \n, and escaped \\n (common in Vercel env vars)
    privateKey = privateKey.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
  }

  try {
    // Path 1: Full service account via individual env vars (preferred for Vercel)
    if (projectId && clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey })
      });
      return adminApp;
    }

    // Path 2: Full service account JSON as a single env var (easiest for Vercel)
    // In Vercel dashboard, set FIREBASE_SERVICE_ACCOUNT_JSON = paste entire serviceAccount.json contents
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const trimmed = serviceAccountJson.trim().replace(/^["']|["']$/g, '');
      const serviceAccount = JSON.parse(trimmed);
      adminApp = initializeApp({
        credential: cert(serviceAccount)
      });
      return adminApp;
    }
  } catch (err) {
    console.error('Firebase Admin initialization error (falling back to in-memory store):', err);
  }

  return null;
}

export function getFirestore(): Firestore | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return getAdminFirestore(app);
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
