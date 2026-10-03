import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/requireAdmin';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const adminAuth = getAdminAuth();

    // Verify the ID token — any valid Firebase Auth user is allowed
    await adminAuth.verifyIdToken(idToken);

    // Create a server-managed session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS_MS,
    });

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
    const message = (err as Error).message || 'Authentication failed';
    console.error('[session/route] Error:', message);
    const status = message.includes('Missing env var') ? 500 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
