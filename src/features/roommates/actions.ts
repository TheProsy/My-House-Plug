"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/features/authentication/queries";
import {
  roommateInterestSchema,
  roommateProfileSchema,
} from "@/schemas/roommate";
import type { RoommateInterestStatus } from "@/types/database";

export interface RoommateActionState {
  error?: string;
  message?: string;
}

async function requireUser() {
  const user = await getSessionUser();
  if (!user) return { error: "You need to sign in." as const, user: null };
  return { error: null, user };
}

export async function saveRoommateProfileAction(
  _prevState: RoommateActionState,
  formData: FormData,
): Promise<RoommateActionState> {
  const { error: authError, user } = await requireUser();
  if (!user) return { error: authError ?? "Unauthorized" };

  const parsed = roommateProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    campusId: formData.get("campusId"),
    neighbourhoodId: formData.get("neighbourhoodId") ?? "",
    budgetMin: formData.get("budgetMin") || undefined,
    budgetMax: formData.get("budgetMax") || undefined,
    moveInDate: formData.get("moveInDate") ?? "",
    accommodationType: formData.get("accommodationType") || undefined,
    bio: formData.get("bio") ?? "",
    isVisible: formData.get("isVisible") === "on",
    contactVisibility: formData.get("contactVisibility") ?? "after_request",
    sharingArrangement: formData.get("sharingArrangement") ?? "any",
    sleepSchedule: formData.get("sleepSchedule") || undefined,
    cleanliness: formData.get("cleanliness") || undefined,
    cooking: formData.get("cooking") || undefined,
    studyEnvironment: formData.get("studyEnvironment") || undefined,
    guestPolicy: formData.get("guestPolicy") || undefined,
    smoking: formData.get("smoking") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("roommate_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const profileValues = {
    display_name: parsed.data.displayName,
    campus_id: parsed.data.campusId,
    neighbourhood_id: parsed.data.neighbourhoodId || null,
    budget_min: parsed.data.budgetMin ?? null,
    budget_max: parsed.data.budgetMax ?? null,
    move_in_date: parsed.data.moveInDate || null,
    accommodation_type: parsed.data.accommodationType ?? null,
    bio: parsed.data.bio || null,
    is_visible: parsed.data.isVisible,
    contact_visibility: parsed.data.contactVisibility,
  };

  let profileId: string;

  if (existing) {
    profileId = existing.id;
    const { error } = await supabase
      .from("roommate_profiles")
      .update(profileValues)
      .eq("id", existing.id);

    if (error) {
      console.error("[roommates] update profile", error);
      return { error: "We could not save your roommate profile. Try again." };
    }
  } else {
    const { data, error } = await supabase
      .from("roommate_profiles")
      .insert({ user_id: user.id, ...profileValues })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[roommates] create profile", error);
      return { error: "We could not create your roommate profile. Try again." };
    }

    profileId = data.id;
  }

  const { error: preferencesError } = await supabase
    .from("roommate_preferences")
    .upsert({
      profile_id: profileId,
      sharing_arrangement: parsed.data.sharingArrangement,
      sleep_schedule: parsed.data.sleepSchedule ?? null,
      cleanliness: parsed.data.cleanliness ?? null,
      cooking: parsed.data.cooking ?? null,
      study_environment: parsed.data.studyEnvironment ?? null,
      guest_policy: parsed.data.guestPolicy ?? null,
      smoking: parsed.data.smoking ?? null,
    });

  if (preferencesError) {
    console.error("[roommates] save preferences", preferencesError);
    return { error: "Profile saved, but preferences failed. Try again." };
  }

  revalidatePath("/roommates");
  revalidatePath("/roommates/profile");
  revalidatePath("/roommates/interests");

  return {
    message: existing
      ? "Roommate profile updated."
      : "Roommate profile created.",
  };
}

