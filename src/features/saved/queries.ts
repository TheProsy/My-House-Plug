import { createClient } from "@/lib/supabase/server";
import type { ListingCard } from "@/features/accommodation/queries";

export async function getSavedPropertyIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Set();

  const { data, error } = await supabase
    .from("saved_properties")
    .select("property_id")
    .eq("user_id", user.id);

  if (error) return new Set();
  return new Set((data ?? []).map((row) => row.property_id));
}

const LISTING_COLUMNS =
  "id, slug, title, description, property_type, furnished, listing_status, availability_status, available_from, last_availability_confirmed_at, published_at, created_at, view_count, campus_id, neighbourhood_id, lat, lng, campus_name, campus_slug, university_name, neighbourhood_name, neighbourhood_slug, provider_id, provider_name, provider_avatar_url, min_rent, max_rent, unit_count, cover_photo, authorization_verified, visit_verified, provider_identity_verified";

export async function getSavedListings(): Promise<ListingCard[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: saved, error } = await supabase
    .from("saved_properties")
    .select("property_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !saved || saved.length === 0) return [];

  const ids = saved.map((row) => row.property_id);
  const { data: listings, error: listingsError } = await supabase
    .from("property_listings")
    .select(LISTING_COLUMNS)
    .in("id", ids);

  if (listingsError || !listings) return [];

  const byId = new Map(listings.map((listing) => [listing.id, listing]));
  return ids
    .map((id) => byId.get(id))
    .filter((listing): listing is ListingCard => Boolean(listing));
}
