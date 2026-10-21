import { AlertTriangle, Info, Receipt, RotateCcw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { COST_RECURRENCE_LABELS } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";
import type { Tables } from "@/types/database";

interface CostBreakdownProps {
  costs: Tables<"property_costs">[];
  rentAmount: number | null;
  rentPeriodLabel: string;
}

export function CostBreakdown({
  costs,
  rentAmount,
  rentPeriodLabel,
}: CostBreakdownProps) {
  const known = costs.filter(
    (cost) => cost.is_known && cost.amount !== null,
  );
  const unknownMandatory = costs.filter(
    (cost) => !cost.is_known && cost.is_mandatory,
  );

  const oneTimeMandatory = known.filter(
    (cost) => cost.is_mandatory && cost.recurrence === "one_time",
  );
  const recurringMandatory = known.filter(
    (cost) => cost.is_mandatory && cost.recurrence !== "one_time",
  );
  const optional = known.filter((cost) => !cost.is_mandatory);

  const refundableTotal = oneTimeMandatory
    .filter((cost) => cost.is_refundable)
    .reduce((sum, cost) => sum + Number(cost.amount), 0);

  const upfrontTotal =
    (rentAmount ?? 0) +
    oneTimeMandatory.reduce((sum, cost) => sum + Number(cost.amount), 0);

  const incomplete = unknownMandatory.length > 0 || rentAmount === null;

  return (
    <section
      aria-labelledby="cost-breakdown-heading"
      className="rounded-2xl border border-line-soft bg-surface-2 shadow-e2"
    >
      <header className="flex items-center gap-2 border-b border-line-soft px-5 py-4">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
          <Receipt className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2
            id="cost-breakdown-heading"
            className="text-base font-semibold text-ink-900"
          >
            What it costs to move in
          </h2>
          <p className="text-xs text-ink-400">
            Based on costs the provider has disclosed
          </p>
        </div>
      </header>

      <div className="space-y-5 px-5 py-4">
        <div className="space-y-2">
          <Row
            label="Rent"
            detail={rentPeriodLabel}
            value={formatNaira(rentAmount)}
            emphasis
          />
          {oneTimeMandatory.map((cost) => (
            <Row
              key={cost.id}
              label={cost.label}
              detail={COST_RECURRENCE_LABELS[cost.recurrence]}
              value={formatNaira(Number(cost.amount))}
              refundable={cost.is_refundable}
              notes={cost.notes}
            />
          ))}
          {unknownMandatory
            .filter((cost) => cost.recurrence === "one_time")
            .map((cost) => (
              <Row
                key={cost.id}
                label={cost.label}
                detail="Amount not yet confirmed"
                value="Unknown"
                unknown
                notes={cost.notes}
              />
            ))}
        </div>

        {recurringMandatory.length > 0 && (
          <div className="space-y-2 border-t border-line-soft pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Recurring charges
            </p>
            {recurringMandatory.map((cost) => (
              <Row
                key={cost.id}
                label={cost.label}
                detail={COST_RECURRENCE_LABELS[cost.recurrence]}
                value={formatNaira(Number(cost.amount))}
                notes={cost.notes}
              />
            ))}
            {unknownMandatory
              .filter((cost) => cost.recurrence !== "one_time")
              .map((cost) => (
                <Row
                  key={cost.id}
                  label={cost.label}
                  detail={`${COST_RECURRENCE_LABELS[cost.recurrence]} · amount not confirmed`}
                  value="Unknown"
                  unknown
                  notes={cost.notes}
                />
              ))}
          </div>
        )}

        {optional.length > 0 && (
          <div className="space-y-2 border-t border-line-soft pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Optional
            </p>
            {optional.map((cost) => (
              <Row
                key={cost.id}
                label={cost.label}
                detail="Optional"
                value={formatNaira(Number(cost.amount))}
                notes={cost.notes}
              />
            ))}
          </div>
        )}

        <div className="rounded-xl bg-surface-1 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink-700">
              Known one-time move-in total
            </span>
            <span className="text-lg font-semibold tracking-tight text-ink-900">
              {formatNaira(upfrontTotal)}
            </span>
          </div>
          {refundableTotal > 0 && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Includes {formatNaira(refundableTotal)} refundable deposit
            </p>
          )}
        </div>

        {incomplete && (
          <Alert variant="warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              This total is incomplete: the provider has not confirmed every
              mandatory cost. Ask before paying anything.
            </span>
          </Alert>
        )}

        <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-400">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Amounts are supplied by the provider. MY AGENT does not collect rent
          or hold deposits in this version of the platform.
        </p>
      </div>
    </section>
  );
}

function Row({
  label,
  detail,
  value,
  refundable,
  unknown,
  notes,
  emphasis,
}: {
  label: string;
  detail?: string;
  value: string;
  refundable?: boolean;
  unknown?: boolean;
  notes?: string | null;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p
          className={
            emphasis
              ? "text-sm font-semibold text-ink-900"
              : "text-sm text-ink-700"
          }
        >
          {label}
          {refundable && (
            <Badge variant="brand" className="ml-2 align-middle">
              Refundable
            </Badge>
          )}
        </p>
        {detail && <p className="text-xs text-ink-400">{detail}</p>}
        {notes && <p className="mt-0.5 text-xs text-ink-400">{notes}</p>}
      </div>
      <span
        className={
          unknown
            ? "shrink-0 text-sm font-medium text-warning-700"
            : emphasis
              ? "shrink-0 text-sm font-semibold text-ink-900"
              : "shrink-0 text-sm font-medium text-ink-900"
        }
      >
        {value}
      </span>
    </div>
  );
}
