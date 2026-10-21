import { createClient } from "@/lib/supabase/server";
import type { SearchParams } from "@/schemas/search";
import type { Tables, Views } from "@/types/database";

export type ListingCard = Views<"property_listings">;

export interface CampusOption {
  id: string;
  name: string;
  slug: string;
  universityName: string;
  neighbourhoods: { id: string; name: string; slug: string }[];
}

export interface ListingDetail {
  listing: ListingCard;
  units: Tables<"property_units">[];
  costs: Tables<"property_costs">[];
  photos: Tables<"property_photos">[];
  amenities: { key: string; label: string; category: string; icon: string | null }[];
  verification: Views<"public_verifications">[];
  providerBio: string | null;
  providerSince: string | null;
}

async function safeQuery<T>(
  operation: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      console.error("[query]", error);
      return fallback;
    }
    return data ?? fallback;
  } catch (error) {
    console.error("[query]", error);
    return fallback;
  }
}

export async function getCampusOptions(): Promise<CampusOption[]> {
  const supabase = await createClient();

  const data = await safeQuery(
    () =>
      supabase
        .from("campuses")
        .select(
          "id, name, slug, universities!inner(name), neighbourhoods(id, name, slug)",
        )
        .order("name"),
    [],
  );

  return (data as unknown as {
    id: string;
    name: string;
    slug: string;
    universities: { name: string } | { name: string }[] | null;
    neighbourhoods: { id: string; name: string; slug: string }[] | null;
  }[]).map((campus) => {
    const university = Array.isArray(campus.universities)
      ? campus.universities[0]
      : campus.universities;
    return {
      id: campus.id,
      name: campus.name,
      slug: campus.slug,
      universityName: university?.name ?? "",
      neighbourhoods: (campus.neighbourhoods ?? []).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    };
  });
}

export const LISTING_COLUMNS =
  "id, slug, title, description, property_type, furnished, listing_status, availability_status, available_from, last_availability_confirmed_at, published_at, created_at, view_count, campus_id, neighbourhood_id, lat, lng, campus_name, campus_slug, university_name, neighbourhood_name, neighbourhood_slug, provider_id, provider_name, provider_avatar_url, min_rent, max_rent, unit_count, cover_photo, authorization_verified, visit_verified, provider_identity_verified, rent_period";

export async function getFeaturedListings(limit = 6): Promise<ListingCard[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("property_listings")
        .select(LISTING_COLUMNS)
        .eq("listing_status", "published")
        .not("cover_photo", "is", null)
        .order("published_at", { ascending: false })
        .limit(limit),
    [],
  ) as Promise<ListingCard[]>;
}

export async function getRecentListings(limit = 4): Promise<ListingCard[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("property_listings")
        .select(LISTING_COLUMNS)
        .eq("listing_status", "published")
        .order("published_at", { ascending: false })
        .limit(limit),
    [],
  ) as Promise<ListingCard[]>;
}

