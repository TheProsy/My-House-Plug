"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";
import { SORT_OPTIONS, type SortOption } from "@/lib/constants";

export function SortSelect({ value }: { value: SortOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    const next = event.target.value as SortOption;

    if (next === "relevance") {
      params.delete("sort");
    } else {
      params.set("sort", next);
    }
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-500">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={value}
        onChange={handleChange}
        disabled={isPending}
        className="h-10 rounded-md border border-line bg-surface-2 px-3 text-sm font-medium text-ink-800 shadow-e1 disabled:opacity-60"
        aria-label="Sort listings"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
