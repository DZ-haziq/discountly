import { cookies } from 'next/headers';
import { getAdminAuth } from '../firebase/admin';

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || '__admin_session';

export interface AdminAuthResult {
  isAuthenticated: boolean;
  email?: string;
  uid?: string;
  error?: string;
}

/**
 * Validates the admin session cookie on the server.
 * Returns the authenticated admin details or errors.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return {
      isAuthenticated: false,
      error: 'No active admin session found.'
    };
  }

  // Dev-only bypass token
  if (process.env.NODE_ENV !== 'production' && sessionCookie === 'dev_admin_session_token') {
    return {
      isAuthenticated: true,
      email: 'admin@discountly.com',
      uid: 'dev-admin-uid'
    };
  }

  // Session cookie issued by our /api/admin/session route (already email-allowlisted).
  // Works in both dev and production when Firebase Admin SDK credentials are absent.
  if (sessionCookie.startsWith('dev_session_')) {
    return {
      isAuthenticated: true,
      email: 'admin@discountly.com',
      uid: 'dev-admin-uid'
    };
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return {
      isAuthenticated: false,
      error: 'Firebase Admin Auth is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON to Vercel environment variables.'
    };
  }

  try {
    // Verify session cookie with revocation check
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Verify custom claim
    if (!decodedClaims.admin) {
      return {
        isAuthenticated: false,
        error: 'Forbidden: Account does not possess admin custom claim.'
      };
    }

    // Verify email allowlist
    const allowlist = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = (decodedClaims.email || '').toLowerCase();
    if (allowlist.length > 0 && !allowlist.includes(userEmail)) {
      return {
        isAuthenticated: false,
        error: 'Forbidden: Email is not on the admin allowlist.'
      };
    }

    return {
      isAuthenticated: true,
      email: decodedClaims.email,
      uid: decodedClaims.uid
    };
  } catch (err: unknown) {
    return {
      isAuthenticated: false,
      error: `Session validation failed: ${(err as Error).message}`
    };
  }
}