export async function sendRoommateInterestAction(
  _prevState: RoommateActionState,
  formData: FormData,
): Promise<RoommateActionState> {
  const { error: authError, user } = await requireUser();
  if (!user) return { error: authError ?? "Unauthorized" };

  const parsed = roommateInterestSchema.safeParse({
    toProfile: formData.get("toProfile"),
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details." };
  }

  const supabase = await createClient();

  const { data: myProfile } = await supabase
    .from("roommate_profiles")
    .select("id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!myProfile) {
    return {
      error:
        "Create your roommate profile first — then you can send interests.",
    };
  }

  const { data: target } = await supabase
    .from("roommate_profiles")
    .select("id, user_id, is_visible")
    .eq("id", parsed.data.toProfile)
    .maybeSingle();

  if (!target) return { error: "This profile is no longer available." };
  if (target.user_id === user.id) {
    return { error: "That's your own profile." };
  }
  if (!target.is_visible) {
    return { error: "This profile is not accepting interests right now." };
  }

  const { data: existing } = await supabase
    .from("roommate_interests")
    .select("id, status")
    .eq("from_profile", myProfile.id)
    .eq("to_profile", target.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "pending") {
      return { message: "Interest already sent — waiting for their response." };
    }
    if (existing.status === "accepted") {
      return { message: "You are already matched with this person." };
    }
    if (existing.status === "blocked") {
      return { error: "You can no longer send interests to this profile." };
    }

    const { error } = await supabase
      .from("roommate_interests")
      .update({
        status: "pending",
        message: parsed.data.message || null,
        responded_at: null,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("[roommates] resend interest", error);
      return { error: "We could not send your interest. Try again." };
    }
  } else {
    const { error } = await supabase.from("roommate_interests").insert({
      from_profile: myProfile.id,
      to_profile: target.id,
      status: "pending",
      message: parsed.data.message || null,
    });

    if (error) {
      console.error("[roommates] send interest", error);
      return { error: "We could not send your interest. Try again." };
    }
  }

  await supabase.rpc("notify_user", {
    target_user: target.user_id,
    notice_type: "roommate_interest",
    notice_title: "New roommate interest",
    notice_body: `${myProfile.display_name || "Someone"} would like to connect about sharing a place.`,
    notice_href: "/roommates/interests",
  });

  revalidatePath("/roommates/interests");
  revalidatePath(`/roommates/${target.id}`);

  return { message: "Interest sent. You'll be notified when they respond." };
}

const DECISIONS = ["accept", "decline", "withdraw", "block"] as const;
type Decision = (typeof DECISIONS)[number];

const DECISION_RESULTS: Record<Decision, RoommateInterestStatus> = {
  accept: "accepted",
  decline: "declined",
  withdraw: "withdrawn",
  block: "blocked",
};

const DECISION_MESSAGES: Record<Decision, string> = {
  accept: "Accepted — you're matched!",
  decline: "Request declined.",
  withdraw: "Interest withdrawn.",
  block: "Blocked. They won't be able to contact you again.",
};

export async function respondToRoommateInterestAction(
  formData: FormData,
): Promise<{ error?: string; message?: string }> {
  const { error: authError, user } = await requireUser();
  if (!user) return { error: authError ?? "Unauthorized" };

  const interestId = String(formData.get("interestId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (!interestId || !DECISIONS.includes(decision as Decision)) {
    return { error: "Unknown action." };
  }

  const supabase = await createClient();

  const { data: myProfile } = await supabase
    .from("roommate_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!myProfile) return { error: "Create your roommate profile first." };

  const { data: interest } = await supabase
    .from("roommate_interests")
    .select("*")
    .eq("id", interestId)
    .maybeSingle();

  if (!interest) return { error: "This interest no longer exists." };
  if (interest.status !== "pending") {
    return { error: "This request was already handled." };
  }

  const isReceiver = interest.to_profile === myProfile.id;
  const isSender = interest.from_profile === myProfile.id;

  if ((decision === "withdraw" && !isSender) || (decision !== "withdraw" && !isReceiver)) {
    return { error: "You cannot perform this action." };
  }

  const nextStatus = DECISION_RESULTS[decision as Decision];

  const { error } = await supabase
    .from("roommate_interests")
    .update({ status: nextStatus, responded_at: new Date().toISOString() })
    .eq("id", interest.id);

  if (error) {
    console.error("[roommates] respond to interest", error);
    return { error: "We could not update this request. Try again." };
  }

  const { data: profiles } = await supabase
    .from("roommate_profiles")
    .select("id, user_id, display_name")
    .in("id", [interest.from_profile, interest.to_profile]);

  const fromProfile = profiles?.find((row) => row.id === interest.from_profile);
  const toProfile = profiles?.find((row) => row.id === interest.to_profile);

  if (decision === "accept" && fromProfile) {
    await supabase.rpc("notify_user", {
      target_user: fromProfile.user_id,
      notice_type: "roommate_match",
      notice_title: "You have a roommate match!",
      notice_body: "They accepted your interest — say hello and agree on next steps.",
      notice_href: "/roommates/interests",
    });
  }

  if (decision === "decline" && fromProfile) {
    await supabase.rpc("notify_user", {
      target_user: fromProfile.user_id,
      notice_type: "roommate_interest",
      notice_title: "Interest declined",
      notice_body: "Not a fit this time — keep browsing roommate profiles.",
      notice_href: "/roommates/interests",
    });
  }

  if (decision === "withdraw" && toProfile) {
    await supabase.rpc("notify_user", {
      target_user: toProfile.user_id,
      notice_type: "roommate_interest",
      notice_title: "Interest withdrawn",
      notice_body: "An interest in your roommate profile was withdrawn.",
      notice_href: "/roommates/interests",
    });
  }

  revalidatePath("/roommates/interests");

  return { message: DECISION_MESSAGES[decision as Decision] };
}
