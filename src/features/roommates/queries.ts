import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/features/authentication/queries";
import {
  getCampusOptions,
  type CampusOption,
} from "@/features/accommodation/queries";
import {
  computeCompatibility,
  type CompatibilityResult,
} from "@/features/roommates/compatibility";
import type { Tables, Views } from "@/types/database";

export type RoommateDirectoryRow = Views<"roommate_directory">;
export type RoommateInterestInboxRow = Views<"roommate_interest_inbox">;

async function safeQuery<T>(
  operation: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      console.error("[roommates-query]", error);
      return fallback;
    }
    return data ?? fallback;
  } catch (error) {
    console.error("[roommates-query]", error);
    return fallback;
  }
}

export interface RoommateProfileBundle {
  profile: Tables<"roommate_profiles">;
  preferences: Tables<"roommate_preferences"> | null;
}

export async function getMyRoommateProfile(): Promise<RoommateProfileBundle | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const profile = await safeQuery<Tables<"roommate_profiles"> | null>(
    () =>
      supabase
        .from("roommate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    null,
  );

  if (!profile) return null;

  const preferences = await safeQuery<Tables<"roommate_preferences"> | null>(
    () =>
      supabase
        .from("roommate_preferences")
        .select("*")
        .eq("profile_id", profile.id)
        .maybeSingle(),
    null,
  );

  return { profile, preferences };
}

export interface RoommateCardData {
  row: RoommateDirectoryRow;
  compatibility: number | null;
}

export interface RoommateBrowseFilters {
  campusId?: string;
  sharing?: string;
}

export interface RoommateBrowseData {
  me: RoommateProfileBundle | null;
  cards: RoommateCardData[];
  campuses: CampusOption[];
}

export async function getRoommateBrowseData(
  filters: RoommateBrowseFilters = {},
): Promise<RoommateBrowseData> {
  const user = await getSessionUser();
  const campuses = await getCampusOptions();

  if (!user) return { me: null, cards: [], campuses };

  const supabase = await createClient();
  const me = await getMyRoommateProfile();

  let query = supabase
    .from("roommate_directory")
    .select("*")
    .eq("is_visible", true)
    .neq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (filters.campusId) {
    query = query.eq("campus_id", filters.campusId);
  }

  const rows = await safeQuery(
    () => query,
    [] as RoommateDirectoryRow[],
  );

  let cards: RoommateCardData[] = rows.map((row) => ({
    row,
    compatibility: me
      ? computeCompatibility(me.profile, me.preferences, row, row).score
      : null,
  }));

  if (filters.sharing && filters.sharing !== "any") {
    cards = cards.filter(
      (card) =>
        !card.row.sharing_arrangement ||
        card.row.sharing_arrangement === "any" ||
        card.row.sharing_arrangement === filters.sharing,
    );
  }

  cards.sort((a, b) => (b.compatibility ?? -1) - (a.compatibility ?? -1));

  return { me, cards, campuses };
}

export interface RoommateProfileDetailData {
  row: RoommateDirectoryRow;
  isMine: boolean;
  compatibility: CompatibilityResult | null;
  outgoing: RoommateInterestInboxRow | null;
  incoming: RoommateInterestInboxRow | null;
  phone: string | null;
}

export async function getRoommateProfileDetail(
  profileId: string,
): Promise<RoommateProfileDetailData | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const row = await safeQuery<RoommateDirectoryRow | null>(
    () =>
      supabase
        .from("roommate_directory")
        .select("*")
        .eq("id", profileId)
        .maybeSingle(),
    null,
  );

  if (!row) return null;

  const isMine = row.user_id === user.id;
  const me = isMine ? null : await getMyRoommateProfile();

  const interestRows = await safeQuery(
    () =>
      supabase
        .from("roommate_interest_inbox")
        .select("*")
        .eq("counterpart_profile_id", profileId),
    [] as RoommateInterestInboxRow[],
  );

  const outgoing = interestRows.find((r) => r.direction === "outgoing") ?? null;
  const incoming = interestRows.find((r) => r.direction === "incoming") ?? null;

  const phone =
    outgoing?.status === "accepted"
      ? outgoing.counterpart_phone
      : incoming?.status === "accepted"
        ? incoming.counterpart_phone
        : null;

  return {
    row,
    isMine,
    compatibility: me
      ? computeCompatibility(me.profile, me.preferences, row, row)
      : null,
    outgoing,
    incoming,
    phone,
  };
}

export interface RoommateInterestsData {
  me: RoommateProfileBundle | null;
  incoming: RoommateInterestInboxRow[];
  outgoing: RoommateInterestInboxRow[];
}

export async function getMyRoommateInterests(): Promise<RoommateInterestsData> {
  const me = await getMyRoommateProfile();
  if (!me) return { me: null, incoming: [], outgoing: [] };

  const supabase = await createClient();
  const rows = await safeQuery(
    () =>
      supabase
        .from("roommate_interest_inbox")
        .select("*")
        .order("created_at", { ascending: false }),
    [] as RoommateInterestInboxRow[],
  );

  return {
    me,
    incoming: rows.filter((row) => row.direction === "incoming"),
    outgoing: rows.filter((row) => row.direction === "outgoing"),
  };
}
