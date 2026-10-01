import Link from 'next/link';
import FirebaseSeedButton from '@/components/admin/FirebaseSeedButton';
import { Database, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminSeedPage() {
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
              Direct Firebase Seeder
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Write verified initial categories, stores, private affiliate data, and admin to Firebase
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[var(--text)]">
          Click the button below to push the entire initial dataset (Anker, Fellow Products, Matador, Categories, and Admin Authentication account) directly into your live Firebase Cloud Firestore without requiring private keys or manual console editing.
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
            <li><strong>Categories</strong>: Electronics & Tech, Home & Kitchen, Outdoor & Gear, Software & Tools</li>
            <li><strong>Stores</strong>: Anker Direct, Fellow Products, Matador Equipment (with full verified reviews, check dates, and policies)</li>
            <li><strong>StoresPrivate</strong>: Affiliate links and networks (isolated security collection)</li>
            <li><strong>Firebase Auth</strong>: <code className="font-mono text-[11px] bg-[var(--off-white)] px-1 py-0.5 rounded">discountly@gmail.com</code> (Password: <code className="font-mono text-[11px] bg-[var(--off-white)] px-1 py-0.5 rounded">Test1234@</code>)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
