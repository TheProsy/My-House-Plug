import Link from "next/link";
import { Logo } from "@/components/navigation/logo";
import { SITE_TAGLINE } from "@/lib/constants";

const columns = [
  {
    heading: "Explore",
    links: [
      { href: "/search", label: "Find a home" },
      { href: "/roommates", label: "Find a roommate" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    heading: "Providers",
    links: [
      { href: "/register?type=landlord", label: "List a property" },
      { href: "/register?type=agent", label: "Join as an agent" },
      { href: "/provider/dashboard", label: "Provider dashboard" },
    ],
  },
  {
    heading: "Trust & support",
    links: [
      { href: "/how-it-works#verification", label: "Verification explained" },
      { href: "/report", label: "Report a listing" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy notice" },
      { href: "/terms", label: "Platform terms" },
      { href: "/fees", label: "Fees & commissions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line-soft bg-surface-1 pb-24 md:pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-ink-500">
              {SITE_TAGLINE}
            </p>
            <p className="text-xs leading-relaxed text-ink-400">
              Verification labels show exactly what was checked and when. They
              are not a guarantee against every risk.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                {column.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-600 transition-colors hover:text-brand-800"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line-soft pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MY AGENT. Working product name.</p>
          <p>Made for Nigerian campus communities.</p>
        </div>
      </div>
    </footer>
  );
}
