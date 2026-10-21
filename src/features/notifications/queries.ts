import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

async function safeQuery<T>(
  operation: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      console.error("[notifications-query]", error);
      return fallback;
    }
    return data ?? fallback;
  } catch (error) {
    console.error("[notifications-query]", error);
    return fallback;
  }
}

export async function getNotifications(
  userId: string,
  limit = 50,
): Promise<Tables<"notifications">[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit),
    [] as Tables<"notifications">[],
  );
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("[notifications-query] unread count", error);
      return 0;
    }
    return count ?? 0;
  } catch (error) {
    console.error("[notifications-query] unread count", error);
    return 0;
  }
}
