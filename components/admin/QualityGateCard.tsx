import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GateEvaluationResult } from '@/lib/seo/indexability';

interface QualityGateCardProps {
  gateResult: GateEvaluationResult;
  minWords?: number;
}

export function QualityGateCard({ gateResult, minWords = 150 }: QualityGateCardProps) {
  const { indexable, failures, wordCount } = gateResult;
  const wordProgress = Math.min(100, Math.round((wordCount / minWords) * 100));

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--black)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
            Quality Gate & Indexability
          </h3>
        </div>

        {indexable ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black text-white">
            <CheckCircle2 className="w-3 h-3" />
            Indexable
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-dashed border-black text-black">
            <AlertTriangle className="w-3 h-3" />
            noindex (Gate Failed)
          </span>
        )}
      </div>

      {/* Word Count Metric */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-medium text-[var(--text)]">Original Human Content</span>
          <span className={wordCount >= minWords ? 'font-medium text-black' : 'text-gray-500'}>
            {wordCount} / {minWords} words ({wordProgress}%)
          </span>
        </div>
        <div className="w-full bg-[var(--off-white)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className={`h-full transition-all ${
              wordCount >= minWords ? 'bg-[var(--black)]' : 'bg-[var(--gray-500)]'
            }`}
            style={{ width: `${wordProgress}%` }}
          />
        </div>
      </div>

      {/* Rule Failures Breakdown */}
      {failures.length > 0 ? (
        <div className="bg-[var(--off-white)] border border-[var(--border)] rounded p-3 text-xs space-y-1.5">
          <span className="font-medium text-[var(--text)] block mb-1">
            Requirements to reach Indexable status:
          </span>
          <ul className="space-y-1 text-[var(--text-muted)]">
            {failures.map((fail, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-[var(--gray-700)] shrink-0 mt-0.5" />
                <span>{fail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-[var(--off-white)] border border-[var(--border)] rounded p-3 text-xs text-[var(--text)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--black)] shrink-0" />
          <span>This listing meets all 9 quality rules and will be included in the public sitemap.xml.</span>
        </div>
      )}
    </div>
  );
}
