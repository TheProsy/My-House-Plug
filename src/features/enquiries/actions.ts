"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isStaff } from "@/features/authentication/queries";
import { getOpenEnquiryForProperty } from "@/features/enquiries/queries";
import {
  enquiryMessageSchema,
  enquirySchema,
  inspectionResponseSchema,
  leadStageSchema,
  propertyInspectionRequestSchema,
} from "@/schemas/enquiry";
import type {
  InspectionStatus,
  LeadStage,
  TablesUpdate,
} from "@/types/database";

export interface EnquiryActionState {
  error?: string;
  message?: string;
}

async function requireUser() {
  const user = await getSessionUser();
  if (!user) return { error: "You need to sign in." as const, user: null };
  return { error: null, user };
}

function hrefFor(viewerId: string, enquiry: { id: string; renter_id: string; provider_id: string }) {
  return viewerId === enquiry.renter_id
    ? `/enquiries/${enquiry.id}`
    : `/provider/enquiries/${enquiry.id}`;
}

export async function createEnquiryAction(
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const { error: authError, user } = await requireUser();
  if (!user) return { error: authError ?? "Unauthorized" };

  const parsed = enquirySchema.safeParse({
    propertyId: formData.get("propertyId"),
    message: formData.get("message"),
    contactPreference: formData.get("contactPreference") ?? "in_app",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details." };
  }

  const supabase = await createClient();

  const existing = await getOpenEnquiryForProperty(user.id, parsed.data.propertyId);
  if (existing) {
    redirect(`/enquiries/${existing.id}`);
  }

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      property_id: parsed.data.propertyId,
      renter_id: user.id,
      message: parsed.data.message,
      contact_preference: parsed.data.contactPreference,
    })
    .select("id, provider_id")
    .single();

  if (error || !data) {
    console.error("[enquiries] create", error);
    return { error: "We could not send your enquiry. Try again." };
  }

  await supabase.rpc("notify_user", {
    target_user: data.provider_id,
    notice_type: "new_enquiry",
    notice_title: "New enquiry on your listing",
    notice_body: parsed.data.message.slice(0, 140),
    notice_href: `/provider/enquiries/${data.id}`,
  });

  revalidatePath("/enquiries");
  revalidatePath("/provider/enquiries");
  redirect(`/enquiries/${data.id}`);
}

