import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminAuth } from '../firebase/admin';

export const SESSION_COOKIE_NAME = '__admin_session';

export interface AdminAuthResult {
  isAuthenticated: boolean;
  email?: string;
  uid?: string;
  error?: string;
}

/**
 * Verifies the session cookie with Firebase Admin.
 * Any user registered in Firebase Authentication is treated as admin.
 * No allowlists, no hardcoded UIDs.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return { isAuthenticated: false, error: 'No session.' };
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { isAuthenticated: true, email: decoded.email, uid: decoded.uid };
  } catch (err: unknown) {
    return { isAuthenticated: false, error: `Session invalid: ${(err as Error).message}` };
  }
}

/**
 * Helper for Server Component pages: redirects to /admin/login if not authenticated.
 * Usage: await assertAdminPage();
 */
export async function assertAdminPage(): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.isAuthenticated) {
    redirect('/admin/login');
  }
}
