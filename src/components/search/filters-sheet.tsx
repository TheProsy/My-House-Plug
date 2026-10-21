"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { countActiveFilters } from "@/features/accommodation/search-params";
import type { CampusOption } from "@/features/accommodation/queries";
import type { SearchParams } from "@/schemas/search";
import { SearchFilters } from "@/components/search/search-filters";

interface FiltersSheetProps {
  campuses: CampusOption[];
  params: SearchParams;
}

export function FiltersSheet({ campuses, params }: FiltersSheetProps) {
  const activeCount = countActiveFilters(params);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" className="lg:hidden">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-brand-700 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent aria-label="Filter homes">
        <SearchFilters campuses={campuses} params={params} idPrefix="sheet" />
      </SheetContent>
    </Sheet>
  );
}
