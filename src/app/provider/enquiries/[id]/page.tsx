import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EnquiryDetailView } from "@/components/enquiries/enquiry-detail-view";
import { getSessionUser, isStaff } from "@/features/authentication/queries";
import { getEnquiryDetail } from "@/features/enquiries/queries";

interface ProviderEnquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProviderEnquiryDetailPage({
  params,
}: ProviderEnquiryDetailPageProps) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user) notFound();

  const detail = await getEnquiryDetail(id);
  if (!detail) notFound();

  const isRenterViewer = user.id === detail.enquiry.renter_id;
  const isProviderViewer = user.id === detail.enquiry.provider_id;

  if (!isRenterViewer && !isProviderViewer && !isStaff(user)) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={isRenterViewer && !isProviderViewer ? "/enquiries" : "/provider/enquiries"}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to enquiries
      </Link>

      <EnquiryDetailView
        detail={detail}
        viewerId={user.id}
        perspective={isProviderViewer || !isRenterViewer ? "provider" : "renter"}
      />
    </div>
  );
}
