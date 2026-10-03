import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  const result: Record<string, unknown> = {
    env: {
      FIREBASE_PROJECT_ID: Boolean(projectId),
      FIREBASE_CLIENT_EMAIL: Boolean(clientEmail),
      FIREBASE_PRIVATE_KEY: Boolean(privateKey),
      privateKeyLength: privateKey ? privateKey.length : 0,
      privateKeyHasBeginLine: privateKey
        ? privateKey.includes('BEGIN PRIVATE KEY')
        : false,
    },
    firestore: null as unknown,
  };

  try {
    // Import lazily to avoid initializing admin at module load time
    const { getFirestore } = await import('@/lib/firebase/admin');
    const db = getFirestore();
    const snapshot = await db.collection('stores').limit(1).get();
    result.firestore = { ok: true, count: snapshot.size };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    result.firestore = {
      ok: false,
      code: error.code || null,
      message: error.message || String(err),
    };
  }

  return NextResponse.json(result);
}
