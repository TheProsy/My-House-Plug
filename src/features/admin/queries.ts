import { createClient } from "@/lib/supabase/server";
import type {
  Json,
  ReportStatus,
  Tables,
  TablesUpdate,
  VerificationStatus,
} from "@/types/database";

async function safeQuery<T>(
  operation: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      console.error("[admin-query]", error);
      return fallback;
    }
    return data ?? fallback;
  } catch (error) {
    console.error("[admin-query]", error);
    return fallback;
  }
}

async function countQuery(
  operation: () => PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number> {
  try {
    const { count, error } = await operation();
    if (error) {
      console.error("[admin-query] count", error);
      return 0;
    }
    return count ?? 0;
  } catch (error) {
    console.error("[admin-query] count", error);
    return 0;
  }
}

export interface AdminOverview {
  pendingListings: number;
  pendingVerifications: number;
  openReports: number;
  publishedListings: number;
  totalUsers: number;
  recentVerifications: (Tables<"verification_cases"> & { subjectLabel: string })[];
  recentReports: Tables<"reports">[];
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createClient();

  const [
    pendingListings,
    pendingVerifications,
    openReports,
    publishedListings,
    totalUsers,
    recentCases,
    recentReports,
  ] = await Promise.all([
    countQuery(() =>
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("listing_status", "pending_review"),
    ),
    countQuery(() =>
      supabase
        .from("verification_cases")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending_review", "more_info_required"]),
    ),
    countQuery(() =>
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "triaged", "investigating"]),
    ),
    countQuery(() =>
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("listing_status", "published"),
    ),
    countQuery(() =>
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ),
    safeQuery(
      () =>
        supabase
          .from("verification_cases")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      [] as Tables<"verification_cases">[],
    ),
    safeQuery(
      () =>
        supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      [] as Tables<"reports">[],
    ),
  ]);

  const caseLabels = await caseSubjectLabels(recentCases);

  return {
    pendingListings,
    pendingVerifications,
    openReports,
    publishedListings,
    totalUsers,
    recentVerifications: recentCases.map((row) => ({
      ...row,
      subjectLabel: caseLabels.get(row.id) ?? "Unknown subject",
    })),
    recentReports,
  };
}

async function caseSubjectLabels(
  cases: Tables<"verification_cases">[],
): Promise<Map<string, string>> {
  const labels = new Map<string, string>();
  if (cases.length === 0) return labels;

  const supabase = await createClient();
  const userIds = cases
    .filter((row) => row.subject_type === "user")
    .map((row) => row.subject_id);
  const propertyIds = cases
    .filter((row) => row.subject_type === "property")
    .map((row) => row.subject_id);

  const [profiles, properties] = await Promise.all([
    userIds.length
      ? safeQuery(
          () =>
            supabase.from("profiles").select("id, full_name").in("id", userIds),
          [] as Pick<Tables<"profiles">, "id" | "full_name">[],
        )
      : Promise.resolve([] as Pick<Tables<"profiles">, "id" | "full_name">[]),
    propertyIds.length
      ? safeQuery(
          () =>
            supabase.from("properties").select("id, title").in("id", propertyIds),
          [] as Pick<Tables<"properties">, "id" | "title">[],
        )
      : Promise.resolve([] as Pick<Tables<"properties">, "id" | "title">[]),
  ]);

  const profileMap = new Map(profiles.map((row) => [row.id, row.full_name]));
  const propertyMap = new Map(properties.map((row) => [row.id, row.title]));

  for (const row of cases) {
    const label =
      row.subject_type === "user"
        ? profileMap.get(row.subject_id)
        : propertyMap.get(row.subject_id);
    labels.set(row.id, label ?? "Unknown subject");
  }

  return labels;
}

export interface ListingReviewItem {
  property: Tables<"properties">;
  ownerName: string | null;
  unitCount: number;
  photoCount: number;
  minRent: number | null;
  campusName: string | null;
  neighbourhoodName: string | null;
}

