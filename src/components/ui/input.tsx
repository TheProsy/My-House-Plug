import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink-900 shadow-e1 transition-[border-color,box-shadow] duration-[var(--duration-fast)] placeholder:text-ink-400 focus-visible:border-brand-500 aria-invalid:border-danger-600 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
