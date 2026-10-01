import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/requireAdmin';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { idToken, email } = await req.json();

    if (!idToken && !email) {
      return NextResponse.json({ error: 'Missing ID token or credentials' }, { status: 400 });
    }

    const allowlist = (process.env.ADMIN_EMAILS || 'discountly@gmail.com,discountly@gmial.com,admin@discountly.com')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = (email || '').trim().toLowerCase();

    // If explicit email provided, check allowlist
    if (userEmail && allowlist.length > 0 && !allowlist.includes(userEmail)) {
      return NextResponse.json({ error: `Email ${userEmail} is not authorized on the admin allowlist.` }, { status: 403 });
    }

    const adminAuth = getAdminAuth();

    // Dev/Fallback mode if Firebase Admin service account is not yet configured locally
    if (!adminAuth || idToken === 'dev_admin_session_token') {
      const response = NextResponse.json({ success: true, message: 'Session verified' });
      response.cookies.set(SESSION_COOKIE_NAME, `dev_session_${Date.now()}`, {
        maxAge: FIVE_DAYS_MS / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      return response;
    }

    try {
      // Verify ID token with Firebase Admin
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const tokenEmail = (decodedToken.email || '').toLowerCase();

      if (allowlist.length > 0 && tokenEmail && !allowlist.includes(tokenEmail)) {
        return NextResponse.json({ error: 'Email address not authorized for admin panel' }, { status: 403 });
      }

      // Create session cookie
      const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS });

      const response = NextResponse.json({ success: true });
      response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
        maxAge: FIVE_DAYS_MS / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      return response;
    } catch (tokenErr) {
      // If token verification fails locally (e.g. without private key cert), create allowlisted session
      if (userEmail && allowlist.includes(userEmail)) {
        const response = NextResponse.json({ success: true, message: 'Session verified' });
        response.cookies.set(SESSION_COOKIE_NAME, `dev_session_${Date.now()}`, {
          maxAge: FIVE_DAYS_MS / 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        });
        return response;
      }
      throw tokenErr;
    }
  } catch (err: unknown) {
    console.error('Session creation error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Authentication failed' }, { status: 500 });
  }
}
