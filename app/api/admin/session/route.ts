import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/requireAdmin';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

const DEFAULT_ADMIN_EMAILS = [
  'discountly@gmail.com',
  'discountly@haziq.com',
  'admin@discountly.com'
];

const AUTHORIZED_UIDS = new Set([
  'NLaa68tVdLORIhObrrQ32NKKjgu2',
  ...(process.env.ADMIN_UIDS || '').split(',').map(u => u.trim()).filter(Boolean)
]);

const ADMIN_EMAILS = Array.from(new Set([
  ...DEFAULT_ADMIN_EMAILS,
  ...(process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
]));

export async function POST(req: NextRequest) {
  try {
    const { idToken, email } = await req.json();
    if (!idToken) return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });

    const adminAuth = getAdminAuth();

    // No Admin SDK (local dev without service account) — grant session if email is in allowlist
    if (!adminAuth) {
      const userEmail = (email || '').trim().toLowerCase();
      if (!ADMIN_EMAILS.includes(userEmail)) {
        return NextResponse.json({ error: 'Email not authorized.' }, { status: 403 });
      }
      const res = NextResponse.json({ success: true });
      res.cookies.set(SESSION_COOKIE_NAME, `dev_session_${Date.now()}`, {
        maxAge: FIVE_DAYS_MS / 1000, httpOnly: true,
        secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/'
      });
      return res;
    }

    // Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Check UID or email authorization
    const isAuthorizedUid = decoded.uid && AUTHORIZED_UIDS.has(decoded.uid);
    const isAuthorizedEmail = decoded.email && ADMIN_EMAILS.includes(decoded.email.toLowerCase());

    if (!isAuthorizedUid && !isAuthorizedEmail) {
      return NextResponse.json({ error: 'This Firebase account is not authorized for admin access.' }, { status: 403 });
    }

    // Create a proper Firebase session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS });
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: FIVE_DAYS_MS / 1000, httpOnly: true,
      secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/'
    });
    return res;
  } catch (err: unknown) {
    console.error('Session error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Authentication failed' }, { status: 500 });
  }
}
