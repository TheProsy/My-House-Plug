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
    error: authError,
  } = await supabase.auth.getUser();

  if (authError && authError.name !== "AuthSessionMissingError") {
    console.error("[auth] getUser failed", authError.message);
  }

  if (!user) return null;

  const [profileResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  if (profileResult.error) {
    console.error("[auth] profile lookup failed", profileResult.error.message);
    throw new Error("We could not load your account profile.");
  }

  let profile = profileResult.data;

  if (!profile) {
    const { error: repairError } = await supabase.rpc("ensure_own_profile");

    if (repairError) {
      console.error("[auth] profile repair failed", repairError.message);
    }

    const retry = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (retry.error) {
      console.error("[auth] profile reload failed", retry.error.message);
      throw new Error("We could not load your account profile.");
    }

    profile = retry.data;
  }

  if (!profile) {
    console.error("[auth] account is missing a profile", user.id);
    return null;
  }

  if (rolesResult.error) {
    console.error("[auth] role lookup failed", rolesResult.error.message);
  }

  return {
    id: user.id,
    email: user.email ?? null,
    profile,
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

export function homePathForRoles(roles: Iterable<AppRole>): string {
  const set = new Set(roles);

  if (set.has("admin") || set.has("moderator") || set.has("verifier")) {
    return "/admin/dashboard";
  }

  if (set.has("landlord") || set.has("agent")) {
    return "/provider/dashboard";
  }

  return "/dashboard";
}