export async function requestInspectionAction(
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const { error: authError, user } = await requireUser();
  if (!user) return { error: authError ?? "Unauthorized" };

  const parsed = propertyInspectionRequestSchema.safeParse({
    propertyId: formData.get("propertyId"),
    scheduledAt: formData.get("scheduledAt"),
    notes: formData.get("notes") ?? "",
    message: formData.get("message") ?? "",
    contactPreference: formData.get("contactPreference") ?? "in_app",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details." };
  }

  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, owner_id, listing_status")
    .eq("id", parsed.data.propertyId)
    .maybeSingle();

  if (!property || property.listing_status !== "published") {
    return { error: "This listing is not accepting inspection requests right now." };
  }

  const existing = await getOpenEnquiryForProperty(user.id, parsed.data.propertyId);
  const message = parsed.data.message?.trim() ?? "";

  let enquiryId: string;
  let providerId: string;
  let leadStage: LeadStage;

  if (existing) {
    enquiryId = existing.id;
    providerId = existing.provider_id;
    leadStage = existing.lead_stage;
  } else {
    if (message.length < 15) {
      return {
        error:
          "Add a short message (at least 15 characters) so the provider knows what you need.",
      };
    }

    const { data, error } = await supabase
      .from("enquiries")
      .insert({
        property_id: parsed.data.propertyId,
        renter_id: user.id,
        message,
        contact_preference: parsed.data.contactPreference,
        lead_stage: "inspection_scheduled",
      })
      .select("id, provider_id")
      .single();

    if (error || !data) {
      console.error("[enquiries] inspection enquiry create", error);
      return { error: "We could not send your request. Try again." };
    }

    enquiryId = data.id;
    providerId = data.provider_id;
    leadStage = "inspection_scheduled";
  }

  const scheduledAt = new Date(parsed.data.scheduledAt).toISOString();

  const { error: inspectionError } = await supabase.from("inspections").insert({
    enquiry_id: enquiryId,
    property_id: parsed.data.propertyId,
    requested_by: user.id,
    scheduled_at: scheduledAt,
    notes: parsed.data.notes || null,
  });

  if (inspectionError) {
    console.error("[enquiries] inspection insert", inspectionError);
    return { error: "We could not book the inspection. Try again." };
  }

  if (leadStage !== "inspection_scheduled") {
    await supabase
      .from("enquiries")
      .update({ lead_stage: "inspection_scheduled" })
      .eq("id", enquiryId);
  }

  await supabase.rpc("notify_user", {
    target_user: providerId,
    notice_type: "inspection_requested",
    notice_title: "New inspection request",
    notice_body: `Requested for ${new Date(scheduledAt).toLocaleString("en-NG")}.`,
    notice_href: `/provider/enquiries/${enquiryId}`,
  });

  revalidatePath("/enquiries");
  revalidatePath("/inspections");
  revalidatePath(`/enquiries/${enquiryId}`);
  revalidatePath(`/provider/enquiries/${enquiryId}`);

  redirect(`/enquiries/${enquiryId}`);
}

export async function sendEnquiryMessageAction(
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const { error: authError, user } = await requireUser();
  if (!user) return { error: authError ?? "Unauthorized" };

  const parsed = enquiryMessageSchema.safeParse({
    enquiryId: formData.get("enquiryId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the message." };
  }

  const supabase = await createClient();

  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("id, renter_id, provider_id")
    .eq("id", parsed.data.enquiryId)
    .maybeSingle();

  if (!enquiry) return { error: "Enquiry not found." };

  const { error } = await supabase.from("enquiry_messages").insert({
    enquiry_id: enquiry.id,
    sender_id: user.id,
    body: parsed.data.body,
  });

  if (error) {
    console.error("[enquiries] message insert", error);
    return { error: "We could not send the message." };
  }

  const recipientId =
    user.id === enquiry.renter_id ? enquiry.provider_id : enquiry.renter_id;

  await supabase.rpc("notify_user", {
    target_user: recipientId,
    notice_type: "enquiry_response",
    notice_title: "New reply in your enquiry",
    notice_body: parsed.data.body.slice(0, 140),
    notice_href: hrefFor(recipientId, enquiry),
  });

  revalidatePath(`/enquiries/${enquiry.id}`);
  revalidatePath(`/provider/enquiries/${enquiry.id}`);
  revalidatePath("/enquiries");
  revalidatePath("/provider/enquiries");

  return { message: "Message sent." };
}

const stageToClose: LeadStage[] = ["rented", "lost"];

export async function updateLeadStageAction(
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const { error: authError, user } = await requireUser();
  if (!user) return { error: authError ?? "Unauthorized" };

  const parsed = leadStageSchema.safeParse({
    enquiryId: formData.get("enquiryId"),
    stage: formData.get("stage"),
    lostReason: formData.get("lostReason") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the stage." };
  }

  const supabase = await createClient();

  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", parsed.data.enquiryId)
    .maybeSingle();

  if (!enquiry) return { error: "Enquiry not found." };

  if (enquiry.provider_id !== user.id && !isStaff(user)) {
    return { error: "Only the provider can move this lead." };
  }

  if (enquiry.lead_stage === parsed.data.stage) {
    return { message: "Lead stage unchanged." };
  }

  const isClosing = stageToClose.includes(parsed.data.stage);
  if (parsed.data.stage === "lost" && !parsed.data.lostReason) {
    return { error: "Tell us why the lead was lost." };
  }

  const { error } = await supabase
    .from("enquiries")
    .update({
      lead_stage: parsed.data.stage,
      lost_reason:
        parsed.data.stage === "lost" ? parsed.data.lostReason || null : null,
      closed_at: isClosing ? new Date().toISOString() : null,
      status: isClosing ? "closed" : enquiry.status,
    })
    .eq("id", enquiry.id);

  if (error) {
    console.error("[enquiries] lead stage", error);
    return { error: "We could not update the lead stage." };
  }

  if (parsed.data.stage === "rented") {
    const { data: existingOutcome } = await supabase
      .from("rental_outcomes")
      .select("id")
      .eq("enquiry_id", enquiry.id)
      .maybeSingle();

    if (!existingOutcome) {
      const { data: cheapestUnit } = await supabase
        .from("property_units")
        .select("rent_amount")
        .eq("property_id", enquiry.property_id)
        .order("rent_amount", { ascending: true })
        .limit(1)
        .maybeSingle();

      await supabase.from("rental_outcomes").insert({
        property_id: enquiry.property_id,
        enquiry_id: enquiry.id,
        reported_by: user.id,
        outcome: "secured_via_platform",
        rent_amount: cheapestUnit?.rent_amount ?? null,
      });
    }
  }

  revalidatePath(`/provider/enquiries/${enquiry.id}`);
  revalidatePath(`/enquiries/${enquiry.id}`);
  revalidatePath("/provider/enquiries");
  revalidatePath("/provider/dashboard");

  return {
    message: `Lead moved to "${parsed.data.stage.replaceAll("_", " ")}".`,
  };
}

export async function closeEnquiryAction(
  formData: FormData,
): Promise<EnquiryActionState> {
  const { error: authError, user } = await requireUser();
  if (!user) return { error: authError ?? "Unauthorized" };

  const enquiryId = String(formData.get("enquiryId") ?? "");
  if (!enquiryId) return { error: "Missing enquiry." };

  const supabase = await createClient();

  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("id, renter_id, provider_id, status")
    .eq("id", enquiryId)
    .maybeSingle();

  if (!enquiry) return { error: "Enquiry not found." };

  if (
    user.id !== enquiry.renter_id &&
    user.id !== enquiry.provider_id &&
    !isStaff(user)
  ) {
    return { error: "You cannot close this enquiry." };
  }

  const { error } = await supabase
    .from("enquiries")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", enquiry.id);

  if (error) {
    console.error("[enquiries] close", error);
    return { error: "We could not close the enquiry." };
  }

  revalidatePath(`/enquiries/${enquiry.id}`);
  revalidatePath(`/provider/enquiries/${enquiry.id}`);
  revalidatePath("/enquiries");
  revalidatePath("/provider/enquiries");

  return { message: "Enquiry closed." };
}

const inspectionTransitions: Record<
  string,
  { from: InspectionStatus[]; to: InspectionStatus }
> = {
  confirm: { from: ["requested", "rescheduled"], to: "confirmed" },
  reschedule: { from: ["requested", "confirmed", "rescheduled"], to: "rescheduled" },
  decline: { from: ["requested", "confirmed", "rescheduled"], to: "declined" },
  cancel: { from: ["requested", "confirmed", "rescheduled"], to: "cancelled" },
  complete: { from: ["confirmed", "rescheduled"], to: "completed" },
  no_show: { from: ["confirmed", "rescheduled"], to: "no_show" },
};

const providerOnlyActions = ["confirm", "reschedule", "decline", "complete"] as const;

export async function respondToInspectionAction(
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const { error: authError, user } = await requireUser();
  if (!user) return { error: authError ?? "Unauthorized" };

  const parsed = inspectionResponseSchema.safeParse({
    inspectionId: formData.get("inspectionId"),
    action: formData.get("action"),
    scheduledAt: formData.get("scheduledAt") || undefined,
    outcome: formData.get("outcome") || undefined,
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the response." };
  }

  const supabase = await createClient();

  const { data: inspection } = await supabase
    .from("inspections")
    .select("*")
    .eq("id", parsed.data.inspectionId)
    .maybeSingle();

  if (!inspection) return { error: "Inspection not found." };

  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", inspection.enquiry_id)
    .maybeSingle();

  if (!enquiry) return { error: "Enquiry not found." };

  const staff = isStaff(user);
  const isRenter = user.id === enquiry.renter_id;
  const isProviderUser = user.id === enquiry.provider_id;

  if (!staff && !isRenter && !isProviderUser) {
    return { error: "You cannot respond to this inspection." };
  }

  const action = parsed.data.action;

  if (
    providerOnlyActions.includes(action as (typeof providerOnlyActions)[number]) &&
    !isProviderUser &&
    !staff
  ) {
    return { error: "Only the provider can do that." };
  }

  const rule = inspectionTransitions[action];
  if (!rule) return { error: "Unknown inspection action." };

  if (!rule.from.includes(inspection.status)) {
    return {
      error: `This inspection is "${inspection.status}" and cannot move to "${rule.to}".`,
    };
  }

  const updates: TablesUpdate<"inspections"> = { status: rule.to };
  const notes = parsed.data.notes?.trim() || null;

  if (action === "reschedule") {
    if (!parsed.data.scheduledAt) {
      return { error: "Pick a new date and time." };
    }
    const nextTime = new Date(parsed.data.scheduledAt);
    if (nextTime.getTime() <= Date.now()) {
      return { error: "Choose a time in the future." };
    }
    updates.scheduled_at = nextTime.toISOString();
    updates.notes = notes ?? inspection.notes;
  }

  if (action === "complete") {
    updates.completed_at = new Date().toISOString();
    updates.outcome = parsed.data.outcome ?? "unknown";
    updates.outcome_notes = notes;
  }

  if (action === "no_show") {
    updates.outcome = isRenter ? "no_show_provider" : "no_show_renter";
    updates.outcome_notes = notes;
  }

  if (action === "decline" || action === "cancel") {
    updates.outcome_notes = notes;
  }

  const { error } = await supabase
    .from("inspections")
    .update(updates)
    .eq("id", inspection.id);

  if (error) {
    console.error("[enquiries] inspection update", error);
    return { error: "We could not update the inspection." };
  }

  if (action === "complete" || action === "confirm" || action === "reschedule") {
    if (enquiry.lead_stage !== "rented" && enquiry.lead_stage !== "lost") {
      await supabase
        .from("enquiries")
        .update({
          lead_stage: action === "complete" ? "inspected" : "inspection_scheduled",
        })
        .eq("id", enquiry.id);
    }
  }

  const recipients = staff
    ? [enquiry.renter_id, enquiry.provider_id]
    : [user.id === enquiry.renter_id ? enquiry.provider_id : enquiry.renter_id];

  const notificationFor = {
    confirm: {
      type: "inspection_confirmed" as const,
      title: "Inspection confirmed",
      body: `Confirmed for ${new Date(updates.scheduled_at ?? inspection.scheduled_at).toLocaleString("en-NG")}.`,
    },
    reschedule: {
      type: "inspection_rescheduled" as const,
      title: "Inspection rescheduled",
      body: `New time: ${new Date(updates.scheduled_at ?? inspection.scheduled_at).toLocaleString("en-NG")}.`,
    },
    decline: {
      type: "inspection_cancelled" as const,
      title: "Inspection declined",
      body: notes ?? "The provider declined this inspection.",
    },
    cancel: {
      type: "inspection_cancelled" as const,
      title: "Inspection cancelled",
      body: notes ?? "This inspection was cancelled.",
    },
  } satisfies Partial<
    Record<string, { type: "inspection_confirmed" | "inspection_rescheduled" | "inspection_cancelled"; title: string; body: string }>
  >;

  const notice = notificationFor[action as keyof typeof notificationFor];
  if (notice) {
    await Promise.all(
      recipients.map((recipientId) =>
        supabase.rpc("notify_user", {
          target_user: recipientId,
          notice_type: notice.type,
          notice_title: notice.title,
          notice_body: notice.body,
          notice_href: hrefFor(recipientId, enquiry),
        }),
      ),
    );
  }

  revalidatePath(`/enquiries/${enquiry.id}`);
  revalidatePath(`/provider/enquiries/${enquiry.id}`);
  revalidatePath("/inspections");

  return { message: "Inspection updated." };
}
