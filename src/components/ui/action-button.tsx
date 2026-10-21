"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

interface ActionButtonProps extends Omit<ButtonProps, "onClick" | "type"> {
  action: (formData: FormData) => Promise<{ error?: string; message?: string } | void>;
  fields: Record<string, string>;
  confirmMessage?: string;
  successFallback?: string;
}

export function ActionButton({
  action,
  fields,
  confirmMessage,
  successFallback = "Done.",
  children,
  ...buttonProps
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      formData.set(key, value);
    }

    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result && "message" in result && result.message
          ? result.message
          : successFallback,
      );
    });
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}
