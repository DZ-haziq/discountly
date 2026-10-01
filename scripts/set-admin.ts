/**
 * Script to grant the custom claim `admin: true` to a specific Firebase Auth UID.
 * 
 * Usage:
 *   npx ts-node scripts/set-admin.ts <UID>
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

async function setAdminClaim(uid: string) {
  if (!uid) {
    console.error('Error: Please provide a target user UID.');
    console.error('Usage: npx ts-node scripts/set-admin.ts <UID>');
    process.exit(1);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Error: Missing Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
    process.exit(1);
  }

  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });

  try {
    await getAuth(app).setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully granted custom claim { admin: true } to UID: ${uid}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to set admin claim:', err);
    process.exit(1);
  }
}

const targetUid = process.argv[2];
setAdminClaim(targetUid);
