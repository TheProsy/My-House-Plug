"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-danger-50 text-danger-600 shadow-e1">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Something broke on our side
        </h1>
        <p className="text-sm leading-relaxed text-ink-500">
          The page failed to load. Retrying usually fixes it. If it keeps
          happening, contact support with what you were doing.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
