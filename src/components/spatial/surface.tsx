import * as React from "react";
import { cn } from "@/lib/utils";

type SurfaceLevel = 0 | 1 | 2 | 3 | 4;

const surfaceStyles: Record<SurfaceLevel, string> = {
  0: "bg-surface-0",
  1: "bg-surface-1 border border-line-soft",
  2: "bg-surface-2 border border-line-soft shadow-e1",
  3: "bg-surface-3 border border-line-soft shadow-e3",
  4: "bg-surface-4 border border-line-soft shadow-e4",
};

interface SpatialSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: SurfaceLevel;
  radius?: "md" | "lg" | "xl" | "2xl" | "3xl" | "none";
}

export function SpatialSurface({
  level = 1,
  radius = "xl",
  className,
  ...props
}: SpatialSurfaceProps) {
  return (
    <div
      className={cn(
        surfaceStyles[level],
        radius !== "none" && `rounded-${radius}`,
        className,
      )}
      {...props}
    />
  );
}

interface ElevatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function ElevatedCard({
  interactive = false,
  className,
  ...props
}: ElevatedCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line-soft bg-surface-2 shadow-e1",
        interactive &&
          "transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-spatial)] hover:-translate-y-0.5 hover:shadow-e3",
        className,
      )}
      {...props}
    />
  );
}

export function FloatingPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line-soft bg-surface-3 shadow-e4",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="text-sm leading-relaxed text-ink-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
