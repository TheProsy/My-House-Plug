"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ToggleSavedResult {
  saved?: boolean;
  requiresAuth?: boolean;
  error?: string;
}

export async function toggleSavedAction(
  propertyId: string,
): Promise<ToggleSavedResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { requiresAuth: true };
  }

  const { data: existing } = await supabase
    .from("saved_properties")
    .select("property_id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("user_id", user.id)
      .eq("property_id", propertyId);

    if (error) return { error: "Could not remove this home. Try again." };
    revalidatePath("/saved");
    return { saved: false };
  }

  const { error } = await supabase
    .from("saved_properties")
    .insert({ user_id: user.id, property_id: propertyId });

  if (error) return { error: "Could not save this home. Try again." };
  revalidatePath("/saved");
  return { saved: true };
}
