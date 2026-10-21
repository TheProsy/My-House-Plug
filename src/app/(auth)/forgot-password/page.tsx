import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a password reset link for your MY AGENT account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Reset your password
        </h1>
        <p className="text-sm text-ink-500">
          Enter the email on your account and we will send a secure reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="border-t border-line-soft pt-4 text-center text-sm text-ink-500">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
