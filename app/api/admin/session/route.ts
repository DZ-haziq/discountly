import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/requireAdmin';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

// Admin identity comes from env vars only — no hardcoded values.
const AUTHORIZED_UIDS = new Set(
  (process.env.ADMIN_UIDS || '').split(',').map(u => u.trim()).filter(Boolean)
);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const { idToken, email } = await req.json();
    if (!idToken) return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });

    const adminAuth = getAdminAuth();

    // Admin SDK not available
    if (!adminAuth) {
      if (process.env.NODE_ENV === 'production') {
        // In production this is always a configuration error — never silently grant access
        console.error('[Firebase Admin] getAdminAuth() returned null — check FIREBASE_* env vars on Vercel.');
        return NextResponse.json(
          { error: 'Firebase Admin not configured on server. Check FIREBASE_* environment variables in Vercel.' },
          { status: 500 }
        );
      }

      // Local dev only: grant a short-lived dev session if email is in the allowlist
      const userEmail = (email || '').trim().toLowerCase();
      if (ADMIN_EMAILS.length === 0 || !ADMIN_EMAILS.includes(userEmail)) {
        return NextResponse.json({ error: 'Email not in ADMIN_EMAILS env var.' }, { status: 403 });
      }
      const devRes = NextResponse.json({ success: true });
      devRes.cookies.set(SESSION_COOKIE_NAME, `dev_session_${Date.now()}`, {
        maxAge: FIVE_DAYS_MS / 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
      return devRes;
    }

    // Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Check UID or email authorization
    const isAuthorizedUid = decoded.uid && AUTHORIZED_UIDS.has(decoded.uid);
    const isAuthorizedEmail = decoded.email && ADMIN_EMAILS.includes(decoded.email.toLowerCase());

    if (!isAuthorizedUid && !isAuthorizedEmail) {
      return NextResponse.json(
        { error: 'This Firebase account is not authorized for admin access.' },
        { status: 403 }
      );
    }

    // Create a proper Firebase session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS });
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: FIVE_DAYS_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return res;
  } catch (err: unknown) {
    console.error('Session error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Authentication failed' }, { status: 500 });
  }
}
