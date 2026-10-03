import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuthInstance, Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;

function cleanPrivateKey(raw: string): string {
  if (!raw) return raw;
  let key = raw.trim();

  // If user pasted the whole service account JSON into FIREBASE_PRIVATE_KEY
  if (key.startsWith('{') && key.endsWith('}')) {
    try {
      const parsed = JSON.parse(key);
      if (parsed.private_key) key = parsed.private_key;
    } catch {
      // not JSON, proceed
    }
  }

  // If user pasted base64-encoded PEM
  if (!key.includes('BEGIN') && /^[A-Za-z0-9+/=\s]+$/.test(key)) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.includes('BEGIN')) key = decoded;
    } catch {
      // not base64, proceed
    }
  }

  // Strip surrounding quotes or backticks (including escaped quotes)
  key = key.replace(/^["'`\\]+|["'`\\]+$/g, '');

  // Normalize escaped newlines and CRLF
  key = key
    .replace(/\\+n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Extract PEM header, base64 body, and footer, rebuilding standard 64-char lines.
  // This handles keys where newlines were replaced by spaces, irregular line breaks,
  // or stray spaces that trigger OpenSSL ERR_OSSL_UNSUPPORTED.
  const m = key.match(/(-----BEGIN[^-]+-----)([\s\S]+)(-----END[^-]+-----)/);
  if (m) {
    const header = m[1].trim();
    const footer = m[3].trim();
    const body = m[2].replace(/\s+/g, '');
    const lines = body.match(/.{1,64}/g) || [];
    return [header, ...lines, footer, ''].join('\n');
  }

  return key;
}

function initAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0 && existing[0]) {
    return existing[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) throw new Error('[Firebase Admin] Missing env var: FIREBASE_PROJECT_ID');
  if (!clientEmail) throw new Error('[Firebase Admin] Missing env var: FIREBASE_CLIENT_EMAIL');
  if (!rawKey) throw new Error('[Firebase Admin] Missing env var: FIREBASE_PRIVATE_KEY');

  const privateKey = cleanPrivateKey(rawKey);

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
