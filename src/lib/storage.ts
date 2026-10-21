import { isExternalUrl } from "@/lib/utils";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function propertyPhotoUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (isExternalUrl(path)) return path;
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/property-photos/${path}`;
}

export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (isExternalUrl(path)) return path;
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
}
