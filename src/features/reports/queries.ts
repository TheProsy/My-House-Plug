import { createClient } from "@/lib/supabase/server";

export interface ReportableProperty {
  id: string;
  title: string;
  slug: string;
}

export async function getReportableProperty(
  slug: string,
): Promise<ReportableProperty | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("property_listings")
    .select("id, title, slug")
    .eq("slug", slug)
    .eq("listing_status", "published")
    .maybeSingle();

  return data;
}
