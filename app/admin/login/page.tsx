'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientAuth } from '@/lib/firebase/client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const auth = getClientAuth();
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await userCred.user.getIdToken();

      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, email: email.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Use window.location to force full browser reload with newly established cookie
      window.location.href = '/admin';
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const code = errorObj.code || '';
      const msg = errorObj.message || '';

      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        msg.includes('invalid-credential') ||
        msg.includes('wrong-password') ||
        msg.includes('user-not-found') ||
        msg.includes('INVALID_LOGIN_CREDENTIALS')
      ) {
        setError('Invalid email or password.');
      } else if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed') || msg.includes('OPERATION_NOT_ALLOWED')) {
        setError('Email/Password sign-in is disabled in Firebase Console -> Authentication -> Sign-in method.');
      } else if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
        setError('Too many failed login attempts. Please wait a moment and try again.');
      } else if (code === 'auth/invalid-email' || msg.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (msg.includes('not authorized') || msg.includes('allowlist')) {
        setError('This account is not authorized for admin access.');
      } else if (msg.includes('network-request-failed') || msg.includes('ERR_NAME_NOT_RESOLVED') || msg.includes('Failed to fetch')) {
        setError('Network error: Unable to connect to Firebase Auth services (identitytoolkit.googleapis.com). Please check your internet/DNS connection.');
      } else if (msg.includes('invalid-api-key') || msg.includes('api-key') || msg.includes('API_KEY_INVALID')) {
        setError('Firebase API Key configuration error. Please verify your NEXT_PUBLIC_FIREBASE_API_KEY environment variable.');
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-8 shadow-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded bg-[var(--black)] text-white flex items-center justify-center font-bold text-lg">D</div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Discountly Admin</h1>
            <p className="text-xs text-[var(--text-muted)]">Sign in to manage stores</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] focus:outline-2 focus:outline-black"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] focus:outline-2 focus:outline-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-[var(--black)] text-white text-sm font-medium hover:bg-[var(--charcoal)] transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
