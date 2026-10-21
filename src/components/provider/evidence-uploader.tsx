"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { registerEvidenceAction } from "@/features/provider/actions";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export function EvidenceUploader({
  caseId,
  userId,
}: {
  caseId: string;
  userId: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState("document");
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }

    setIsUploading(true);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const isPdf = file.type === "application/pdf";

        if (isPdf && file.size > MAX_PDF_BYTES) {
          toast.error("PDF must be under 10 MB.");
          return;
        }

        let upload: Blob = file;
        const extension = isPdf ? "pdf" : "jpg";

        if (!isPdf) {
          upload = await imageCompression(file, {
            maxSizeMB: 2,
            maxWidthOrHeight: 2200,
            useWebWorker: true,
            fileType: "image/jpeg",
          });
        }

        const path = `${userId}/${caseId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("verification-evidence")
          .upload(path, upload, {
            contentType: isPdf ? "application/pdf" : "image/jpeg",
          });

        if (uploadError) {
          toast.error("Upload failed. Try again.");
          return;
        }

        const result = await registerEvidenceAction(caseId, path, kind);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success(result.message ?? "Evidence attached.");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Upload failed. Check your connection.");
      } finally {
        setIsUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-40 flex-1">
        <label htmlFor={`evidence-file-${caseId}`} className="text-xs font-medium text-ink-500">
          Evidence file
        </label>
        <Input
          id={`evidence-file-${caseId}`}
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="pt-2"
        />
      </div>
      <div>
        <label htmlFor={`evidence-kind-${caseId}`} className="text-xs font-medium text-ink-500">
          Type
        </label>
        <Select
          id={`evidence-kind-${caseId}`}
          value={kind}
          onChange={(event) => setKind(event.target.value)}
        >
          <option value="document">Document</option>
          <option value="id_card">ID card</option>
          <option value="ownership">Ownership proof</option>
          <option value="mandate">Written mandate</option>
          <option value="property_photo">Property photo</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <Button type="submit" variant="secondary" disabled={isUploading || isPending}>
        {isUploading || isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="size-4" aria-hidden="true" />
        )}
        {isUploading || isPending ? "Uploading…" : "Upload evidence"}
      </Button>
    </form>
  );
}
