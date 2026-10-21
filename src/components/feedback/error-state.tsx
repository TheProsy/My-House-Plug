import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryHref?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this section. Please try again.",
  onRetry,
  retryHref,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger-100 bg-danger-50/50 px-6 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-surface-2 text-danger-600 shadow-e1">
        <AlertTriangle className="size-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-500">
          {description}
        </p>
      </div>
      {(onRetry || retryHref) && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          asChild={!onRetry && Boolean(retryHref)}
        >
          {retryHref ? <a href={retryHref}>Try again</a> : "Try again"}
        </Button>
      )}
    </div>
  );
}
