'use client';

import { useState } from 'react';
import { Settings, ShieldCheck, Key, CheckCircle2, XCircle } from 'lucide-react';
import { updateSettingsAction } from '@/app/admin/actions';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('Discountly');
  const [siteUrl, setSiteUrl] = useState('https://discountly.com');
  const [minWords, setMinWords] = useState(150);
  const [adminEmails, setAdminEmails] = useState('admin@discountly.com');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateSettingsAction({
        siteName,
        siteUrl,
        minWords: Number(minWords),
        adminEmails: adminEmails.split(',').map(e => e.trim())
      });
      setMessage('Site settings updated successfully.');
    } catch {
      setMessage('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  }

  // Simulated API Key presence check (never reveal raw keys)
  const apiStatus = [
    { name: 'Firebase Admin SDK', configured: true, note: 'Server Firestore access & session signing' },
    { name: 'Google Web Risk API', configured: false, note: 'Domain malware and social engineering scanning' },
    { name: 'Google Knowledge Graph API', configured: false, note: 'Entity metadata and brand description lookup' },
    { name: 'IndexNow API', configured: false, note: 'Instant notification for Bing and Yandex crawlers' },
    { name: 'Google Search Console API', configured: false, note: 'Search analytics and URL inspection queries' }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text)]">
          System & Integration Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Configure site parameters, editorial quality thresholds, and inspect API integration health.
        </p>
      </div>

      {message && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)] border-b border-[var(--border)] pb-2">
          General Site Parameters
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Public Canonical URL
              </label>
              <input
                type="url"
                value={siteUrl}
                onChange={e => setSiteUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Minimum Human Word Count Threshold
              </label>
              <input
                type="number"
                value={minWords}
                onChange={e => setMinWords(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
              />
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                Stores below this threshold are automatically marked noindex.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Admin Email Allowlist (comma-separated)
              </label>
              <input
                type="text"
                value={adminEmails}
                onChange={e => setAdminEmails(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-[var(--border)] bg-white text-[var(--text)]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-[var(--black)] text-white text-xs font-medium hover:bg-[var(--charcoal)]"
            >
              {saving ? 'Saving...' : 'Save Site Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* API Key Health & Status */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <Key className="w-4 h-4 text-[var(--text)]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text)]">
            External API Health (Status Only — Secrets Are Never Exposed)
          </h2>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {apiStatus.map(api => (
            <div key={api.name} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-semibold text-[var(--text)]">{api.name}</span>
                <p className="text-[var(--text-muted)] text-[11px] mt-0.5">{api.note}</p>
              </div>

              <div>
                {api.configured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-black text-white text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium border border-[var(--border)] bg-[var(--off-white)] text-[var(--text-muted)] text-[11px]">
                    <XCircle className="w-3 h-3" />
                    <span>Optional (Unset)</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