export async function getListingReviewQueue(): Promise<ListingReviewItem[]> {
  const supabase = await createClient();

  const properties = await safeQuery(
    () =>
      supabase
        .from("properties")
        .select("*")
        .eq("listing_status", "pending_review")
        .order("updated_at", { ascending: true }),
    [] as Tables<"properties">[],
  );

  if (properties.length === 0) return [];

  const propertyIds = properties.map((row) => row.id);
  const ownerIds = [...new Set(properties.map((row) => row.owner_id))];
  const campusIds = [
    ...new Set(properties.map((row) => row.campus_id).filter(Boolean)),
  ] as string[];
  const neighbourhoodIds = [
    ...new Set(properties.map((row) => row.neighbourhood_id).filter(Boolean)),
  ] as string[];

  const [owners, units, photos, campuses, neighbourhoods] = await Promise.all([
    safeQuery(
      () =>
        supabase.from("profiles").select("id, full_name").in("id", ownerIds),
      [] as Pick<Tables<"profiles">, "id" | "full_name">[],
    ),
    safeQuery(
      () =>
        supabase
          .from("property_units")
          .select("property_id, rent_amount")
          .in("property_id", propertyIds),
      [] as Pick<Tables<"property_units">, "property_id" | "rent_amount">[],
    ),
    safeQuery(
      () =>
        supabase
          .from("property_photos")
          .select("property_id")
          .in("property_id", propertyIds),
      [] as Pick<Tables<"property_photos">, "property_id">[],
    ),
    campusIds.length
      ? safeQuery(
          () => supabase.from("campuses").select("id, name").in("id", campusIds),
          [] as { id: string; name: string }[],
        )
      : Promise.resolve([] as { id: string; name: string }[]),
    neighbourhoodIds.length
      ? safeQuery(
          () =>
            supabase
              .from("neighbourhoods")
              .select("id, name")
              .in("id", neighbourhoodIds),
          [] as { id: string; name: string }[],
        )
      : Promise.resolve([] as { id: string; name: string }[]),
  ]);

  const ownerMap = new Map(owners.map((row) => [row.id, row.full_name]));
  const campusMap = new Map(campuses.map((row) => [row.id, row.name]));
  const neighbourhoodMap = new Map(
    neighbourhoods.map((row) => [row.id, row.name]),
  );

  const unitStats = new Map<string, { count: number; min: number | null }>();
  for (const unit of units) {
    const current = unitStats.get(unit.property_id) ?? { count: 0, min: null };
    current.count += 1;
    if (unit.rent_amount !== null) {
      current.min =
        current.min === null
          ? unit.rent_amount
          : Math.min(current.min, unit.rent_amount);
    }
    unitStats.set(unit.property_id, current);
  }

  const photoCounts = new Map<string, number>();
  for (const photo of photos) {
    photoCounts.set(photo.property_id, (photoCounts.get(photo.property_id) ?? 0) + 1);
  }

  return properties.map((property) => ({
    property,
    ownerName: ownerMap.get(property.owner_id) ?? null,
    unitCount: unitStats.get(property.id)?.count ?? 0,
    photoCount: photoCounts.get(property.id) ?? 0,
    minRent: unitStats.get(property.id)?.min ?? null,
    campusName: property.campus_id ? campusMap.get(property.campus_id) ?? null : null,
    neighbourhoodName: property.neighbourhood_id
      ? neighbourhoodMap.get(property.neighbourhood_id) ?? null
      : null,
  }));
}

export async function getListingForReview(
  propertyId: string,
): Promise<{
  property: Tables<"properties">;
  owner: Tables<"profiles"> | null;
  units: Tables<"property_units">[];
  costs: Tables<"property_costs">[];
  photos: Tables<"property_photos">[];
  amenities: { key: string; label: string }[];
  verification: Tables<"verification_cases">[];
} | null> {
  const supabase = await createClient();

  const property = await safeQuery<Tables<"properties"> | null>(
    () => supabase.from("properties").select("*").eq("id", propertyId).maybeSingle(),
    null,
  );

  if (!property) return null;

  const [owner, units, costs, photos, amenities, propertyCases, ownerCases] =
    await Promise.all([
      safeQuery<Tables<"profiles"> | null>(
        () =>
          supabase
            .from("profiles")
            .select("*")
            .eq("id", property.owner_id)
            .maybeSingle(),
        null,
      ),
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
            .select("amenity_id, amenities(key, label)")
            .eq("property_id", propertyId),
        [] as unknown[],
      ),
      safeQuery(
        () =>
          supabase
            .from("verification_cases")
            .select("*")
            .eq("subject_type", "property")
            .eq("subject_id", propertyId),
        [] as Tables<"verification_cases">[],
      ),
      safeQuery(
        () =>
          supabase
            .from("verification_cases")
            .select("*")
            .eq("subject_type", "user")
            .eq("subject_id", property.owner_id),
        [] as Tables<"verification_cases">[],
      ),
    ]);

  const amenityList = (amenities as { amenities: { key: string; label: string } | null }[])
    .map((row) => row.amenities)
    .filter((row): row is { key: string; label: string } => row !== null);

  return {
    property,
    owner,
    units,
    costs,
    photos,
    amenities: amenityList,
    verification: [...propertyCases, ...ownerCases],
  };
}

