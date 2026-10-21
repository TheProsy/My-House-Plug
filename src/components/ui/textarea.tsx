import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-24 w-full rounded-md border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink-900 shadow-e1 transition-[border-color,box-shadow] duration-[var(--duration-fast)] placeholder:text-ink-400 focus-visible:border-brand-500 aria-invalid:border-danger-600 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
