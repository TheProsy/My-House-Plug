import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Tables } from "@/types/database";

export interface SessionUser {
  id: string;
  email: string | null;
  profile: Tables<"profiles">;
  roles: AppRole[];
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  if (!profileResult.data) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profileResult.data,
    roles: (rolesResult.data ?? []).map((row) => row.role),
  };
});

export function hasRole(user: SessionUser | null, role: AppRole): boolean {
  return Boolean(user?.roles.includes(role));
}

export function isProvider(user: SessionUser | null): boolean {
  return Boolean(
    user?.roles.includes("landlord") || user?.roles.includes("agent"),
  );
}

export function isStaff(user: SessionUser | null): boolean {
  return Boolean(
    user?.roles.includes("verifier") ||
      user?.roles.includes("moderator") ||
      user?.roles.includes("admin"),
  );
}
