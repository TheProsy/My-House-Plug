"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { registerPhotoAction } from "@/features/provider/actions";

interface PhotoManagerProps {
  propertyId: string;
  userId: string;
}

export function PhotoUploader({ propertyId, userId }: PhotoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const supabase = createClient();

    try {
      for (const file of Array.from(files)) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/jpeg",
        });

        const path = `${userId}/${propertyId}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("property-photos")
          .upload(path, compressed, {
            contentType: "image/jpeg",
            cacheControl: "31536000",
          });

        if (uploadError) {
          toast.error(`Could not upload ${file.name}. Try a smaller image.`);
          continue;
        }

        const result = await registerPhotoAction(propertyId, path);
        if (result.error) {
          toast.error(result.error);
          continue;
        }
        toast.success("Photo added.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Check your connection and try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <Button
        type="button"
        variant="secondary"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ImagePlus className="size-4" aria-hidden="true" />
        )}
        {isUploading ? "Uploading…" : "Add photos"}
      </Button>
      <p className="text-xs text-ink-400">
        JPG, PNG, or WebP. Photos are compressed before upload.
      </p>
    </div>
  );
}
