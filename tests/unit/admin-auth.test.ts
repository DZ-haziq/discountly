import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/admin/session/route';
import { NextRequest } from 'next/server';

// Mock getAdminAuth to avoid needing live Firebase credentials in unit tests
vi.mock('@/lib/firebase/admin', () => ({
  getAdminAuth: () => ({
    verifyIdToken: async (token: string) => {
      if (token === 'valid-token') return { uid: 'user123', email: 'admin@example.com' };
      throw new Error('Firebase ID token has expired or is invalid.');
    },
    createSessionCookie: async (token: string) => {
      if (token === 'valid-token') return 'mock-session-cookie-xyz';
      throw new Error('Failed to create session cookie.');
    },
  }),
}));

describe('Admin Session API Route (/api/admin/session)', () => {
  it('returns 400 when request body is missing or invalid JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/session', {
      method: 'POST',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('JSON');
  });

  it('returns 400 when idToken is missing from request body', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/session', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing or invalid idToken');
  });

  it('returns 401 when idToken verification fails', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/session', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'invalid-token' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('expired or is invalid');
  });

  it('returns 200 and sets session cookie when idToken is valid', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/session', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'valid-token' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(res.headers.get('set-cookie')).toContain('__admin_session=mock-session-cookie-xyz');
  });
});
