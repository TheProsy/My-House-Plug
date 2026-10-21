import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, SearchX, TriangleAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionHeading } from "@/components/spatial/surface";
import { FiltersSheet } from "@/components/search/filters-sheet";
import { SearchFilters } from "@/components/search/search-filters";
import { SortSelect } from "@/components/search/sort-select";
import { PropertyCard } from "@/components/property/property-card";
import {
  buildSearchHref,
  parseSearchParams,
} from "@/features/accommodation/search-params";
import {
  getCampusOptions,
  searchListings,
} from "@/features/accommodation/queries";
import { getSessionUser } from "@/features/authentication/queries";
import { getSavedPropertyIds } from "@/features/saved/queries";

export const metadata: Metadata = {
  title: "Find a home",
  description:
    "Search verified accommodation around Nigerian campuses by campus, neighbourhood, budget, and property type.",
};

const PAGE_SIZE = 12;

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = parseSearchParams(await searchParams);

  const [campuses, user, savedIds, data] = await Promise.all([
    getCampusOptions(),
    getSessionUser(),
    getSavedPropertyIds(),
    searchListings(params, PAGE_SIZE),
  ]);

  const isAuthenticated = Boolean(user);
  const activeCampus = campuses.find((campus) => campus.id === params.campus);
  const hasFilters =
    Boolean(params.q) ||
    Boolean(params.campus) ||
    Boolean(params.neighbourhood) ||
    Boolean(params.type) ||
    params.min !== undefined ||
    params.max !== undefined ||
    Boolean(params.furnished);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Search"
        title={
          activeCampus
            ? `Homes around ${activeCampus.name}`
            : "Homes around your campus"
        }
        description="Filter by what matters, then open a listing to see known costs and what each verification label actually means."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <aside className="hidden lg:sticky lg:top-20 lg:block">
          <div className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1">
            <h2 className="mb-4 text-sm font-semibold text-ink-900">Filters</h2>
            <SearchFilters campuses={campuses} params={params} idPrefix="side" />
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4">
            <div className="flex items-center gap-3">
              <FiltersSheet campuses={campuses} params={params} />
              <p className="text-sm text-ink-500">
                {data.error ? (
                  "Search is temporarily unavailable"
                ) : (
                  <>
                    <span className="font-semibold text-ink-900">
                      {data.total}
                    </span>{" "}
                    {data.total === 1 ? "home" : "homes"}
                    {hasFilters ? " match your filters" : " available"}
                  </>
                )}
              </p>
            </div>
            <Suspense fallback={null}>
              <SortSelect value={params.sort} />
            </Suspense>
          </div>

          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-ink-400">Active:</span>
              {activeCampus && (
                <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-medium text-ink-700">
                  {activeCampus.name}
                </span>
              )}
              {params.type && (
                <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-medium text-ink-700">
                  {params.type.replaceAll("_", " ")}
                </span>
              )}
              {(params.min !== undefined || params.max !== undefined) && (
                <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-medium text-ink-700">
                  Budget filter
                </span>
              )}
              <Link
                href="/search"
                className="font-medium text-brand-700 underline-offset-4 hover:underline"
              >
                Clear all
              </Link>
            </div>
          )}

          {data.error ? (
            <div className="mt-6">
              <Alert variant="danger">
                <TriangleAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">We could not load homes just now.</p>
                  <p className="mt-0.5 text-xs">
                    This is a temporary problem on our side, not an empty
                    result. Try again in a moment.
                  </p>
                  <Link
                    href={buildSearchHref(params)}
                    className="mt-2 inline-block text-xs font-medium underline underline-offset-4"
                  >
                    Try again
                  </Link>
                </div>
              </Alert>
            </div>
          ) : data.results.length > 0 ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.results.map((listing, index) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    saved={savedIds.has(listing.id)}
                    isAuthenticated={isAuthenticated}
                    priority={index < 3}
                  />
                ))}
              </div>

              {data.totalPages > 1 && (
                <nav
                  aria-label="Search results pages"
                  className="mt-8 flex items-center justify-between gap-3 border-t border-line-soft pt-4"
                >
                  {params.page > 1 ? (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={buildSearchHref(params, { page: params.page - 1 })}>
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Previous
                      </Link>
                    </Button>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs font-medium text-ink-500">
                    Page {params.page} of {data.totalPages}
                  </p>
                  {params.page < data.totalPages ? (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={buildSearchHref(params, { page: params.page + 1 })}>
                        Next
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  ) : (
                    <span />
                  )}
                </nav>
              )}
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                icon={<SearchX className="size-6" aria-hidden="true" />}
                title="No homes match those filters"
                description="Try widening your budget or removing a neighbourhood. New listings are added as providers publish around the pilot campus."
                action={
                  hasFilters ? (
                    <Button asChild variant="secondary">
                      <Link href="/search">Clear filters</Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/list-property">List a property</Link>
                    </Button>
                  )
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
