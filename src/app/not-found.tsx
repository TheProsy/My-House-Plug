import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/navigation/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-brand-700 shadow-e2">
        <Compass className="size-6" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          This page could not be found
        </h1>
        <p className="text-sm leading-relaxed text-ink-500">
          The link may be broken, or the listing may have been removed or
          paused by its provider.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/search">Search homes</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
