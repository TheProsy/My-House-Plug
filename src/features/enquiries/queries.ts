import { createClient } from "@/lib/supabase/server";
import type { Tables, Views } from "@/types/database";

async function safeQuery<T>(
  operation: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      console.error("[enquiries-query]", error);
      return fallback;
    }
    return data ?? fallback;
  } catch (error) {
    console.error("[enquiries-query]", error);
    return fallback;
  }
}

export interface EnquiryPropertySummary {
  id: string;
  title: string;
  slug: string;
  coverPhoto: string | null;
}

export interface ProfileSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
}

export interface EnquiryWithContext {
  enquiry: Tables<"enquiries">;
  property: EnquiryPropertySummary | null;
  counterpart: ProfileSummary | null;
}

export interface EnquiryDetail {
  enquiry: Tables<"enquiries">;
  property: EnquiryPropertySummary | null;
  address: string | null;
  renter: ProfileSummary | null;
  provider: ProfileSummary | null;
  messages: Tables<"enquiry_messages">[];
  inspections: Tables<"inspections">[];
  leadEvents: Tables<"lead_events">[];
}

export interface InspectionWithContext {
  inspection: Tables<"inspections">;
  enquiry: Pick<
    Tables<"enquiries">,
    "id" | "property_id" | "renter_id" | "provider_id"
  > | null;
  property: EnquiryPropertySummary | null;
  counterpart: ProfileSummary | null;
}

async function firstPhotoMap(
  propertyIds: string[],
): Promise<Map<string, string>> {
  if (propertyIds.length === 0) return new Map();
  const supabase = await createClient();
  const photos = await safeQuery(
    () =>
      supabase
        .from("property_photos")
        .select("property_id, storage_path, is_cover, sort_order")
        .in("property_id", propertyIds)
        .order("is_cover", { ascending: false })
        .order("sort_order", { ascending: true }),
    [] as Pick<
      Tables<"property_photos">,
      "property_id" | "storage_path" | "is_cover" | "sort_order"
    >[],
  );

  const map = new Map<string, string>();
  for (const photo of photos) {
    if (!map.has(photo.property_id)) {
      map.set(photo.property_id, photo.storage_path);
    }
  }
  return map;
}

async function listEnquiries(
  filter: { column: "renter_id" | "provider_id"; userId: string },
): Promise<EnquiryWithContext[]> {
  const supabase = await createClient();

  const enquiries = await safeQuery(
    () =>
      supabase
        .from("enquiries")
        .select("*")
        .eq(filter.column, filter.userId)
        .order("updated_at", { ascending: false }),
    [] as Tables<"enquiries">[],
  );

  if (enquiries.length === 0) return [];

  const propertyIds = [...new Set(enquiries.map((row) => row.property_id))];
  const counterpartIds = [
    ...new Set(
      enquiries.map((row) =>
        filter.column === "renter_id" ? row.provider_id : row.renter_id,
      ),
    ),
  ];

  const [properties, photoMap, profiles] = await Promise.all([
    safeQuery(
      () =>
        supabase
          .from("properties")
          .select("id, title, slug")
          .in("id", propertyIds),
      [] as Pick<Tables<"properties">, "id" | "title" | "slug">[],
    ),
    firstPhotoMap(propertyIds),
    safeQuery(
      () =>
        supabase
          .from("public_profiles")
          .select("id, full_name, avatar_url")
          .in("id", counterpartIds),
      [] as Pick<Views<"public_profiles">, "id" | "full_name" | "avatar_url">[],
    ),
  ]);

  const propertyMap = new Map(properties.map((row) => [row.id, row]));
  const profileMap = new Map(profiles.map((row) => [row.id, row]));

  return enquiries.map((enquiry) => {
    const property = propertyMap.get(enquiry.property_id);
    const counterpartId =
      filter.column === "renter_id" ? enquiry.provider_id : enquiry.renter_id;
    const counterpart = profileMap.get(counterpartId);

    return {
      enquiry,
      property: property
        ? {
            id: property.id,
            title: property.title,
            slug: property.slug,
            coverPhoto: photoMap.get(property.id) ?? null,
          }
        : null,
      counterpart: counterpart
        ? {
            id: counterpart.id,
            fullName: counterpart.full_name,
            avatarUrl: counterpart.avatar_url,
            phone: null,
          }
        : null,
    };
  });
}

export function getEnquiriesForRenter(
  userId: string,
): Promise<EnquiryWithContext[]> {
  return listEnquiries({ column: "renter_id", userId });
}

export function getEnquiriesForProvider(
  userId: string,
): Promise<EnquiryWithContext[]> {
  return listEnquiries({ column: "provider_id", userId });
}

