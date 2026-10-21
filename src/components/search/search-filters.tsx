import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { CampusOption } from "@/features/accommodation/queries";
import type { SearchParams } from "@/schemas/search";

interface SearchFiltersProps {
  campuses: CampusOption[];
  params: SearchParams;
  idPrefix: string;
  showActions?: boolean;
}

export function SearchFilters({
  campuses,
  params,
  idPrefix,
  showActions = true,
}: SearchFiltersProps) {
  return (
    <form action="/search" method="get" className="space-y-5">
      <input type="hidden" name="sort" value={params.sort} />

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-q`}
          className="text-xs font-semibold uppercase tracking-wider text-ink-400"
        >
          Keyword
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            id={`${idPrefix}-q`}
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Area, landmark, or feature"
            className="h-11 w-full rounded-md border border-line bg-surface-2 pl-9 pr-3 text-sm text-ink-900 shadow-e1 placeholder:text-ink-400"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-campus`}
          className="text-xs font-semibold uppercase tracking-wider text-ink-400"
        >
          Campus
        </label>
        <Select id={`${idPrefix}-campus`} name="campus" defaultValue={params.campus ?? ""}>
          <option value="">All campuses</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-neighbourhood`}
          className="text-xs font-semibold uppercase tracking-wider text-ink-400"
        >
          Neighbourhood
        </label>
        <Select
          id={`${idPrefix}-neighbourhood`}
          name="neighbourhood"
          defaultValue={params.neighbourhood ?? ""}
        >
          <option value="">Any neighbourhood</option>
          {campuses.map((campus) => (
            <optgroup key={campus.id} label={campus.name}>
              {campus.neighbourhoods.map((neighbourhood) => (
                <option key={neighbourhood.id} value={neighbourhood.id}>
                  {neighbourhood.name}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-type`}
          className="text-xs font-semibold uppercase tracking-wider text-ink-400"
        >
          Type
        </label>
        <Select id={`${idPrefix}-type`} name="type" defaultValue={params.type ?? ""}>
          <option value="">Any type</option>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-semibold uppercase tracking-wider text-ink-400">
          Rent budget (₦)
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="min"
            inputMode="numeric"
            min={0}
            step={10000}
            defaultValue={params.min ?? ""}
            placeholder="Min"
            aria-label="Minimum rent budget"
            className="h-11 w-full rounded-md border border-line bg-surface-2 px-3 text-sm text-ink-900 shadow-e1 placeholder:text-ink-400"
          />
          <span className="text-ink-400">–</span>
          <input
            type="number"
            name="max"
            inputMode="numeric"
            min={0}
            step={10000}
            defaultValue={params.max ?? ""}
            placeholder="Max"
            aria-label="Maximum rent budget"
            className="h-11 w-full rounded-md border border-line bg-surface-2 px-3 text-sm text-ink-900 shadow-e1 placeholder:text-ink-400"
          />
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-furnished`}
          className="text-xs font-semibold uppercase tracking-wider text-ink-400"
        >
          Furnishing
        </label>
        <Select
          id={`${idPrefix}-furnished`}
          name="furnished"
          defaultValue={params.furnished ?? ""}
        >
          <option value="">Any</option>
          <option value="yes">Furnished</option>
          <option value="no">Unfurnished</option>
        </Select>
      </div>

      {showActions && (
        <div className="flex flex-col gap-2 pt-1">
          <Button type="submit">Apply filters</Button>
          <Button asChild variant="ghost" size="sm">
            <a href="/search">Clear all</a>
          </Button>
        </div>
      )}
    </form>
  );
}
