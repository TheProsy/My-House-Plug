import Image from "next/image";
import { Building2 } from "lucide-react";
import { propertyPhotoUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";

export function PropertyGallery({
  photos,
  title,
}: {
  photos: Tables<"property_photos">[];
  title: string;
}) {
  const urls = photos
    .map((photo) => propertyPhotoUrl(photo.storage_path))
    .filter((url): url is string => Boolean(url));

  if (urls.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-line-soft bg-gradient-to-br from-brand-100 via-surface-1 to-surface-0">
        <Building2 className="size-12 text-brand-700/40" aria-hidden="true" />
        <span className="sr-only">No photos provided for {title}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line-soft bg-surface-1">
        <Image
          src={urls[0]}
          alt={`${title} — main photo`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>
      {urls.length > 1 && (
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          {urls.slice(1, 6).map((url, index) => (
            <div
              key={url}
              className={cn(
                "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-line-soft bg-surface-1",
              )}
            >
              <Image
                src={url}
                alt={`${title} — photo ${index + 2}`}
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
