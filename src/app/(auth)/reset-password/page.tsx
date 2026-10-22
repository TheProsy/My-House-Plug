import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your My House Plug account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Choose a new password
        </h1>
        <p className="text-sm text-ink-500">
          Use at least 8 characters. You will stay signed in after saving.
        </p>
      </div>

      <ResetPasswordForm />

      <p className="border-t border-line-soft pt-4 text-center text-sm text-ink-500">
        Link expired?{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          Request another reset link
        </Link>
      </p>
    </div>
  );
}
