import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck,
  Clock,
  MapPin,
  MessagesSquare,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PropertyImage } from "@/components/property/property-image";
import {
  EnquiryStatusBadge,
  InspectionStatusBadge,
  LeadStageBadge,
} from "@/components/enquiries/enquiry-badges";
import { EnquiryThread } from "@/components/enquiries/enquiry-thread";
import { MessageForm } from "@/components/enquiries/message-form";
import { InspectionResponseForm } from "@/components/enquiries/inspection-response-form";
import { LeadStageForm } from "@/components/enquiries/lead-stage-form";
import { closeEnquiryAction } from "@/features/enquiries/actions";
import type { EnquiryDetail } from "@/features/enquiries/queries";
import { LEAD_STAGE_LABELS } from "@/lib/constants";
import { propertyPhotoUrl } from "@/lib/storage";
import { formatDateTime, timeAgo } from "@/lib/utils";
import type { InspectionOutcome } from "@/types/database";

const OUTCOME_LABELS: Record<InspectionOutcome, string> = {
  positive: "Positive — renter interested",
  negative: "Negative — renter not interested",
  property_unavailable: "Property was unavailable",
  no_show_renter: "Renter did not show",
  no_show_provider: "Provider did not show",
  unknown: "Outcome not clear yet",
};

interface EnquiryDetailViewProps {
  detail: EnquiryDetail;
  viewerId: string;
  perspective: "renter" | "provider";
}

export function EnquiryDetailView({
  detail,
  viewerId,
  perspective,
}: EnquiryDetailViewProps) {
  const { enquiry, property, address, renter, provider, messages, inspections, leadEvents } =
    detail;

  const counterpart = perspective === "renter" ? provider : renter;
  const names: Record<string, string> = {};
  if (renter) names[renter.id] = renter.fullName;
  if (provider) names[provider.id] = provider.fullName;

  const closed = enquiry.status === "closed";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-line-soft bg-surface-2 shadow-e1">
        <div className="flex gap-3 p-4">
          <PropertyImage
            src={propertyPhotoUrl(property?.coverPhoto)}
            alt={property?.title ?? "Listing"}
            className="aspect-[4/3] w-24 shrink-0 self-start rounded-xl sm:w-32"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <EnquiryStatusBadge status={enquiry.status} />
              <LeadStageBadge stage={enquiry.lead_stage} />
            </div>
            {property ? (
              <Link
                href={`/properties/${property.slug}`}
                className="mt-1.5 block text-base font-semibold leading-snug text-ink-900 hover:text-brand-800 sm:text-lg"
              >
                {property.title}
              </Link>
            ) : (
              <p className="mt-1.5 text-base font-semibold text-ink-900">Listing</p>
            )}
            <p className="mt-1 flex items-start gap-1.5 text-xs text-ink-500">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
              {perspective === "provider"
                ? (address ?? "No exact address on file yet.")
                : "Exact address is shared when you arrange an inspection."}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
              <Clock className="size-3.5" aria-hidden="true" />
              Started {timeAgo(enquiry.created_at)} · Updated {timeAgo(enquiry.updated_at)}
            </p>
          </div>
        </div>
      </section>

      {closed && (
        <Alert variant="info">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            This enquiry is closed{enquiry.lost_reason ? ` — ${enquiry.lost_reason}` : ""}.
            The full history stays visible below.
          </span>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <MessagesSquare className="size-4 text-brand-700" aria-hidden="true" />
              Conversation
            </h2>
            <div className="mt-4">
              <EnquiryThread
                messages={messages}
                viewerId={viewerId}
                names={names}
                emptyLabel="No messages yet. Start the conversation below."
              />
            </div>
            {!closed && (
              <div className="mt-4 border-t border-line-soft pt-4">
                <MessageForm enquiryId={enquiry.id} />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
            <h2 className="text-sm font-semibold text-ink-900">Lead timeline</h2>
            {leadEvents.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">No stage changes yet.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {leadEvents.map((event) => (
                  <li key={event.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-800">
                        {LEAD_STAGE_LABELS[event.to_stage]}
                      </p>
                      <p className="text-xs text-ink-400">
                        {timeAgo(event.created_at)}
                        {event.reason ? ` · ${event.reason}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <User className="size-4 text-brand-700" aria-hidden="true" />
              {perspective === "renter" ? "Provider" : "Renter"}
            </h2>
            <p className="mt-2 text-sm font-medium text-ink-800">
              {counterpart?.fullName ?? "Unknown"}
            </p>

            {perspective === "provider" && counterpart?.phone && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-600">
                <Phone className="size-3.5 text-ink-400" aria-hidden="true" />
                {counterpart.phone}
                <Badge variant="neutral" className="ml-1">
                  {enquiry.contact_preference === "whatsapp" ? "WhatsApp" : "Phone"}
                </Badge>
              </p>
            )}

            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              {enquiry.contact_preference === "in_app"
                ? "This renter prefers in-app messages. Keep the conversation here for a shared record."
                : "This renter chose to share contact details for this enquiry. Only use them for this conversation."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <CalendarCheck className="size-4 text-brand-700" aria-hidden="true" />
              Inspections
            </h2>

            {inspections.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line bg-surface-1/60 px-4 py-5 text-sm text-ink-500">
                No inspection requested yet.
              </p>
            ) : (
              inspections.map((inspection) => (
                <div key={inspection.id} className="space-y-3">
                  <div className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <InspectionStatusBadge status={inspection.status} />
                      <span className="text-xs text-ink-400">
                        Requested {timeAgo(inspection.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-ink-800">
                      {formatDateTime(inspection.scheduled_at)}
                    </p>
                    {inspection.notes && (
                      <p className="mt-1 text-xs leading-relaxed text-ink-500">
                        Renter note: {inspection.notes}
                      </p>
                    )}
                    {inspection.outcome && (
                      <p className="mt-1 text-xs text-ink-500">
                        Outcome: {OUTCOME_LABELS[inspection.outcome]}
                        {inspection.outcome_notes ? ` — ${inspection.outcome_notes}` : ""}
                      </p>
                    )}
                  </div>

                  {!closed && (
                    <InspectionResponseForm
                      inspectionId={inspection.id}
                      role={perspective}
                      status={inspection.status}
                    />
                  )}
                </div>
              ))
            )}
          </section>

          {perspective === "provider" && (
            <LeadStageForm
              enquiryId={enquiry.id}
              currentStage={enquiry.lead_stage}
            />
          )}

          <div className="rounded-2xl border border-line-soft bg-surface-1/60 p-4">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-500">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-700" aria-hidden="true" />
              MY AGENT never collects rent or fees. Report anything that feels unsafe
              from the listing page.
            </p>
            {!closed && (
              <div className="mt-3">
                <ActionButton
                  action={closeEnquiryAction}
                  fields={{ enquiryId: enquiry.id }}
                  confirmMessage="Close this enquiry? The full history stays visible."
                  successFallback="Enquiry closed."
                  variant="secondary"
                  size="sm"
                >
                  Close enquiry
                </ActionButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
