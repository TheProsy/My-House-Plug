import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";

const OTP_TYPES = new Set([
  "signup",
  "invite",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next =
    safeRedirectPath(searchParams.get("next")) ??
    (type === "recovery" ? "/reset-password" : "/dashboard");

  if (!tokenHash || !type || !OTP_TYPES.has(type)) {
    const params = new URLSearchParams({
      error: "That link is invalid or has expired. Request a new one.",
    });
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: type as "signup" | "invite" | "recovery" | "email_change" | "email",
    token_hash: tokenHash,
  });

  if (error) {
    const params = new URLSearchParams({ error: error.message });

    if (error.code) {
      params.set("error_code", error.code);
    }

    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