export async function searchListings(
  params: SearchParams,
  pageSize = 12,
): Promise<{
  results: ListingCard[];
  total: number;
  totalPages: number;
  error?: boolean;
}> {
  const supabase = await createClient();
  const from = (params.page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("property_listings")
    .select(LISTING_COLUMNS, { count: "exact" })
    .eq("listing_status", "published");

  if (params.campus) query = query.eq("campus_id", params.campus);
  if (params.neighbourhood)
    query = query.eq("neighbourhood_id", params.neighbourhood);
  if (params.type) query = query.eq("property_type", params.type);
  if (params.furnished === "yes") query = query.eq("furnished", true);
  if (params.furnished === "no") query = query.eq("furnished", false);
  if (params.min !== undefined) query = query.gte("min_rent", params.min);
  if (params.max !== undefined) query = query.lte("min_rent", params.max);

  if (params.q) {
    const escaped = params.q.replace(/[%_,]/g, "").trim();
    if (escaped) {
      query = query.or(
        `title.ilike.%${escaped}%,description.ilike.%${escaped}%,neighbourhood_name.ilike.%${escaped}%`,
      );
    }
  }

  switch (params.sort) {
    case "price_asc":
      query = query.order("min_rent", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("min_rent", { ascending: false, nullsFirst: false });
      break;
    case "newest":
    case "relevance":
    default:
      query = query.order("published_at", { ascending: false });
      break;
  }

  try {
    const { data, count, error } = await query.range(from, to);
    if (error) {
      console.error("[search]", error);
      return { results: [], total: 0, totalPages: 1, error: true };
    }
    const total = count ?? 0;
    return {
      results: (data ?? []) as ListingCard[],
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (error) {
    console.error("[search]", error);
    return { results: [], total: 0, totalPages: 1, error: true };
  }
}

export async function getListingBySlug(
  slug: string,
): Promise<ListingDetail | null> {
  const supabase = await createClient();

  const listing = await safeQuery<ListingCard | null>(
    () =>
      supabase
        .from("property_listings")
        .select(LISTING_COLUMNS)
        .eq("slug", slug)
        .eq("listing_status", "published")
        .maybeSingle(),
    null,
  );

  if (!listing) return null;

  const propertyId = listing.id;

  const [units, costs, photos, amenities, verification, provider] =
    await Promise.all([
      safeQuery(
        () =>
          supabase
            .from("property_units")
            .select("*")
            .eq("property_id", propertyId)
            .order("rent_amount", { ascending: true }),
        [] as Tables<"property_units">[],
      ),
      safeQuery(
        () =>
          supabase
            .from("property_costs")
            .select("*")
            .eq("property_id", propertyId)
            .order("category"),
        [] as Tables<"property_costs">[],
      ),
      safeQuery(
        () =>
          supabase
            .from("property_photos")
            .select("*")
            .eq("property_id", propertyId)
            .order("is_cover", { ascending: false })
            .order("sort_order", { ascending: true }),
        [] as Tables<"property_photos">[],
      ),
      safeQuery(
        () =>
          supabase
            .from("property_amenities")
            .select("amenities(key, label, category, icon)")
            .eq("property_id", propertyId),
        [] as unknown[],
      ),
      safeQuery(
        () =>
          supabase
            .from("public_verifications")
            .select("*")
            .eq("subject_type", "property")
            .eq("subject_id", propertyId),
        [] as Views<"public_verifications">[],
      ),
      safeQuery(
        () =>
          supabase
            .from("public_profiles")
            .select("bio, created_at")
            .eq("id", listing.provider_id)
            .maybeSingle(),
        null as { bio: string | null; created_at: string } | null,
      ),
    ]);

  const amenityRows = (amenities as unknown as {
    amenities:
      | { key: string; label: string; category: string; icon: string | null }
      | { key: string; label: string; category: string; icon: string | null }[]
      | null;
  }[]).flatMap((row) => {
    const value = Array.isArray(row.amenities)
      ? row.amenities[0]
      : row.amenities;
    return value ? [value] : [];
  });

  return {
    listing: listing as ListingCard,
    units: units as Tables<"property_units">[],
    costs: costs as Tables<"property_costs">[],
    photos: photos as Tables<"property_photos">[],
    amenities: amenityRows,
    verification: verification as Views<"public_verifications">[],
    providerBio: provider?.bio ?? null,
    providerSince: provider?.created_at ?? null,
  };
}

export async function getSimilarListings(
  listing: ListingCard,
  limit = 3,
): Promise<ListingCard[]> {
  const supabase = await createClient();
  const filters: string[] = [];
  if (listing.neighbourhood_id) filters.push(`neighbourhood_id.eq.${listing.neighbourhood_id}`);
  if (listing.campus_id) filters.push(`campus_id.eq.${listing.campus_id}`);

  let query = supabase
    .from("property_listings")
    .select(LISTING_COLUMNS)
    .eq("listing_status", "published")
    .neq("id", listing.id)
    .limit(limit);

  if (filters.length > 0) {
    query = query.or(filters.join(","));
  }

  return safeQuery(() => query, [] as ListingCard[]) as Promise<ListingCard[]>;
}

export async function getProviderListings(
  ownerId: string,
): Promise<ListingCard[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("property_listings")
        .select(LISTING_COLUMNS)
        .eq("provider_id", ownerId)
        .order("created_at", { ascending: false }),
    [],
  ) as Promise<ListingCard[]>;
}
