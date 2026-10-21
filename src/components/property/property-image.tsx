import Image from "next/image";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}

export function PropertyImage({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: PropertyImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-brand-100 via-surface-1 to-surface-0",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <Building2 className="size-10 text-brand-700/40" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
