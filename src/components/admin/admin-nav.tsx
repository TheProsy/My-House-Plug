"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  Flag,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/admin/verification", label: "Verification", icon: BadgeCheck },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export function AdminNav({
  orientation = "horizontal",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Administration"
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "hide-scrollbar flex gap-1 overflow-x-auto",
      )}
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              orientation === "horizontal" && "shrink-0",
              active
                ? "bg-brand-50 text-brand-800"
                : "text-ink-600 hover:bg-surface-1 hover:text-ink-900",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
