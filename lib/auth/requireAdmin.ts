import { cookies } from 'next/headers';
import { getAdminAuth } from '../firebase/admin';

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || '__admin_session';

// Authorized Firebase UIDs — hardcoded + env override
const AUTHORIZED_UIDS = new Set([
  'NLaa68tVdLORIhObrrQ32NKKjgu2',
  ...(process.env.ADMIN_UIDS || '').split(',').map(u => u.trim()).filter(Boolean)
]);

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

  // Dev fallback sessions (local dev without Firebase Admin credentials)
  if (sessionCookie.startsWith('dev_session_')) {
    return { isAuthenticated: true, email: 'admin@discountly.com', uid: 'NLaa68tVdLORIhObrrQ32NKKjgu2' };
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    // No Admin SDK — accept dev sessions from allowlisted emails stored in cookie prefix
    return { isAuthenticated: false, error: 'Firebase Admin not configured. Add service account env vars.' };
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Check by UID first
    if (decoded.uid && AUTHORIZED_UIDS.has(decoded.uid)) {
      return { isAuthenticated: true, email: decoded.email, uid: decoded.uid };
    }

    // Fallback: check email allowlist
    const allowlist = (process.env.ADMIN_EMAILS || '')
      .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const userEmail = (decoded.email || '').toLowerCase();
    if (allowlist.length > 0 && allowlist.includes(userEmail)) {
      return { isAuthenticated: true, email: decoded.email, uid: decoded.uid };
    }

    return { isAuthenticated: false, error: 'Account not authorized.' };
  } catch (err: unknown) {
    return { isAuthenticated: false, error: `Session invalid: ${(err as Error).message}` };
  }
}

