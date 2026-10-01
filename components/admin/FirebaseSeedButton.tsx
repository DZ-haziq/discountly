'use client';

import { useState } from 'react';
import { pushSeedDataToFirestore } from '@/lib/firebase/seed';
import { Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  className?: string;
  buttonText?: string;
  showLogs?: boolean;
}

export default function FirebaseSeedButton({
  className = '',
  buttonText = 'Sync / Seed Initial Data to Firebase',
  showLogs = true
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSeed() {
    setLoading(true);
    setLogs([]);
    setResult(null);

    const res = await pushSeedDataToFirestore((msg) => {
      setLogs((prev) => [...prev, msg]);
    });

    setResult(res);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        type="button"
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[var(--black)] text-white text-xs sm:text-sm font-medium hover:bg-[var(--charcoal)] transition-all cursor-pointer disabled:opacity-60 shadow-sm"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Database className="w-4 h-4" />
        )}
        <span>{loading ? 'Writing to Firebase...' : buttonText}</span>
      </button>

      {result && (
        <div
          className={`p-3 rounded text-xs flex items-start gap-2 ${
            result.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          )}
          <div>
            <p className="font-semibold">{result.message}</p>
          </div>
        </div>
      )}

      {showLogs && logs.length > 0 && (
        <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-3 rounded max-h-48 overflow-y-auto space-y-1">
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}
