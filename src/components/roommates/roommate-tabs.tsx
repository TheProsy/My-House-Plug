import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "browse", href: "/roommates", label: "Browse" },
  { key: "interests", href: "/roommates/interests", label: "Interests" },
  { key: "profile", href: "/roommates/profile", label: "My profile" },
] as const;

export function RoommateTabs({
  active,
}: {
  active: "browse" | "interests" | "profile";
}) {
  return (
    <div className="hide-scrollbar flex gap-1 overflow-x-auto">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            active === tab.key
              ? "border-brand-700 bg-brand-700 text-white"
              : "border-line bg-surface-2 text-ink-600 hover:bg-surface-1",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
