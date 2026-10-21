import Link from "next/link";
import { Bell } from "lucide-react";
import { AuthMenu } from "@/components/navigation/auth-menu";
import { Logo } from "@/components/navigation/logo";
import { MainNav } from "@/components/navigation/main-nav";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { getSessionUser, isProvider, isStaff } from "@/features/authentication/queries";
import { getUnreadNotificationCount } from "@/features/notifications/queries";

export async function SiteHeader() {
  const user = await getSessionUser();
  const unreadCount = user ? await getUnreadNotificationCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-surface-1/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Logo />
        </div>

        <MainNav />

        <div className="flex items-center gap-1.5">
          {user && (
            <Link
              href="/notifications"
              className="relative inline-flex size-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface-2 hover:text-ink-900"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-semibold leading-4 text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          <AuthMenu
            user={
              user
                ? {
                    name: user.profile.full_name || user.email || "Account",
                    email: user.email,
                    avatarUrl: user.profile.avatar_url,
                    isProvider: isProvider(user),
                    isStaff: isStaff(user),
                  }
                : null
            }
          />
        </div>
      </div>
    </header>
  );
}
