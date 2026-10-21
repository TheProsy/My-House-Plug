import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CompatibilityResult,
  FactorResult,
} from "@/features/roommates/compatibility";

const RESULT_STYLES: Record<
  FactorResult,
  { icon: typeof Check; className: string; srLabel: string }
> = {
  match: { icon: Check, className: "text-brand-700", srLabel: "Match" },
  neutral: { icon: Minus, className: "text-ink-400", srLabel: "Neutral" },
  mismatch: { icon: X, className: "text-danger-600", srLabel: "Difference" },
};

export function CompatibilityPanel({ result }: { result: CompatibilityResult }) {
  return (
    <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink-900">Compatibility</h2>
        <span className="text-2xl font-semibold tracking-tight text-brand-800">
          {result.score}%
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-ink-500">
        Based on the living habits and budget you both shared. Flexible or unset
        preferences count as half.
      </p>

      <ul className="mt-4 space-y-3">
        {result.factors.map((factor) => {
          const style = RESULT_STYLES[factor.result];
          const Icon = style.icon;
          return (
            <li key={factor.key} className="flex items-start gap-2.5">
              <Icon
                className={cn("mt-0.5 size-4 shrink-0", style.className)}
                aria-hidden="true"
              />
              <span className="sr-only">{style.srLabel}</span>
              <div className="min-w-0 text-sm">
                <p className="font-medium text-ink-800">{factor.label}</p>
                <p className="text-xs text-ink-500">
                  You: {factor.mineLabel} · Them: {factor.theirsLabel}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
