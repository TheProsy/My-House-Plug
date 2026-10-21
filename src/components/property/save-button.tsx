"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleSavedAction } from "@/features/saved/actions";

interface SaveButtonProps {
  propertyId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
  className?: string;
  labelled?: boolean;
}

export function SaveButton({
  propertyId,
  initialSaved,
  isAuthenticated,
  className,
  labelled = false,
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick() {
    if (!isAuthenticated) {
      toast("Sign in to save homes", {
        description: "Your shortlist syncs across your devices.",
        action: {
          label: "Sign in",
          onClick: () =>
            router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`),
        },
      });
      return;
    }

    const next = !saved;
    setSaved(next);

    startTransition(async () => {
      const result = await toggleSavedAction(propertyId);
      if (result.error) {
        setSaved(!next);
        toast.error(result.error);
        return;
      }
      if (result.requiresAuth) {
        setSaved(!next);
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }
      toast.success(next ? "Saved to your shortlist" : "Removed from saved");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save home"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-line-soft bg-surface-2/95 px-2.5 py-2 text-sm font-medium text-ink-700 shadow-e2 transition-colors hover:bg-surface-1 disabled:opacity-60",
        labelled && "px-3.5",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          saved ? "fill-danger-600 text-danger-600" : "text-ink-500",
        )}
      />
      {labelled && (saved ? "Saved" : "Save")}
    </button>
  );
}
