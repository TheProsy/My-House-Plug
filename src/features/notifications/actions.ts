"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/features/authentication/queries";

export interface NotificationActionState {
  error?: string;
  message?: string;
}

export async function markNotificationReadAction(
  formData: FormData,
): Promise<NotificationActionState> {
  const user = await getSessionUser();
  if (!user) return { error: "You need to sign in." };

  const notificationId = String(formData.get("notificationId") ?? "");
  if (!notificationId) return { error: "Missing notification." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[notifications] mark read", error);
    return { error: "We could not update the notification." };
  }

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { message: "Marked as read." };
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionState> {
  const user = await getSessionUser();
  if (!user) return { error: "You need to sign in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    console.error("[notifications] mark all read", error);
    return { error: "We could not update your notifications." };
  }

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { message: "All notifications marked as read." };
}
