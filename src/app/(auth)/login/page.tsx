import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { Alert } from "@/components/ui/alert";
import {
  getSessionUser,
  homePathForRoles,
} from "@/features/authentication/queries";
import { safeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save homes, send enquiries, and track inspections.",
};

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = firstParam(params.redirectTo);
  const safeRedirect = safeRedirectPath(redirectTo) ?? undefined;
  const errorMessage = firstParam(params.error);
  const user = await getSessionUser();

  if (user) {
    redirect(safeRedirect ?? homePathForRoles(user.roles));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Welcome back
        </h1>
        <p className="text-sm text-ink-500">
          Sign in to continue your search, enquiries, and inspections.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </Alert>
      )}

      <LoginForm redirectTo={safeRedirect} />

      <p className="border-t border-line-soft pt-4 text-center text-sm text-ink-500">
        New to MY AGENT?{" "}
        <Link
          href={
            safeRedirect
              ? `/register?redirectTo=${encodeURIComponent(safeRedirect)}`
              : "/register"
          }
          className="font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
