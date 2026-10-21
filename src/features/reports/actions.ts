"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/features/authentication/queries";
import { reportSchema } from "@/schemas/report";

export interface ReportActionState {
  error?: string;
  message?: string;
}

export async function submitReportAction(
  _prevState: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  const user = await getSessionUser();

  if (!user) {
    return { error: "You need to sign in to report a listing." };
  }

  const parsed = reportSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason"),
    details: formData.get("details") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("target_type", parsed.data.targetType)
    .eq("target_id", parsed.data.targetId)
    .in("status", ["open", "triaged", "investigating"])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { message: "You already have an open report for this listing. Our team is on it." };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
  });

  if (error) {
    console.error("[reports] create", error);
    return { error: "We could not submit your report. Try again." };
  }

  revalidatePath("/admin/reports");
  revalidatePath("/admin/dashboard");

  return {
    message:
      "Report submitted. Our moderation team will review it, and you may be contacted for more detail.",
  };
}
