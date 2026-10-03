import dns from 'dns';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuthInstance, Auth } from 'firebase-admin/auth';

// Fix Windows Node.js DNS resolution issues for Google Cloud gRPC services (firestore.googleapis.com)
if (process.platform === 'win32') {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch {
    // Safe fallback if unsupported
  }
  if (!process.env.GRPC_DNS_RESOLVER) {
    process.env.GRPC_DNS_RESOLVER = 'native';
  }
}

let adminApp: App | null = null;

/**
 * Sanitizes and formats the raw Firebase private key string from environment variables.
 * Handles escaped newlines, quotes, JSON service account objects, base64 strings, and whitespace.
 */
function cleanPrivateKey(rawKey: string): string {
  if (!rawKey) return rawKey;
  let key = rawKey.trim();

  // If user pasted full service account JSON object into FIREBASE_PRIVATE_KEY
  if (key.startsWith('{') && key.endsWith('}')) {
    try {
      const parsed = JSON.parse(key);
      if (parsed.private_key) key = parsed.private_key;
    } catch {
      // Not valid JSON, proceed as string
    }
  }

  // Handle base64 encoded PEM key
  if (!key.includes('BEGIN') && /^[A-Za-z0-9+/=\s]+$/.test(key)) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.includes('BEGIN')) key = decoded;
    } catch {
      // Not base64, proceed as string
    }
  }

  // Strip surrounding quotes or backticks
  key = key.replace(/^["'`\\]+|["'`\\]+$/g, '');

  // Normalize escaped newlines and line breaks
  key = key
    .replace(/\\+n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Format header, body, and footer into standard 64-character PEM lines
  const match = key.match(/(-----BEGIN[^-]+-----)([\s\S]+)(-----END[^-]+-----)/);
  if (match) {
    const header = match[1].trim();
    const footer = match[3].trim();
    const body = match[2].replace(/\s+/g, '');
    const lines = body.match(/.{1,64}/g) || [];
    return [header, ...lines, footer, ''].join('\n');
  }

  return key;
}

/**
 * Initializes the Firebase Admin App instance (singleton pattern)
 */
function initAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    return existingApps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) throw new Error('[Firebase Admin] Missing required env variable: FIREBASE_PROJECT_ID');
  if (!clientEmail) throw new Error('[Firebase Admin] Missing required env variable: FIREBASE_CLIENT_EMAIL');
  if (!rawPrivateKey) throw new Error('[Firebase Admin] Missing required env variable: FIREBASE_PRIVATE_KEY');

  const privateKey = cleanPrivateKey(rawPrivateKey);

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

/**
 * Returns the initialized Firebase Admin App instance
 */
export function getAdminApp(): App {
  if (!adminApp) {
    adminApp = initAdminApp();
  }
  return adminApp;
}

/**
 * Returns the Firestore database instance with undefined properties ignored
 */
export function getFirestore(): Firestore {
  const app = getAdminApp();
  const db = getAdminFirestore(app);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // ignore if settings already configured
  }
  return db;
}

/**
 * Returns the Firebase Admin Auth service instance
 */
export function getAdminAuth(): Auth {
  return getAdminAuthInstance(getAdminApp());
}

