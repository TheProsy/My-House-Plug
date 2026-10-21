import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProviderNav } from "@/components/provider/provider-nav";
import { Logo } from "@/components/navigation/logo";
import { getSessionUser, isProvider } from "@/features/authentication/queries";

export default async function ProviderLayout({
  children,
}: LayoutProps<"/provider">) {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/provider/dashboard")}`);
  }

  if (!isProvider(user)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
        <Logo />
        <div className="flex size-14 items-center justify-center rounded-2xl bg-warning-50 text-warning-700 shadow-e1">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">
            Provider access required
          </h1>
          <p className="text-sm leading-relaxed text-ink-500">
            Your account is a renter account, so it cannot manage listings.
            You can upgrade this same account to list as a landlord or agent.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/become-a-provider">Become a provider</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/support">Contact support</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-0">
      <header className="sticky top-0 z-40 border-b border-line-soft bg-surface-1/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500 sm:inline">
              Provider
            </span>
          </div>
          <Link
            href="/search"
            className="text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
          >
            View marketplace
          </Link>
        </div>
        <div className="border-t border-line-soft px-4 py-2 lg:hidden">
          <ProviderNav orientation="horizontal" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-line-soft bg-surface-2 p-3 shadow-e1">
            <ProviderNav />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
