import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EnquiryDetailView } from "@/components/enquiries/enquiry-detail-view";
import { getSessionUser, isStaff } from "@/features/authentication/queries";
import { getEnquiryDetail } from "@/features/enquiries/queries";

interface EnquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EnquiryDetailPage({
  params,
}: EnquiryDetailPageProps) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/enquiries/${id}`)}`);
  }

  const detail = await getEnquiryDetail(id);
  if (!detail) notFound();

  const isRenterViewer = user.id === detail.enquiry.renter_id;
  const isProviderViewer = user.id === detail.enquiry.provider_id;

  if (!isRenterViewer && !isProviderViewer && !isStaff(user)) notFound();

  const perspective = isRenterViewer ? "renter" : "provider";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href={perspective === "renter" ? "/enquiries" : "/provider/enquiries"}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to enquiries
      </Link>

      <div className="mt-4">
        <EnquiryDetailView
          detail={detail}
          viewerId={user.id}
          perspective={perspective}
        />
      </div>
    </div>
  );
}
