import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeRedirectPath(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  return value;
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

export function formatNaira(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const LAGOS_TIME_ZONE = "Africa/Lagos";

export function parseLagosDateTime(value: string): Date {
  const trimmed = value.trim();
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  return new Date(hasZone ? trimmed : `${trimmed}+01:00`);
}

export function formatRentPeriod(period: string): string {
  switch (period) {
    case "per_year":
      return "per year";
    case "per_six_months":
      return "per 6 months";
    case "per_semester":
      return "per semester";
    case "per_month":
      return "per month";
    default:
      return "";
  }
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: LAGOS_TIME_ZONE,
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: LAGOS_TIME_ZONE,
  }).format(date);
}

export function daysAgo(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function timeAgo(value: string | Date | null | undefined): string {
  const days = daysAgo(value);
  if (days === null) return "unknown";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

export function isAvailabilityStale(
  lastConfirmedAt: string | null | undefined,
  staleAfterDays = 14,
): boolean {
  const days = daysAgo(lastConfirmedAt);
  if (days === null) return true;
  return days > staleAfterDays;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function isExternalUrl(path: string): boolean {
  return /^https?:\/\//.test(path);
}

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
