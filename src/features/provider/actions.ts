"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { getSessionUser, isProvider } from "@/features/authentication/queries";
import {
  providerCostSchema,
  providerPropertySchema,
  providerUnitSchema,
} from "@/schemas/provider";
import type { ListingStatus } from "@/types/database";

export interface ProviderActionState {
  error?: string;
  message?: string;
}

async function requireProvider() {
  const user = await getSessionUser();
  if (!user) return { error: "You need to sign in." as const, user: null };
  if (!isProvider(user)) {
    return {
      error: "Only landlord or agent accounts can manage listings." as const,
      user: null,
    };
  }
  return { error: null, user };
}

function generateSlug(title: string): string {
  const base = slugify(title) || "listing";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base.slice(0, 60)}-${suffix}`;
}

export async function createProviderPropertyAction(
  _prevState: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const parsed = providerPropertySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    propertyType: formData.get("propertyType"),
    campusId: formData.get("campusId"),
    neighbourhoodId: formData.get("neighbourhoodId"),
    address: formData.get("address") ?? "",
    furnished: formData.get("furnished") ?? "unspecified",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({
      owner_id: user.id,
      slug: generateSlug(parsed.data.title),
      title: parsed.data.title,
      description: parsed.data.description,
      property_type: parsed.data.propertyType,
      campus_id: parsed.data.campusId,
      neighbourhood_id: parsed.data.neighbourhoodId,
      address: parsed.data.address || null,
      furnished:
        parsed.data.furnished === "unspecified"
          ? null
          : parsed.data.furnished === "yes",
      listing_status: "draft",
      availability_status: "unknown",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[provider] create property", error);
    return { error: "We could not save the listing. Try again." };
  }

  revalidatePath("/provider/dashboard");
  redirect(`/provider/properties/${data.id}`);
}

export async function updateProviderPropertyAction(
  _prevState: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) return { error: "Missing listing id." };

  const parsed = providerPropertySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    propertyType: formData.get("propertyType"),
    campusId: formData.get("campusId"),
    neighbourhoodId: formData.get("neighbourhoodId"),
    address: formData.get("address") ?? "",
    furnished: formData.get("furnished") ?? "unspecified",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      property_type: parsed.data.propertyType,
      campus_id: parsed.data.campusId,
      neighbourhood_id: parsed.data.neighbourhoodId,
      address: parsed.data.address || null,
      furnished:
        parsed.data.furnished === "unspecified"
          ? null
          : parsed.data.furnished === "yes",
    })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[provider] update property", error);
    return { error: "We could not save the changes. Try again." };
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  revalidatePath("/provider/dashboard");
  return { message: "Listing details saved." };
}

const allowedTransitions: Record<
  string,
  { from: ListingStatus[]; to: ListingStatus }
> = {
  submit_for_review: {
    from: ["draft", "changes_requested"],
    to: "pending_review",
  },
  withdraw_review: { from: ["pending_review"], to: "draft" },
  pause: { from: ["published"], to: "paused" },
  resume: { from: ["paused"], to: "published" },
  mark_rented: { from: ["published", "paused"], to: "rented" },
  archive: { from: ["published", "paused"], to: "archived" },
  relist: { from: ["rented", "archived"], to: "published" },
};

export async function updateListingStatusAction(
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  const transition = String(formData.get("transition") ?? "");
  const rule = allowedTransitions[transition];

  if (!propertyId || !rule) return { error: "Unknown action." };

  const supabase = await createClient();
  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select("id, listing_status")
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (fetchError || !property) {
    return { error: "Listing not found." };
  }

  if (!rule.from.includes(property.listing_status)) {
    return {
      error: `This listing cannot move to that state from "${property.listing_status}".`,
    };
  }

  if (transition === "submit_for_review") {
    const [units, photos] = await Promise.all([
      supabase
        .from("property_units")
        .select("id", { count: "exact", head: true })
        .eq("property_id", propertyId),
      supabase
        .from("property_photos")
        .select("id", { count: "exact", head: true })
        .eq("property_id", propertyId),
    ]);

    if (!units.count) {
      return { error: "Add at least one unit before submitting for review." };
    }
    if (!photos.count) {
      return { error: "Add at least one photo before submitting for review." };
    }
  }

  const { error } = await supabase
    .from("properties")
    .update({ listing_status: rule.to })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[provider] status update", error);
    return { error: "We could not update the listing status." };
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  revalidatePath("/provider/dashboard");
  return { message: `Listing updated to ${rule.to.replaceAll("_", " ")}.` };
}

export async function deleteDraftPropertyAction(
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) return { error: "Missing listing id." };

  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, listing_status")
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!property) return { error: "Listing not found." };
  if (property.listing_status !== "draft") {
    return { error: "Only drafts can be deleted. Archive it instead." };
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[provider] delete draft", error);
    return { error: "We could not delete the draft." };
  }

  revalidatePath("/provider/dashboard");
  redirect("/provider/dashboard");
}

export async function addUnitAction(
  _prevState: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) return { error: "Missing listing id." };

  const parsed = providerUnitSchema.safeParse({
    title: formData.get("title"),
    unitType: formData.get("unitType"),
    bedrooms: formData.get("bedrooms") || undefined,
    bathrooms: formData.get("bathrooms") || undefined,
    isShared: formData.get("isShared") === "on",
    rentAmount: formData.get("rentAmount"),
    rentPeriod: formData.get("rentPeriod"),
    availableFrom: formData.get("availableFrom") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the unit." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("property_units").insert({
    property_id: propertyId,
    title: parsed.data.title,
    unit_type: parsed.data.unitType,
    bedrooms: parsed.data.bedrooms ?? null,
    bathrooms: parsed.data.bathrooms ?? null,
    is_shared: parsed.data.isShared,
    rent_amount: parsed.data.rentAmount,
    rent_period: parsed.data.rentPeriod,
    available_from: parsed.data.availableFrom || null,
  });

  if (error) {
    console.error("[provider] add unit", error);
    return { error: "We could not add the unit." };
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  return { message: "Unit added." };
}

export async function removeUnitAction(
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  const unitId = String(formData.get("unitId") ?? "");
  if (!propertyId || !unitId) return { error: "Missing unit." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("property_units")
    .delete()
    .eq("id", unitId)
    .eq("property_id", propertyId);

  if (error) {
    console.error("[provider] remove unit", error);
    return { error: "We could not remove the unit." };
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  return { message: "Unit removed." };
}

export async function addCostAction(
  _prevState: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) return { error: "Missing listing id." };

  const parsed = providerCostSchema.safeParse({
    label: formData.get("label"),
    category: formData.get("category"),
    amount: formData.get("amount") || undefined,
    isKnown: formData.get("isKnown") !== "off",
    isMandatory: formData.get("isMandatory") !== "off",
    isRefundable: formData.get("isRefundable") === "on",
    recurrence: formData.get("recurrence"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the cost row." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("property_costs").insert({
    property_id: propertyId,
    label: parsed.data.label,
    category: parsed.data.category,
    amount: parsed.data.isKnown ? (parsed.data.amount ?? null) : null,
    is_known: parsed.data.isKnown,
    is_mandatory: parsed.data.isMandatory,
    is_refundable: parsed.data.isRefundable,
    recurrence: parsed.data.recurrence,
    notes: parsed.data.notes || null,
  });

  if (error) {
    console.error("[provider] add cost", error);
    return { error: "We could not add the cost." };
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  return { message: "Cost added." };
}

export async function removeCostAction(
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  const costId = String(formData.get("costId") ?? "");
  if (!propertyId || !costId) return { error: "Missing cost." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("property_costs")
    .delete()
    .eq("id", costId)
    .eq("property_id", propertyId);

  if (error) {
    console.error("[provider] remove cost", error);
    return { error: "We could not remove the cost." };
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  return { message: "Cost removed." };
}

export async function saveAmenitiesAction(
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  if (!propertyId) return { error: "Missing listing id." };

  const amenityIds = formData
    .getAll("amenityIds")
    .map((value) => String(value))
    .filter((value) => value.length > 0);

  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("property_amenities")
    .delete()
    .eq("property_id", propertyId);

  if (deleteError) {
    console.error("[provider] clear amenities", deleteError);
    return { error: "We could not update amenities." };
  }

  if (amenityIds.length > 0) {
    const { error: insertError } = await supabase
      .from("property_amenities")
      .insert(
        amenityIds.map((amenityId) => ({
          property_id: propertyId,
          amenity_id: amenityId,
        })),
      );

    if (insertError) {
      console.error("[provider] save amenities", insertError);
      return { error: "We could not save amenities." };
    }
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  return { message: "Amenities updated." };
}

export async function registerPhotoAction(
  propertyId: string,
  storagePath: string,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const supabase = await createClient();
  const { count } = await supabase
    .from("property_photos")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const { error } = await supabase.from("property_photos").insert({
    property_id: propertyId,
    storage_path: storagePath,
    is_cover: (count ?? 0) === 0,
    sort_order: count ?? 0,
  });

  if (error) {
    console.error("[provider] register photo", error);
    return { error: "The photo uploaded but we could not attach it." };
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  return { message: "Photo added." };
}

export async function deletePhotoAction(
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  if (!propertyId || !photoId) return { error: "Missing photo." };

  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("property_photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (!photo) return { error: "Photo not found." };

  const { error } = await supabase
    .from("property_photos")
    .delete()
    .eq("id", photoId)
    .eq("property_id", propertyId);

  if (error) {
    console.error("[provider] delete photo", error);
    return { error: "We could not remove the photo." };
  }

  if (!/^https?:\/\//.test(photo.storage_path)) {
    await supabase.storage.from("property-photos").remove([photo.storage_path]);
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  return { message: "Photo removed." };
}

export async function setCoverPhotoAction(
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  if (!propertyId || !photoId) return { error: "Missing photo." };

  const supabase = await createClient();
  await supabase
    .from("property_photos")
    .update({ is_cover: false })
    .eq("property_id", propertyId);

  const { error } = await supabase
    .from("property_photos")
    .update({ is_cover: true })
    .eq("id", photoId)
    .eq("property_id", propertyId);

  if (error) {
    console.error("[provider] set cover", error);
    return { error: "We could not set the cover photo." };
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  return { message: "Cover photo updated." };
}

export async function confirmAvailabilityNow(
  formData: FormData,
): Promise<ProviderActionState> {
  return confirmAvailabilityCore(formData);
}

export async function confirmAvailabilityAction(
  _prevState: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  return confirmAvailabilityCore(formData);
}

async function confirmAvailabilityCore(
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const propertyId = String(formData.get("propertyId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!propertyId) return { error: "Missing listing id." };

  const supabase = await createClient();
  const { error } = await supabase.from("availability_confirmations").insert({
    property_id: propertyId,
    confirmed_by: user.id,
    method: "provider_self",
    notes: notes || null,
  });

  if (error) {
    console.error("[provider] confirm availability", error);
    return { error: "We could not record the confirmation." };
  }

  revalidatePath(`/provider/properties/${propertyId}`);
  revalidatePath("/provider/dashboard");
  return { message: "Availability confirmed for renters." };
}

export async function registerEvidenceAction(
  caseId: string,
  storagePath: string,
  kind: string,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  if (!caseId || !storagePath) return { error: "Missing evidence details." };

  const supabase = await createClient();
  const { error } = await supabase.from("verification_evidence").insert({
    case_id: caseId,
    uploaded_by: user.id,
    storage_path: storagePath,
    kind: kind || "document",
  });

  if (error) {
    console.error("[provider] register evidence", error);
    return { error: "The file uploaded but we could not attach it." };
  }

  revalidatePath("/provider/verification");
  return { message: "Evidence attached. Our team will review it." };
}

export async function requestVerificationNow(
  formData: FormData,
): Promise<ProviderActionState> {
  return requestVerificationCore(formData);
}

export async function requestVerificationAction(
  _prevState: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  return requestVerificationCore(formData);
}

async function requestVerificationCore(
  formData: FormData,
): Promise<ProviderActionState> {
  const { error: authError, user } = await requireProvider();
  if (!user) return { error: authError ?? "Unauthorized" };

  const checkType = String(formData.get("checkType") ?? "");
  const propertyId = String(formData.get("propertyId") ?? "");

  const validTypes = ["identity", "property_authorization", "property_visit"] as const;
  if (!validTypes.includes(checkType as (typeof validTypes)[number])) {
    return { error: "Unknown verification type." };
  }

  const supabase = await createClient();

  if (checkType === "identity") {
    const { error } = await supabase.from("verification_cases").insert({
      subject_type: "user",
      subject_id: user.id,
      check_type: "identity",
      status: "pending_review",
    });
    if (error && !error.message.includes("duplicate")) {
      console.error("[provider] request identity verification", error);
      return { error: "We could not open the verification case." };
    }
  } else {
    if (!propertyId) return { error: "Missing listing id." };
    const { error } = await supabase.from("verification_cases").insert({
      subject_type: "property",
      subject_id: propertyId,
      check_type: checkType as "property_authorization" | "property_visit",
      status: "pending_review",
    });
    if (error && !error.message.includes("duplicate")) {
      console.error("[provider] request property verification", error);
      return { error: "We could not open the verification case." };
    }
    revalidatePath(`/provider/properties/${propertyId}`);
  }

  revalidatePath("/provider/verification");
  return {
    message:
      "Request received. Our verification team will review it and may contact you for evidence.",
  };
}
