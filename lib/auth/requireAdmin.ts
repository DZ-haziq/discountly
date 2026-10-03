import { cookies } from 'next/headers';
import { getAdminAuth } from '../firebase/admin';

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || '__admin_session';

// Authorized Firebase UIDs — env-only in production
const AUTHORIZED_UIDS = new Set(
  (process.env.ADMIN_UIDS || '').split(',').map(u => u.trim()).filter(Boolean)
);

// Admin emails — env-only in production
const DEFAULT_ADMIN_EMAILS: string[] = [];

export interface AdminAuthResult {
  isAuthenticated: boolean;
  email?: string;
  uid?: string;
  error?: string;
}

export async function requireAdmin(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return { isAuthenticated: false, error: 'No session.' };
  }

  // Dev fallback sessions — only permitted in local development
  if (sessionCookie.startsWith('dev_session_')) {
    if (process.env.NODE_ENV === 'production') {
      return { isAuthenticated: false, error: 'Invalid session.' };
    }
    return { isAuthenticated: true, email: 'admin@discountly.com', uid: 'dev-local' };
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    // No Admin SDK — accept dev sessions from allowlisted emails stored in cookie prefix
    return { isAuthenticated: false, error: 'Firebase Admin not configured. Add service account env vars.' };
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, false);

    // Check by UID first
    if (decoded.uid && AUTHORIZED_UIDS.has(decoded.uid)) {
      return { isAuthenticated: true, email: decoded.email, uid: decoded.uid };
    }

    // Fallback: check email allowlist
    const allowlist = Array.from(new Set([
      ...DEFAULT_ADMIN_EMAILS,
      ...(process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    ]));
    const userEmail = (decoded.email || '').toLowerCase();
    if (allowlist.length > 0 && allowlist.includes(userEmail)) {
      return { isAuthenticated: true, email: decoded.email, uid: decoded.uid };
    }

    return { isAuthenticated: false, error: 'Account not authorized.' };
  } catch (err: unknown) {
    return { isAuthenticated: false, error: `Session invalid: ${(err as Error).message}` };
  }
}

