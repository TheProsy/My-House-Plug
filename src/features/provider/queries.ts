import { createClient } from "@/lib/supabase/server";
import { LISTING_COLUMNS, type ListingCard } from "@/features/accommodation/queries";
import type { Tables } from "@/types/database";

export interface ProviderPropertyDetail {
  property: Tables<"properties">;
  units: Tables<"property_units">[];
  costs: Tables<"property_costs">[];
  photos: Tables<"property_photos">[];
  amenities: { key: string; label: string; category: string }[];
  amenityIds: string[];
  verification: Tables<"verification_cases">[];
  lastAvailability: Tables<"availability_confirmations"> | null;
}

async function safeQuery<T>(
  operation: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      console.error("[provider-query]", error);
      return fallback;
    }
    return data ?? fallback;
  } catch (error) {
    console.error("[provider-query]", error);
    return fallback;
  }
}

export async function getProviderProperties(
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
    [] as ListingCard[],
  ) as Promise<ListingCard[]>;
}

export async function getProviderProperty(
  propertyId: string,
): Promise<ProviderPropertyDetail | null> {
  const supabase = await createClient();

  const property = await safeQuery<Tables<"properties"> | null>(
    () =>
      supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle(),
    null,
  );

  if (!property) return null;

  const [units, costs, photos, amenities, verification, lastAvailability] =
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
            .select("amenity_id, amenities(key, label, category)")
            .eq("property_id", propertyId),
        [] as unknown[],
      ),
      safeQuery(
        () =>
          supabase
            .from("verification_cases")
            .select("*")
            .eq("subject_type", "property")
            .eq("subject_id", propertyId)
            .order("created_at", { ascending: false }),
        [] as Tables<"verification_cases">[],
      ),
      safeQuery(
        () =>
          supabase
            .from("availability_confirmations")
            .select("*")
            .eq("property_id", propertyId)
            .order("confirmed_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        null as Tables<"availability_confirmations"> | null,
      ),
    ]);

  const amenityRows = (amenities as unknown as {
    amenity_id: string;
    amenities:
      | { key: string; label: string; category: string }
      | { key: string; label: string; category: string }[]
      | null;
  }[]).flatMap((row) => {
    const value = Array.isArray(row.amenities) ? row.amenities[0] : row.amenities;
    return value ? [{ ...value, amenity_id: row.amenity_id }] : [];
  });

  return {
    property,
    units: units as Tables<"property_units">[],
    costs: costs as Tables<"property_costs">[],
    photos: photos as Tables<"property_photos">[],
    amenities: amenityRows.map(({ key, label, category }) => ({
      key,
      label,
      category,
    })),
    amenityIds: amenityRows.map((row) => row.amenity_id),
    verification: verification as Tables<"verification_cases">[],
    lastAvailability: lastAvailability as Tables<"availability_confirmations"> | null,
  };
}

export async function getAmenityOptions(): Promise<
  { id: string; key: string; label: string; category: string }[]
> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("amenities")
        .select("id, key, label, category")
        .order("category")
        .order("label"),
    [],
  ) as Promise<{ id: string; key: string; label: string; category: string }[]>;
}

export interface ProviderVerificationOverview {
  identityCase: Tables<"verification_cases"> | null;
  properties: {
    id: string;
    title: string;
    slug: string;
    authorizationCase: Tables<"verification_cases"> | null;
    visitCase: Tables<"verification_cases"> | null;
  }[];
}

export async function getProviderVerificationOverview(
  ownerId: string,
): Promise<ProviderVerificationOverview> {
  const supabase = await createClient();

  const [identityCase, listings] = await Promise.all([
    safeQuery(
      () =>
        supabase
          .from("verification_cases")
          .select("*")
          .eq("subject_type", "user")
          .eq("subject_id", ownerId)
          .eq("check_type", "identity")
          .maybeSingle(),
      null as Tables<"verification_cases"> | null,
    ),
    getProviderProperties(ownerId),
  ]);

  const propertyIds = listings.map((listing) => listing.id);
  let propertyCases: Tables<"verification_cases">[] = [];

  if (propertyIds.length > 0) {
    propertyCases = (await safeQuery(
      () =>
        supabase
          .from("verification_cases")
          .select("*")
          .eq("subject_type", "property")
          .in("subject_id", propertyIds),
      [] as Tables<"verification_cases">[],
    )) as Tables<"verification_cases">[];
  }

  return {
    identityCase: identityCase as Tables<"verification_cases"> | null,
    properties: listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      authorizationCase:
        propertyCases.find(
          (item) =>
            item.subject_id === listing.id &&
            item.check_type === "property_authorization",
        ) ?? null,
      visitCase:
        propertyCases.find(
          (item) =>
            item.subject_id === listing.id && item.check_type === "property_visit",
        ) ?? null,
    })),
  };
}

export interface ProviderListingStats {
  total: number;
  published: number;
  drafts: number;
  pending: number;
  paused: number;
  rented: number;
  archived: number;
}

export function summarizeListings(listings: ListingCard[]): ProviderListingStats {
  return {
    total: listings.length,
    published: listings.filter((l) => l.listing_status === "published").length,
    drafts: listings.filter((l) => l.listing_status === "draft").length,
    pending: listings.filter((l) => l.listing_status === "pending_review").length,
    paused: listings.filter((l) => l.listing_status === "paused").length,
    rented: listings.filter((l) => l.listing_status === "rented").length,
    archived: listings.filter((l) => l.listing_status === "archived").length,
  };
}
