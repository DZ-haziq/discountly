import { assertAdminPage } from '@/lib/auth/requireAdmin';
import Link from 'next/link';
import FirebaseSeedButton from '@/components/admin/FirebaseSeedButton';
import { Database, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default async function AdminSeedPage() {
  await assertAdminPage();

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Dashboard</span>
      </Link>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--black)] text-white flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">
              Firebase Seeder
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Write initial categories and stores to Firestore via the Admin SDK.
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[var(--text)]">
          Click the button below to push the initial dataset directly into Firestore using the server-side Admin SDK.
          This does not require opening Firestore rules — it runs as the service account.
        </p>

        <div className="pt-2">
          <FirebaseSeedButton
            buttonText="🚀 Push All Data to Firebase Now"
            showLogs={true}
          />
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-2">
          <p className="font-semibold text-[var(--text)]">What will be created in Firebase:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Categories</strong>: Electronics &amp; Tech, Home &amp; Kitchen, Outdoor &amp; Gear, Software &amp; Tools</li>
            <li><strong>Stores</strong>: Anker Direct, Fellow Products, Matador Equipment (with full verified reviews, check dates, and policies)</li>
            <li><strong>StoresPrivate</strong>: Affiliate links and networks (isolated security collection)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
