import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/app/(auth)/register/register-form";
import {
  getSessionUser,
  homePathForRoles,
} from "@/features/authentication/queries";
import { safeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a My House Plug account to save homes, send enquiries, schedule inspections, or list a property.",
};

interface RegisterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const rawType = Array.isArray(params.type) ? params.type[0] : params.type;
  const defaultType =
    rawType === "landlord" || rawType === "agent" ? rawType : "renter";
  const rawRedirect = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;
  const safeRedirect = safeRedirectPath(rawRedirect) ?? undefined;
  const user = await getSessionUser();

  if (user) {
    redirect(safeRedirect ?? homePathForRoles(user.roles));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Create your account
        </h1>
        <p className="text-sm text-ink-500">
          Free for renters. Providers can list and manage properties from the
          same account.
        </p>
      </div>

      <RegisterForm defaultType={defaultType} redirectTo={safeRedirect} />

      <p className="border-t border-line-soft pt-4 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link
          href={
            safeRedirect
              ? `/login?redirectTo=${encodeURIComponent(safeRedirect)}`
              : "/login"
          }
          className="font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