export async function getEnquiryDetail(
  enquiryId: string,
): Promise<EnquiryDetail | null> {
  const supabase = await createClient();

  const enquiry = await safeQuery<Tables<"enquiries"> | null>(
    () => supabase.from("enquiries").select("*").eq("id", enquiryId).maybeSingle(),
    null,
  );

  if (!enquiry) return null;

  const [property, photoMap, renter, provider, messages, inspections, leadEvents, contact] =
    await Promise.all([
      safeQuery<Tables<"properties"> | null>(
        () =>
          supabase
            .from("properties")
            .select("*")
            .eq("id", enquiry.property_id)
            .maybeSingle(),
        null,
      ),
      firstPhotoMap([enquiry.property_id]),
      safeQuery<Views<"public_profiles"> | null>(
        () =>
          supabase
            .from("public_profiles")
            .select("id, full_name, avatar_url")
            .eq("id", enquiry.renter_id)
            .maybeSingle(),
        null,
      ),
      safeQuery<Views<"public_profiles"> | null>(
        () =>
          supabase
            .from("public_profiles")
            .select("id, full_name, avatar_url")
            .eq("id", enquiry.provider_id)
            .maybeSingle(),
        null,
      ),
      safeQuery(
        () =>
          supabase
            .from("enquiry_messages")
            .select("*")
            .eq("enquiry_id", enquiryId)
            .order("created_at", { ascending: true }),
        [] as Tables<"enquiry_messages">[],
      ),
      safeQuery(
        () =>
          supabase
            .from("inspections")
            .select("*")
            .eq("enquiry_id", enquiryId)
            .order("created_at", { ascending: false }),
        [] as Tables<"inspections">[],
      ),
      safeQuery(
        () =>
          supabase
            .from("lead_events")
            .select("*")
            .eq("enquiry_id", enquiryId)
            .order("created_at", { ascending: true }),
        [] as Tables<"lead_events">[],
      ),
      safeQuery<Views<"enquiry_contacts"> | null>(
        () =>
          supabase
            .from("enquiry_contacts")
            .select("enquiry_id, renter_phone")
            .eq("enquiry_id", enquiryId)
            .maybeSingle(),
        null,
      ),
    ]);

  return {
    enquiry,
    property: property
      ? {
          id: property.id,
          title: property.title,
          slug: property.slug,
          coverPhoto: photoMap.get(property.id) ?? null,
        }
      : null,
    address: property?.address ?? null,
    renter: renter
      ? {
          id: renter.id,
          fullName: renter.full_name,
          avatarUrl: renter.avatar_url,
          phone: contact?.renter_phone ?? null,
        }
      : null,
    provider: provider
      ? {
          id: provider.id,
          fullName: provider.full_name,
          avatarUrl: provider.avatar_url,
          phone: null,
        }
      : null,
    messages,
    inspections,
    leadEvents,
  };
}

export async function getOpenEnquiryForProperty(
  renterId: string,
  propertyId: string,
): Promise<Tables<"enquiries"> | null> {
  const supabase = await createClient();
  return safeQuery<Tables<"enquiries"> | null>(
    () =>
      supabase
        .from("enquiries")
        .select("*")
        .eq("renter_id", renterId)
        .eq("property_id", propertyId)
        .neq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    null,
  );
}

export async function getInspectionsForUser(
  userId: string,
): Promise<InspectionWithContext[]> {
  const supabase = await createClient();

  const enquiries = await safeQuery(
    () =>
      supabase
        .from("enquiries")
        .select("id, property_id, renter_id, provider_id")
        .or(`renter_id.eq.${userId},provider_id.eq.${userId}`),
    [] as Pick<
      Tables<"enquiries">,
      "id" | "property_id" | "renter_id" | "provider_id"
    >[],
  );

  if (enquiries.length === 0) return [];

  const enquiryIds = enquiries.map((row) => row.id);
  const enquiryMap = new Map(enquiries.map((row) => [row.id, row]));

  const inspections = await safeQuery(
    () =>
      supabase
        .from("inspections")
        .select("*")
        .in("enquiry_id", enquiryIds)
        .order("scheduled_at", { ascending: true }),
    [] as Tables<"inspections">[],
  );

  if (inspections.length === 0) return [];

  const propertyIds = [...new Set(inspections.map((row) => row.property_id))];
  const counterpartIds = [
    ...new Set(
      enquiries.map((row) => (row.renter_id === userId ? row.provider_id : row.renter_id)),
    ),
  ];

  const [properties, photoMap, profiles] = await Promise.all([
    safeQuery(
      () =>
        supabase
          .from("properties")
          .select("id, title, slug")
          .in("id", propertyIds),
      [] as Pick<Tables<"properties">, "id" | "title" | "slug">[],
    ),
    firstPhotoMap(propertyIds),
    safeQuery(
      () =>
        supabase
          .from("public_profiles")
          .select("id, full_name, avatar_url")
          .in("id", counterpartIds),
      [] as Pick<Views<"public_profiles">, "id" | "full_name" | "avatar_url">[],
    ),
  ]);

  const propertyMap = new Map(properties.map((row) => [row.id, row]));
  const profileMap = new Map(profiles.map((row) => [row.id, row]));

  return inspections.map((inspection) => {
    const enquiry = enquiryMap.get(inspection.enquiry_id) ?? null;
    const property = propertyMap.get(inspection.property_id);
    const counterpartId = enquiry
      ? enquiry.renter_id === userId
        ? enquiry.provider_id
        : enquiry.renter_id
      : null;
    const counterpart = counterpartId ? profileMap.get(counterpartId) : undefined;

    return {
      inspection,
      enquiry,
      property: property
        ? {
            id: property.id,
            title: property.title,
            slug: property.slug,
            coverPhoto: photoMap.get(property.id) ?? null,
          }
        : null,
      counterpart: counterpart
        ? {
            id: counterpart.id,
            fullName: counterpart.full_name,
            avatarUrl: counterpart.avatar_url,
            phone: null,
          }
        : null,
    };
  });
}
