import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next")) ?? "/dashboard";
  const errorDescription =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (errorDescription) {
    const params = new URLSearchParams({ error: errorDescription });
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  if (!code) {
    const params = new URLSearchParams({
      error: "That link is missing a confirmation code. Request a new one.",
    });
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const params = new URLSearchParams({ error: error.message });

    if (error.code) {
      params.set("error_code", error.code);
    }

    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
