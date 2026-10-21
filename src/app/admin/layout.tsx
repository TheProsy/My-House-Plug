import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/navigation/logo";
import { getSessionUser, isStaff } from "@/features/authentication/queries";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/admin/dashboard")}`);
  }

  if (!isStaff(user)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
        <Logo />
        <div className="flex size-14 items-center justify-center rounded-2xl bg-danger-50 text-danger-700 shadow-e1">
          <ShieldX className="size-6" aria-hidden="true" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">
            Staff access required
          </h1>
          <p className="text-sm leading-relaxed text-ink-500">
            This area handles listing review, verification, and moderation. Ask an
            administrator to grant your account a staff role if you need access.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-0">
      <header className="sticky top-0 z-40 border-b border-line-soft bg-surface-1/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-danger-700 sm:inline">
              Staff
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
          <AdminNav orientation="horizontal" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-line-soft bg-surface-2 p-3 shadow-e1">
            <AdminNav orientation="vertical" />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