export interface VerificationQueueItem {
  case: Tables<"verification_cases">;
  subjectLabel: string;
  evidenceCount: number;
}

export async function getVerificationQueue(
  statuses: VerificationStatus[] = ["pending_review", "more_info_required"],
): Promise<VerificationQueueItem[]> {
  const supabase = await createClient();

  const cases = await safeQuery(
    () =>
      supabase
        .from("verification_cases")
        .select("*")
        .in("status", statuses)
        .order("created_at", { ascending: true }),
    [] as Tables<"verification_cases">[],
  );

  if (cases.length === 0) return [];

  const labels = await caseSubjectLabels(cases);
  const caseIds = cases.map((row) => row.id);

  const evidence = await safeQuery(
    () =>
      supabase
        .from("verification_evidence")
        .select("case_id")
        .in("case_id", caseIds),
    [] as Pick<Tables<"verification_evidence">, "case_id">[],
  );

  const evidenceCounts = new Map<string, number>();
  for (const row of evidence) {
    evidenceCounts.set(row.case_id, (evidenceCounts.get(row.case_id) ?? 0) + 1);
  }

  return cases.map((row) => ({
    case: row,
    subjectLabel: labels.get(row.id) ?? "Unknown subject",
    evidenceCount: evidenceCounts.get(row.id) ?? 0,
  }));
}

export interface VerificationCaseDetail {
  case: Tables<"verification_cases">;
  userSubject: Tables<"profiles"> | null;
  propertySubject: Tables<"properties"> | null;
  propertyOwner: Tables<"profiles"> | null;
  evidence: (Tables<"verification_evidence"> & { signedUrl: string | null })[];
}

export async function getVerificationCaseDetail(
  caseId: string,
): Promise<VerificationCaseDetail | null> {
  const supabase = await createClient();

  const verificationCase = await safeQuery<Tables<"verification_cases"> | null>(
    () =>
      supabase
        .from("verification_cases")
        .select("*")
        .eq("id", caseId)
        .maybeSingle(),
    null,
  );

  if (!verificationCase) return null;

  let userSubject: Tables<"profiles"> | null = null;
  let propertySubject: Tables<"properties"> | null = null;
  let propertyOwner: Tables<"profiles"> | null = null;

  if (verificationCase.subject_type === "user") {
    userSubject = await safeQuery<Tables<"profiles"> | null>(
      () =>
        supabase
          .from("profiles")
          .select("*")
          .eq("id", verificationCase.subject_id)
          .maybeSingle(),
      null,
    );
  } else {
    propertySubject = await safeQuery<Tables<"properties"> | null>(
      () =>
        supabase
          .from("properties")
          .select("*")
          .eq("id", verificationCase.subject_id)
          .maybeSingle(),
      null,
    );
    if (propertySubject) {
      propertyOwner = await safeQuery<Tables<"profiles"> | null>(
        () =>
          supabase
            .from("profiles")
            .select("*")
            .eq("id", propertySubject!.owner_id)
            .maybeSingle(),
        null,
      );
    }
  }

  const evidenceRows = await safeQuery(
    () =>
      supabase
        .from("verification_evidence")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true }),
    [] as Tables<"verification_evidence">[],
  );

  const evidence = await Promise.all(
    evidenceRows.map(async (row) => {
      const { data } = await supabase.storage
        .from("verification-evidence")
        .createSignedUrl(row.storage_path, 3600);
      return { ...row, signedUrl: data?.signedUrl ?? null };
    }),
  );

  return {
    case: verificationCase,
    userSubject,
    propertySubject,
    propertyOwner,
    evidence,
  };
}

export interface ReportQueueItem {
  report: Tables<"reports">;
  reporterName: string | null;
  targetLabel: string | null;
  targetHref: string | null;
}

