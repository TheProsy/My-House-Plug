import Link from "next/link";
import { ArrowRight, MapPin, Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingPanel } from "@/components/spatial/surface";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { CampusOption } from "@/features/accommodation/queries";
import type { PropertyType } from "@/types/database";

const featuredTypes: PropertyType[] = [
  "self_contain",
  "single_room",
  "shared_room",
  "mini_flat",
  "one_bedroom",
  "hostel_space",
];

export function HeroSearch({ campuses }: { campuses: CampusOption[] }) {
  return (
    <FloatingPanel className="p-3 sm:p-4">
      <form
        action="/search"
        method="get"
        className="grid gap-2.5 md:grid-cols-[1.3fr_1fr_1.1fr_auto] md:items-end"
        role="search"
        aria-label="Search accommodation"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="hero-campus"
            className="flex items-center gap-1.5 px-1 text-xs font-medium text-ink-500"
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            Campus or neighbourhood
          </label>
          <select
            id="hero-campus"
            name="campus"
            className="h-12 w-full appearance-none rounded-xl border border-line bg-surface-2 px-3.5 text-sm text-ink-900 shadow-e1"
            defaultValue=""
          >
            <option value="">All pilot campuses</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name} — {campus.universityName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="hero-type"
            className="flex items-center gap-1.5 px-1 text-xs font-medium text-ink-500"
          >
            <Search className="size-3.5" aria-hidden="true" />
            Accommodation type
          </label>
          <select
            id="hero-type"
            name="type"
            className="h-12 w-full appearance-none rounded-xl border border-line bg-surface-2 px-3.5 text-sm text-ink-900 shadow-e1"
            defaultValue=""
          >
            <option value="">Any type</option>
            {featuredTypes.map((type) => (
              <option key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <span className="flex items-center gap-1.5 px-1 text-xs font-medium text-ink-500">
            <Wallet className="size-3.5" aria-hidden="true" />
            Budget per year (₦)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="min"
              inputMode="numeric"
              min={0}
              step={10000}
              placeholder="Min"
              aria-label="Minimum budget per year"
              className="h-12 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink-900 shadow-e1 placeholder:text-ink-400"
            />
            <span className="text-ink-400">–</span>
            <input
              type="number"
              name="max"
              inputMode="numeric"
              min={0}
              step={10000}
              placeholder="Max"
              aria-label="Maximum budget per year"
              className="h-12 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink-900 shadow-e1 placeholder:text-ink-400"
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="h-12 rounded-xl px-6">
          Find a house
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft px-1 pt-3 text-xs text-ink-500">
        <span className="font-medium text-ink-600">Quick starts:</span>
        <Link
          href="/roommates"
          className="rounded-full border border-line bg-surface-2 px-3 py-1.5 font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-800"
        >
          Find a roommate
        </Link>
        <Link
          href="/list-property"
          className="rounded-full border border-line bg-surface-2 px-3 py-1.5 font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-800"
        >
          List a property
        </Link>
        <Link
          href="/search?sort=newest"
          className="rounded-full border border-line bg-surface-2 px-3 py-1.5 font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-800"
        >
          Explore near my campus
        </Link>
      </div>
    </FloatingPanel>
  );
}
