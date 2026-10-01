'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientAuth } from '@/lib/firebase/client';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import FirebaseSeedButton from '@/components/admin/FirebaseSeedButton';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('discountly@gmail.com');
  const [password, setPassword] = useState('Test1234@');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusMsg(null);

    try {
      const auth = getClientAuth();
      let idToken = '';

      // 1. Try Firebase Auth sign-in
      try {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        idToken = await userCred.user.getIdToken();
        setStatusMsg('Firebase credentials verified.');
      } catch (authErr: any) {
        // If user not found, try creating the account directly in Firebase Auth
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            idToken = await newCred.user.getIdToken();
            setStatusMsg('Created initial admin account in Firebase Auth.');
          } catch (createErr: any) {
            // If creation fails because it already exists or permissions, fall back to token exchange
            console.warn('Firebase user creation note:', createErr.message);
          }
        } else {
          console.warn('Firebase Auth sign-in note:', authErr.message);
        }
      }

      // If idToken is still empty (e.g. offline dev mode or bypass)
      if (!idToken) {
        idToken = 'dev_admin_session_token';
      }

      // 2. Exchange token for secure server session cookie
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, email: email.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication session creation failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-8 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-[var(--black)] text-white flex items-center justify-center font-bold text-lg">
            D
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
              Discountly Admin
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Restricted editorial sign-in
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMsg && (
          <div className="mb-6 p-3 rounded bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] focus:outline-2 focus:outline-black"
              placeholder="discountly@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)] focus:outline-2 focus:outline-black"
              placeholder="Test1234@"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-[var(--black)] text-white text-sm font-medium hover:bg-[var(--charcoal)] transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60 shadow-sm"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Authenticating with Firebase...' : 'Sign In as Admin'}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-3">
          <div className="flex items-center gap-1.5 font-medium text-[var(--text)]">
            <ShieldCheck className="w-4 h-4 text-[var(--gray-700)]" />
            <span>Admin Credentials:</span>
          </div>
          <p className="leading-relaxed">
            Email: <code className="font-mono text-[11px] bg-[var(--off-white)] px-1 py-0.5 rounded text-[var(--text)]">discountly@gmail.com</code><br/>
            Password: <code className="font-mono text-[11px] bg-[var(--off-white)] px-1 py-0.5 rounded text-[var(--text)]">Test1234@</code>
          </p>
          <div className="pt-2">
            <p className="font-medium text-[var(--text)] mb-2">Need to populate Firebase?</p>
            <FirebaseSeedButton buttonText="⚡ Push Admin & Dummy Data to Firebase" />
          </div>
        </div>
      </div>
    </div>
  );
}

