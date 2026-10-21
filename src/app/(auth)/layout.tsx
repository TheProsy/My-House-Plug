import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/navigation/logo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const promises = [
  "Known move-in costs on every listing — including unconfirmed amounts.",
  "Separate identity, authorization, and visit checks you can read.",
  "Inspection requests with a clear, trackable response.",
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_0%_0%,rgba(52,211,153,0.18),transparent_60%),radial-gradient(60%_50%_at_100%_100%,rgba(6,78,59,0.9),transparent_60%)]"
        />
        <Link href="/" className="relative inline-flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
            <span className="size-2 rounded-full bg-brand-300" />
          </span>
          <span className="text-sm font-bold uppercase tracking-[0.18em]">
            {SITE_NAME}
          </span>
        </Link>

        <div className="relative max-w-md space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            Nigeria-first accommodation
          </p>
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
            {SITE_TAGLINE}
          </h2>
          <ul className="space-y-3">
            {promises.map((promise) => (
              <li key={promise} className="flex items-start gap-2.5 text-sm leading-relaxed text-brand-50/90">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Check className="size-3 text-brand-200" aria-hidden="true" />
                </span>
                {promise}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs leading-relaxed text-brand-200/70">
          Verification reduces risk but is not a guarantee. Always inspect a
          property before paying.
        </p>
      </aside>

      <div className="flex min-h-dvh flex-col bg-surface-0">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:hidden">
          <Logo />
          <Link
            href="/search"
            className="text-sm font-medium text-ink-500 hover:text-brand-800"
          >
            Browse homes
          </Link>
        </header>
        <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 lg:items-center lg:py-12">
          <div className="w-full max-w-md">
            <div className="mb-6 hidden lg:block">
              <Logo />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
