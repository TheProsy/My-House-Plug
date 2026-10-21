"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isStaff } from "@/features/authentication/queries";
import { updateListingMetadata } from "@/features/admin/queries";
import type { TablesInsert } from "@/types/database";

export interface AdminActionState {
  error?: string;
  message?: string;
}

async function requireStaff() {
  const user = await getSessionUser();
  if (!user) return { error: "You need to sign in." as const, user: null };
  if (!isStaff(user)) {
    return { error: "Staff access required." as const, user: null };
  }
  return { error: null, user };
}

async function recordModerationAction(
  input: TablesInsert<"moderation_actions">,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("moderation_actions").insert(input);
  if (error) {
    console.error("[admin] moderation action", error);
  }
}

export async function reviewListingAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { error: authError, user } = await requireStaff();
  if (!user) return { error: authError ?? "Unauthorized" };

  const listingId = String(formData.get("listingId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!listingId) return { error: "Missing listing." };
  if (!["approve", "reject", "request_changes"].includes(decision)) {
    return { error: "Unknown decision." };
  }
  if (decision !== "approve" && notes.length < 5) {
    return { error: "Add a short reason (at least 5 characters)." };
  }

  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("id, owner_id, title, slug, listing_status")
    .eq("id", listingId)
    .maybeSingle();

  if (!property) return { error: "Listing not found." };
  if (property.listing_status !== "pending_review") {
    return {
      error: `This listing is "${property.listing_status}" and is not in the review queue.`,
    };
  }

  const statusMap = {
    approve: "published",
    reject: "rejected",
    request_changes: "changes_requested",
  } as const;

  const nextStatus = statusMap[decision as keyof typeof statusMap];

  const { error: updateError } = await supabase
    .from("properties")
    .update({ listing_status: nextStatus })
    .eq("id", property.id);

  if (updateError) {
    console.error("[admin] review listing", updateError);
    return { error: "We could not update the listing." };
  }

  await updateListingMetadata(property.id, {
    moderation_reason: notes || null,
    moderation_at: new Date().toISOString(),
    moderation_by: user.id,
  });

  const actionMap = {
    approve: "listing_approved",
    reject: "listing_rejected",
    request_changes: "other",
  } as const;

  await recordModerationAction({
    moderator_id: user.id,
    target_type: "property",
    target_id: property.id,
    action: actionMap[decision as keyof typeof actionMap],
    notes: notes || "Approved from the review queue.",
  });

  if (decision === "approve") {
    await supabase.rpc("notify_user", {
      target_user: property.owner_id,
      notice_type: "listing_approved",
      notice_title: "Your listing is live",
      notice_body: `"${property.title}" passed review and is now visible to renters.`,
      notice_href: `/provider/properties/${property.id}`,
    });
  } else if (decision === "reject") {
    await supabase.rpc("notify_user", {
      target_user: property.owner_id,
      notice_type: "listing_rejected",
      notice_title: "Your listing was rejected",
      notice_body: notes,
      notice_href: `/provider/properties/${property.id}`,
    });
  } else {
    await supabase.rpc("notify_user", {
      target_user: property.owner_id,
      notice_type: "listing_rejected",
      notice_title: "Changes requested on your listing",
      notice_body: notes,
      notice_href: `/provider/properties/${property.id}`,
    });
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${property.id}`);

  return {
    message:
      decision === "approve"
        ? "Listing approved and published."
        : decision === "reject"
          ? "Listing rejected."
          : "Changes requested.",
  };
}

export async function moderateListingAction(
  formData: FormData,
): Promise<AdminActionState> {
  const { error: authError, user } = await requireStaff();
  if (!user) return { error: authError ?? "Unauthorized" };

  const listingId = String(formData.get("listingId") ?? "");
  const transition = String(formData.get("transition") ?? "");
  if (!listingId) return { error: "Missing listing." };

  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("id, owner_id, title, listing_status")
    .eq("id", listingId)
    .maybeSingle();

  if (!property) return { error: "Listing not found." };

  if (transition === "suspend") {
    if (!["published", "paused", "pending_review"].includes(property.listing_status)) {
      return { error: `Cannot suspend a "${property.listing_status}" listing.` };
    }

    const { error } = await supabase
      .from("properties")
      .update({ listing_status: "suspended" })
      .eq("id", property.id);

    if (error) {
      console.error("[admin] suspend listing", error);
      return { error: "We could not suspend the listing." };
    }

    await recordModerationAction({
      moderator_id: user.id,
      target_type: "property",
      target_id: property.id,
      action: "listing_suspended",
    });

    await supabase.rpc("notify_user", {
      target_user: property.owner_id,
      notice_type: "system",
      notice_title: "Your listing was suspended",
      notice_body: `"${property.title}" is hidden while our team reviews it. Contact support if you think this is a mistake.`,
      notice_href: `/provider/properties/${property.id}`,
    });

    revalidatePath("/admin/listings");
    revalidatePath("/admin/dashboard");
    return { message: "Listing suspended." };
  }

  if (transition === "reinstate") {
    if (property.listing_status !== "suspended") {
      return { error: "Only suspended listings can be reinstated." };
    }

    const { error } = await supabase
      .from("properties")
      .update({ listing_status: "published" })
      .eq("id", property.id);

    if (error) {
      console.error("[admin] reinstate listing", error);
      return { error: "We could not reinstate the listing." };
    }

    await recordModerationAction({
      moderator_id: user.id,
      target_type: "property",
      target_id: property.id,
      action: "listing_approved",
      notes: "Reinstated after review.",
    });

    await supabase.rpc("notify_user", {
      target_user: property.owner_id,
      notice_type: "listing_approved",
      notice_title: "Your listing is live again",
      notice_body: `"${property.title}" has been reinstated.`,
      notice_href: `/provider/properties/${property.id}`,
    });

    revalidatePath("/admin/listings");
    revalidatePath("/admin/dashboard");
    return { message: "Listing reinstated." };
  }

  return { error: "Unknown moderation action." };
}

const EXPIRY_DAYS: Record<string, number> = {
  identity: 365,
  property_authorization: 365,
  property_visit: 180,
};

export async function decideVerificationAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { error: authError, user } = await requireStaff();
  if (!user) return { error: authError ?? "Unauthorized" };

  const caseId = String(formData.get("caseId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const expiryDaysInput = Number(formData.get("expiryDays") ?? "");

  if (!caseId) return { error: "Missing verification case." };
  if (!["approve", "reject", "request_info"].includes(decision)) {
    return { error: "Unknown decision." };
  }

  const supabase = await createClient();
  const { data: verificationCase } = await supabase
    .from("verification_cases")
    .select("*")
    .eq("id", caseId)
    .maybeSingle();

  if (!verificationCase) return { error: "Verification case not found." };

  const reviewedAt = new Date().toISOString();
  let expiresAt: string | null = null;

  if (decision === "approve") {
    const days =
      Number.isFinite(expiryDaysInput) && expiryDaysInput >= 30 && expiryDaysInput <= 730
        ? expiryDaysInput
        : EXPIRY_DAYS[verificationCase.check_type] ?? 365;
    expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  const statusMap = {
    approve: "verified",
    reject: "rejected",
    request_info: "more_info_required",
  } as const;

  const { error } = await supabase
    .from("verification_cases")
    .update({
      status: statusMap[decision as keyof typeof statusMap],
      reviewed_by: user.id,
      reviewed_at: reviewedAt,
      notes: notes || verificationCase.notes,
      expires_at: expiresAt,
    })
    .eq("id", verificationCase.id);

  if (error) {
    console.error("[admin] verification decision", error);
    return { error: "We could not update the case." };
  }

  const actionMap = {
    approve: "verification_approved",
    reject: "verification_rejected",
    request_info: "other",
  } as const;

  await recordModerationAction({
    moderator_id: user.id,
    target_type: "verification_case",
    target_id: verificationCase.id,
    action: actionMap[decision as keyof typeof actionMap],
    notes: notes || null,
  });

  let subjectUserId: string | null = null;
  let subjectLabel = "your verification";

  if (verificationCase.subject_type === "user") {
    subjectUserId = verificationCase.subject_id;
    subjectLabel = "your identity check";
  } else {
    const { data: property } = await supabase
      .from("properties")
      .select("owner_id, title")
      .eq("id", verificationCase.subject_id)
      .maybeSingle();
    subjectUserId = property?.owner_id ?? null;
    subjectLabel = property ? `"${property.title}"` : "your property check";
  }

  if (subjectUserId) {
    if (decision === "request_info") {
      await supabase.rpc("notify_user", {
        target_user: subjectUserId,
        notice_type: "verification_more_info",
        notice_title: "We need more information",
        notice_body:
          `${subjectLabel} needs extra evidence: ${notes || "open your verification page to see what is required."}`,
        notice_href: "/provider/verification",
      });
    } else {
      await supabase.rpc("notify_user", {
        target_user: subjectUserId,
        notice_type: "system",
        notice_title:
          decision === "approve" ? "Verification approved" : "Verification not approved",
        notice_body:
          decision === "approve"
            ? `${subjectLabel} is now verified. The badge shows on your profile and listings.`
            : `${subjectLabel} was not approved. ${notes}`,
        notice_href: "/provider/verification",
      });
    }
  }

  revalidatePath("/admin/verification");
  revalidatePath(`/admin/verification/${verificationCase.id}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/provider/verification");

  return {
    message:
      decision === "approve"
        ? "Verification approved."
        : decision === "reject"
          ? "Verification rejected."
          : "More information requested.",
  };
}

export async function resolveReportAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { error: authError, user } = await requireStaff();
  if (!user) return { error: authError ?? "Unauthorized" };

  const reportId = String(formData.get("reportId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const targetAction = String(formData.get("targetAction") ?? "none");

  if (!reportId) return { error: "Missing report." };
  if (!["resolve", "dismiss", "investigate"].includes(decision)) {
    return { error: "Unknown decision." };
  }
  if (decision !== "investigate" && notes.length < 5) {
    return { error: "Add a short resolution note (at least 5 characters)." };
  }

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();

  if (!report) return { error: "Report not found." };

  const isResolved = decision === "resolve" || decision === "dismiss";
  const statusMap = {
    resolve: "resolved",
    dismiss: "dismissed",
    investigate: "investigating",
  } as const;

  const { error } = await supabase
    .from("reports")
    .update({
      status: statusMap[decision as keyof typeof statusMap],
      resolution_notes: notes || report.resolution_notes,
      resolved_at: isResolved ? new Date().toISOString() : null,
      assigned_to: user.id,
    })
    .eq("id", report.id);

  if (error) {
    console.error("[admin] resolve report", error);
    return { error: "We could not update the report." };
  }

  const actionMap = {
    resolve: "report_resolved",
    dismiss: "report_dismissed",
    investigate: "other",
  } as const;

  await recordModerationAction({
    moderator_id: user.id,
    target_type: "report",
    target_id: report.id,
    action: actionMap[decision as keyof typeof actionMap],
    notes: notes || null,
  });

  if (targetAction === "suspend_listing" && report.target_type === "listing") {
    const { data: property } = await supabase
      .from("properties")
      .select("id, owner_id, title, listing_status")
      .eq("id", report.target_id)
      .maybeSingle();

    if (property && property.listing_status !== "suspended") {
      const { error: suspendError } = await supabase
        .from("properties")
        .update({ listing_status: "suspended" })
        .eq("id", property.id);

      if (suspendError) {
        console.error("[admin] suspend listing from report", suspendError);
      } else {
        await recordModerationAction({
          moderator_id: user.id,
          target_type: "property",
          target_id: property.id,
          action: "listing_suspended",
          notes: `Suspended after report ${report.id}.`,
        });

        await supabase.rpc("notify_user", {
          target_user: property.owner_id,
          notice_type: "system",
          notice_title: "Your listing was suspended",
          notice_body: `"${property.title}" is hidden while our team reviews a report.`,
          notice_href: `/provider/properties/${property.id}`,
        });
      }
    }
  }

  if (report.reporter_id) {
    await supabase.rpc("notify_user", {
      target_user: report.reporter_id,
      notice_type: "report_update",
      notice_title:
        decision === "dismiss"
          ? "Your report was reviewed"
          : decision === "resolve"
            ? "Your report was resolved"
            : "Your report is being investigated",
      notice_body:
        decision === "investigate"
          ? "Our team is looking into it. We will update you when there is a decision."
          : notes,
      notice_href: report.target_type === "listing" ? undefined : "/support",
    });
  }

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${report.id}`);
  revalidatePath("/admin/dashboard");

  return {
    message:
      decision === "resolve"
        ? "Report resolved."
        : decision === "dismiss"
          ? "Report dismissed."
          : "Report marked as investigating.",
  };
}
