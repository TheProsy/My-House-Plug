import Link from "next/link";
import { House } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 rounded-md text-ink-900 transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="My House Plug home"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-e2">
        <House className="size-4.5" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight">
          My House Plug
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">
          Find your place
        </span>
      </span>
    </Link>
  );
}
