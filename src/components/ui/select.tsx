import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-11 w-full appearance-none rounded-md border border-line bg-surface-2 pl-3 pr-9 text-sm text-ink-900 shadow-e1 transition-[border-color] duration-[var(--duration-fast)] focus-visible:border-brand-500 aria-invalid:border-danger-600 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
    />
  </div>
));
Select.displayName = "Select";

export { Select };