export async function getReportQueue(
  statuses: ReportStatus[] = ["open", "triaged", "investigating"],
): Promise<ReportQueueItem[]> {
  const supabase = await createClient();

  const reports = await safeQuery(
    () =>
      supabase
        .from("reports")
        .select("*")
        .in("status", statuses)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: true }),
    [] as Tables<"reports">[],
  );

  if (reports.length === 0) return [];

  const reporterIds = [
    ...new Set(reports.map((row) => row.reporter_id).filter(Boolean)),
  ] as string[];
  const listingIds = reports
    .filter((row) => row.target_type === "listing")
    .map((row) => row.target_id);
  const userIds = reports
    .filter((row) => row.target_type === "user")
    .map((row) => row.target_id);

  const [reporters, listings, users] = await Promise.all([
    reporterIds.length
      ? safeQuery(
          () =>
            supabase.from("profiles").select("id, full_name").in("id", reporterIds),
          [] as Pick<Tables<"profiles">, "id" | "full_name">[],
        )
      : Promise.resolve([] as Pick<Tables<"profiles">, "id" | "full_name">[]),
    listingIds.length
      ? safeQuery(
          () =>
            supabase
              .from("properties")
              .select("id, title, slug")
              .in("id", listingIds),
          [] as Pick<Tables<"properties">, "id" | "title" | "slug">[],
        )
      : Promise.resolve([] as Pick<Tables<"properties">, "id" | "title" | "slug">[]),
    userIds.length
      ? safeQuery(
          () =>
            supabase.from("profiles").select("id, full_name").in("id", userIds),
          [] as Pick<Tables<"profiles">, "id" | "full_name">[],
        )
      : Promise.resolve([] as Pick<Tables<"profiles">, "id" | "full_name">[]),
  ]);

  const reporterMap = new Map(reporters.map((row) => [row.id, row.full_name]));
  const listingMap = new Map(listings.map((row) => [row.id, row]));
  const userMap = new Map(users.map((row) => [row.id, row.full_name]));

  return reports.map((report) => {
    const listing =
      report.target_type === "listing" ? listingMap.get(report.target_id) : undefined;
    const user =
      report.target_type === "user" ? userMap.get(report.target_id) : undefined;

    return {
      report,
      reporterName: report.reporter_id
        ? reporterMap.get(report.reporter_id) ?? null
        : null,
      targetLabel: listing?.title ?? user ?? null,
      targetHref: listing ? `/properties/${listing.slug}` : null,
    };
  });
}

export async function getReportDetail(
  reportId: string,
): Promise<{
  report: Tables<"reports">;
  reporterName: string | null;
  listing: Tables<"properties"> | null;
  user: Tables<"profiles"> | null;
} | null> {
  const supabase = await createClient();

  const report = await safeQuery<Tables<"reports"> | null>(
    () => supabase.from("reports").select("*").eq("id", reportId).maybeSingle(),
    null,
  );

  if (!report) return null;

  const [reporter, listing, user] = await Promise.all([
    report.reporter_id
      ? safeQuery<Tables<"profiles"> | null>(
          () =>
            supabase
              .from("profiles")
              .select("*")
              .eq("id", report.reporter_id!)
              .maybeSingle(),
          null,
        )
      : Promise.resolve(null),
    report.target_type === "listing"
      ? safeQuery<Tables<"properties"> | null>(
          () =>
            supabase
              .from("properties")
              .select("*")
              .eq("id", report.target_id)
              .maybeSingle(),
          null,
        )
      : Promise.resolve(null),
    report.target_type === "user"
      ? safeQuery<Tables<"profiles"> | null>(
          () =>
            supabase
              .from("profiles")
              .select("*")
              .eq("id", report.target_id)
              .maybeSingle(),
          null,
        )
      : Promise.resolve(null),
  ]);

  return {
    report,
    reporterName: reporter?.full_name ?? null,
    listing,
    user,
  };
}

export async function updateListingMetadata(
  propertyId: string,
  patch: Record<string, Json>,
): Promise<{ error: unknown }> {
  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("metadata")
    .eq("id", propertyId)
    .maybeSingle();

  const current =
    property?.metadata &&
    typeof property.metadata === "object" &&
    !Array.isArray(property.metadata)
      ? (property.metadata as Record<string, Json>)
      : {};

  const metadata: Json = { ...current, ...patch };

  const { error } = await supabase
    .from("properties")
    .update({ metadata } satisfies TablesUpdate<"properties">)
    .eq("id", propertyId);

  return { error };
}
