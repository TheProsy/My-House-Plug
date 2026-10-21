import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Flag,
  ListChecks,
  Users,
} from "lucide-react";
import { getAdminOverview } from "@/features/admin/queries";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin overview",
};

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  const stats = [
    {
      label: "Listings in review",
      value: overview.pendingListings,
      href: "/admin/listings",
      icon: ListChecks,
    },
    {
      label: "Verification queue",
      value: overview.pendingVerifications,
      href: "/admin/verification",
      icon: BadgeCheck,
    },
    {
      label: "Open reports",
      value: overview.openReports,
      href: "/admin/reports",
      icon: Flag,
    },
    {
      label: "Published listings",
      value: overview.publishedListings,
      href: "/search",
      icon: ArrowUpRight,
    },
    {
      label: "Registered users",
      value: overview.totalUsers,
      href: "/admin/dashboard",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Overview
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          What needs attention across listings, verification, and safety.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 transition-shadow hover:shadow-e3"
            >
              <Icon className="size-4 text-brand-700" aria-hidden="true" />
              <p className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-ink-500">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink-900">
              Latest verification cases
            </h2>
            <Link
              href="/admin/verification"
              className="text-xs font-medium text-brand-700 hover:text-brand-800"
            >
              View queue
            </Link>
          </div>
          {overview.recentVerifications.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">No cases yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line-soft">
              {overview.recentVerifications.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/verification/${item.id}`}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">
                        {item.subjectLabel}
                      </p>
                      <p className="text-xs text-ink-400">
                        {item.check_type.replaceAll("_", " ")} ·{" "}
                        {item.status.replaceAll("_", " ")} · {timeAgo(item.created_at)}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink-900">Latest reports</h2>
            <Link
              href="/admin/reports"
              className="text-xs font-medium text-brand-700 hover:text-brand-800"
            >
              View queue
            </Link>
          </div>
          {overview.recentReports.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">No reports yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line-soft">
              {overview.recentReports.map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">
                        {REPORT_REASON_LABELS[report.reason]}
                      </p>
                      <p className="text-xs text-ink-400">
                        {report.severity} severity · {report.status} ·{" "}
                        {timeAgo(report.created_at)}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
