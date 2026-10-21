"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/properties", label: "Listings", icon: ListChecks },
  { href: "/provider/enquiries", label: "Enquiries", icon: ClipboardList },
  { href: "/provider/properties/new", label: "New listing", icon: PlusCircle },
  { href: "/provider/verification", label: "Verification", icon: BadgeCheck },
  { href: "/profile", label: "Account", icon: UserRound },
];

export function ProviderNav({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Provider"
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "hide-scrollbar flex gap-1 overflow-x-auto",
      )}
    >
      {items.map((item) => {
        const active =
          item.href === "/provider/dashboard"
            ? pathname === "/provider/dashboard" ||
              pathname.startsWith("/provider/properties/")
            : item.href === "/provider/properties"
              ? pathname === "/provider/properties"
              : pathname.startsWith(item.href);
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
