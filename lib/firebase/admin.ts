import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuthInstance, Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;

function initAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0 && existing[0]) {
    return existing[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) throw new Error('[Firebase Admin] Missing env var: FIREBASE_PROJECT_ID');
  if (!clientEmail) throw new Error('[Firebase Admin] Missing env var: FIREBASE_CLIENT_EMAIL');
  if (!privateKey) throw new Error('[Firebase Admin] Missing env var: FIREBASE_PRIVATE_KEY');

  // Clean the key: strip surrounding quotes, replace literal \n with real newlines
  privateKey = privateKey.trim();
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  console.log('[Firebase Admin] Initializing with project:', projectId);
  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  console.log('[Firebase Admin] Initialized successfully.');
  return app;
}

function getAdminApp(): App {
  if (!adminApp) {
    adminApp = initAdminApp();
  }
  return adminApp;
}

export function getFirestore(): Firestore {
  const app = getAdminApp();
  const db = getAdminFirestore(app);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings() throws if called more than once — safe to ignore
  }
  return db;
}

export function getAdminAuth(): Auth {
  return getAdminAuthInstance(getAdminApp());
}
