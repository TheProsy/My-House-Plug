"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (path: string) => path === "/" },
  {
    href: "/search",
    label: "Search",
    icon: Search,
    match: (path: string) => path.startsWith("/search") || path.startsWith("/properties"),
  },
  {
    href: "/saved",
    label: "Saved",
    icon: Heart,
    match: (path: string) => path.startsWith("/saved"),
  },
  {
    href: "/profile",
    label: "Account",
    icon: UserRound,
    match: (path: string) =>
      path.startsWith("/profile") ||
      path.startsWith("/enquiries") ||
      path.startsWith("/inspections"),
  },
];

export function MobileTabBar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/provider")) {
    return null;
  }

  return (
    <nav
      aria-label="Primary mobile"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-surface-2/95 pt-1 backdrop-blur-sm md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const href =
            tab.href === "/saved" || tab.href === "/profile"
              ? isAuthenticated
                ? tab.href
                : `/login?redirectTo=${encodeURIComponent(tab.href)}`
              : tab.href;
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-brand-800"
                    : "text-ink-500 hover:text-ink-900",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg transition-colors",
                    active ? "bg-brand-50" : "bg-transparent",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
