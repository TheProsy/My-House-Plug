"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TERMS_VERSION } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, safeRedirectPath } from "@/lib/utils";
import {
  changePasswordSchema,
  emailSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/schemas/auth";
import { authErrorMessage, isRateLimitError } from "./errors";
import { homePathForRoles, isProvider, getSessionUser } from "./queries";

export interface AuthActionState {
  error?: string;
  message?: string;
  code?: string;
  email?: string;
}

function callbackUrl(next: string): string {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    if (error) console.error("[auth] sign in", error.code, error.message);
    return {
      ...authErrorMessage(
        error ?? { message: "Sign in failed" },
        "We could not sign you in right now. Try again.",
      ),
      email: parsed.data.email,
    };
  }

  const requested = safeRedirectPath(formData.get("redirectTo") as string | null);

  let fallback = "/dashboard";
  if (!requested) {
    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    if (roleError) {
      console.error("[auth] role lookup after sign in", roleError.message);
    }

    fallback = homePathForRoles((roleRows ?? []).map((row) => row.role));
  }

  revalidatePath("/", "layout");
  redirect(requested ?? fallback);
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    accountType: formData.get("accountType") || "renter",
    acceptTerms: formData.get("acceptTerms") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const requested = safeRedirectPath(formData.get("redirectTo") as string | null);
  const fallback =
    parsed.data.accountType === "renter" ? "/dashboard" : "/provider/dashboard";
  const next = requested ?? fallback;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        account_type: parsed.data.accountType,
        terms_accepted: true,
        terms_version: TERMS_VERSION,
      },
      emailRedirectTo: callbackUrl(next),
    },
  });

  if (error) {
    if (error.code !== "user_already_exists") {
      console.error("[auth] sign up", error.code, error.message);
    }
    return {
      ...authErrorMessage(
        error,
        "We could not create your account. Try again.",
      ),
      email: parsed.data.email,
    };
  }

  if (data.user && data.user.identities?.length === 0) {
    return {
      message:
        "If an account already exists for this email, sign in or reset your password instead.",
      email: parsed.data.email,
    };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }

  return {
    message: `Check ${parsed.data.email} for a confirmation link, then sign in to continue.`,
    email: parsed.data.email,
  };
}

export async function resendConfirmationAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    return { error: "Enter the email address you signed up with." };
  }

  const requested = safeRedirectPath(formData.get("redirectTo") as string | null);
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: callbackUrl(requested ?? "/dashboard") },
  });

  if (error && !isRateLimitError(error)) {
    console.error("[auth] resend confirmation", error.code, error.message);
  }

  if (error && isRateLimitError(error)) {
    return { error: "Too many requests. Wait a minute and try again." };
  }

  return {
    message:
      "If that email still needs confirmation, a new link is on its way. Check your inbox and spam folder.",
  };
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: callbackUrl("/reset-password"),
  });

  if (error && !isRateLimitError(error)) {
    console.error("[auth] password reset request", error.code, error.message);
  }

  if (error && isRateLimitError(error)) {
    return { error: "Too many requests. Wait a few minutes and try again." };
  }

  return {
    message:
      "If an account exists for that email, we've sent a password reset link. Check your inbox and spam folder.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "This reset link has expired or was opened in a different browser. Request a new link from the sign-in page.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("[auth] password update", error.code, error.message);
    return authErrorMessage(error, "We could not update your password. Try again.");
  }

  revalidatePath("/", "layout");
  const session = await getSessionUser();
  redirect(homePathForRoles(session?.roles ?? []));
}

export async function changePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "You need to sign in first." };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError) {
    return { error: "Current password is incorrect." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("[auth] change password", error.code, error.message);
    return authErrorMessage(error, "We could not update your password. Try again.");
  }

  const { error: signOutError } = await supabase.auth.signOut({
    scope: "others",
  });

  if (signOutError) {
    console.error("[auth] revoke other sessions", signOutError.message);
  }

  revalidatePath("/", "layout");
  return { message: "Password updated." };
}

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[auth] sign out", error.message);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function upgradeToProviderAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const requestedRole = formData.get("requestedRole");

  if (requestedRole !== "landlord" && requestedRole !== "agent") {
    return { error: "Choose whether you are a landlord or an agent." };
  }

  if (formData.get("acceptProviderTerms") !== "on") {
    return { error: "Accept the provider terms to continue." };
  }

  const user = await getSessionUser();

  if (!user) {
    return { error: "You need to sign in first." };
  }

  if (isProvider(user)) {
    redirect("/provider/dashboard");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("upgrade_to_provider", {
    requested_role: requestedRole,
  });

  if (error) {
    console.error("[auth] provider upgrade", error.message);
    return { error: "We could not upgrade your account. Try again." };
  }

  revalidatePath("/", "layout");
  redirect("/provider/dashboard");
}

export async function updateProfileAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || "",
    bio: formData.get("bio") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in first." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      bio: parsed.data.bio || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "We could not save your profile. Try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { message: "Profile updated." };
}
