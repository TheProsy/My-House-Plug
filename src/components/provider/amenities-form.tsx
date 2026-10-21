"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveAmenitiesAction } from "@/features/provider/actions";

interface AmenityOption {
  id: string;
  key: string;
  label: string;
  category: string;
}

export function AmenitiesForm({
  propertyId,
  options,
  selectedIds,
}: {
  propertyId: string;
  options: AmenityOption[];
  selectedIds: string[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const grouped = options.reduce<Record<string, AmenityOption[]>>((acc, option) => {
    (acc[option.category] ??= []).push(option);
    return acc;
  }, {});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("propertyId", propertyId);

    startTransition(async () => {
      const result = await saveAmenitiesAction(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Amenities updated.");
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <fieldset key={category}>
            <legend className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              {category}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2.5 rounded-xl border border-line-soft bg-surface-1 px-3 py-2 text-sm text-ink-700"
                >
                  <input
                    type="checkbox"
                    name="amenityIds"
                    value={option.id}
                    defaultChecked={selectedIds.includes(option.id)}
                    className="size-4 rounded border-line accent-brand-700"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Saving…" : "Save amenities"}
      </Button>
    </form>
  );
}
