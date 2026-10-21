export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole =
  | "renter"
  | "landlord"
  | "agent"
  | "verifier"
  | "moderator"
  | "admin";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "changes_requested"
  | "published"
  | "paused"
  | "rented"
  | "archived"
  | "suspended"
  | "rejected";

export type PropertyType =
  | "single_room"
  | "shared_room"
  | "self_contain"
  | "mini_flat"
  | "one_bedroom"
  | "two_bedroom"
  | "three_bedroom"
  | "duplex"
  | "bungalow"
  | "hostel_space"
  | "other";

export type RentPeriod =
  | "per_year"
  | "per_six_months"
  | "per_semester"
  | "per_month";

export type CostCategory =
  | "rent"
  | "agency_fee"
  | "legal_fee"
  | "caution_deposit"
  | "service_charge"
  | "maintenance"
  | "utility"
  | "other";

export type CostRecurrence =
  | "one_time"
  | "monthly"
  | "quarterly"
  | "annually"
  | "other";

export type VerificationCheckType =
  | "identity"
  | "property_authorization"
  | "property_visit";

export type VerificationStatus =
  | "not_started"
  | "pending_review"
  | "verified"
  | "more_info_required"
  | "rejected"
  | "expired"
  | "suspended";

export type AvailabilityStatus =
  | "available"
  | "occupied"
  | "coming_soon"
  | "unknown";

export type EnquiryStatus = "open" | "responded" | "closed";

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "inspection_scheduled"
  | "inspected"
  | "negotiation"
  | "rented"
  | "lost";

export type InspectionStatus =
  | "requested"
  | "confirmed"
  | "rescheduled"
  | "declined"
  | "cancelled"
  | "completed"
  | "no_show";

export type InspectionOutcome =
  | "positive"
  | "negative"
  | "property_unavailable"
  | "no_show_renter"
  | "no_show_provider"
  | "unknown";

export type ReportTargetType = "listing" | "user" | "message" | "enquiry";

export type ReportReason =
  | "suspected_scam"
  | "misleading_price"
  | "unauthorized_listing"
  | "duplicate_property"
  | "harassment"
  | "incorrect_availability"
  | "unsafe_conduct"
  | "discrimination"
  | "impersonation"
  | "other";

export type ReportStatus =
  | "open"
  | "triaged"
  | "investigating"
  | "resolved"
  | "dismissed";

export type ReportSeverity = "low" | "medium" | "high" | "critical";

export type ModerationActionType =
  | "listing_approved"
  | "listing_rejected"
  | "listing_suspended"
  | "listing_removed"
  | "user_suspended"
  | "user_reinstated"
  | "verification_approved"
  | "verification_rejected"
  | "report_resolved"
  | "report_dismissed"
  | "other";

export type RoommateInterestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "withdrawn"
  | "blocked";

export type RentalOutcomeType =
  | "secured_via_platform"
  | "secured_elsewhere"
  | "not_yet"
  | "no_longer_looking";

export type CommissionRecordStatus =
  | "pending"
  | "invoiced"
  | "paid"
  | "disputed"
  | "waived";

export type NotificationType =
  | "new_enquiry"
  | "enquiry_response"
  | "inspection_requested"
  | "inspection_confirmed"
  | "inspection_rescheduled"
  | "inspection_cancelled"
  | "inspection_reminder"
  | "availability_reminder"
  | "listing_approved"
  | "listing_rejected"
  | "verification_more_info"
  | "saved_listing_changed"
  | "roommate_interest"
  | "roommate_match"
  | "report_update"
  | "system";

export type NotificationChannel = "in_app" | "email" | "sms" | "whatsapp";

export type DeliveryStatus = "pending" | "sent" | "delivered" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_suspended: boolean;
          suspended_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_suspended?: boolean;
          suspended_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          suspended_reason?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          granted_by: string | null;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: AppRole;
          granted_by?: string | null;
          granted_at?: string;
        };
        Update: {
          role?: AppRole;
          granted_by?: string | null;
        };
        Relationships: [];
      };
      universities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          state: string;
          city: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          state: string;
          city: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          state?: string;
          city?: string;
        };
        Relationships: [];
      };
      campuses: {
        Row: {
          id: string;
          university_id: string;
          name: string;
          slug: string;
          address: string | null;
          lat: number | null;
          lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          university_id: string;
          name: string;
          slug: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
        };
        Relationships: [];
      };
      neighbourhoods: {
        Row: {
          id: string;
          campus_id: string;
          name: string;
          slug: string;
          lat: number | null;
          lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          name: string;
          slug: string;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          lat?: number | null;
          lng?: number | null;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          slug: string;
          description: string;
          property_type: PropertyType;
          campus_id: string | null;
          neighbourhood_id: string | null;
          address: string | null;
          lat: number | null;
          lng: number | null;
          furnished: boolean | null;
          listing_status: ListingStatus;
          availability_status: AvailabilityStatus;
          available_from: string | null;
          last_availability_confirmed_at: string | null;
          published_at: string | null;
          view_count: number;
          is_duplicate_suspected: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          slug: string;
          description?: string;
          property_type?: PropertyType;
          campus_id?: string | null;
          neighbourhood_id?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          furnished?: boolean | null;
          listing_status?: ListingStatus;
          availability_status?: AvailabilityStatus;
          available_from?: string | null;
          last_availability_confirmed_at?: string | null;
          published_at?: string | null;
          view_count?: number;
          is_duplicate_suspected?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string;
          property_type?: PropertyType;
          campus_id?: string | null;
          neighbourhood_id?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          furnished?: boolean | null;
          listing_status?: ListingStatus;
          availability_status?: AvailabilityStatus;
          available_from?: string | null;
          last_availability_confirmed_at?: string | null;
          published_at?: string | null;
          is_duplicate_suspected?: boolean;
          metadata?: Json;
        };
        Relationships: [];
      };
      property_units: {
        Row: {
          id: string;
          property_id: string;
          unit_type: PropertyType;
          title: string;
          bedrooms: number | null;
          bathrooms: number | null;
          is_shared: boolean;
          rent_amount: number | null;
          rent_period: RentPeriod;
          available_from: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          unit_type: PropertyType;
          title?: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          is_shared?: boolean;
          rent_amount?: number | null;
          rent_period?: RentPeriod;
          available_from?: string | null;
          created_at?: string;
        };
        Update: {
          unit_type?: PropertyType;
          title?: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          is_shared?: boolean;
          rent_amount?: number | null;
          rent_period?: RentPeriod;
          available_from?: string | null;
        };
        Relationships: [];
      };
      property_photos: {
        Row: {
          id: string;
          property_id: string;
          storage_path: string;
          caption: string | null;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          storage_path: string;
          caption?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          storage_path?: string;
          caption?: string | null;
          sort_order?: number;
          is_cover?: boolean;
        };
        Relationships: [];
      };
      amenities: {
        Row: {
          id: string;
          key: string;
          label: string;
          category: string;
          icon: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          label: string;
          category?: string;
          icon?: string | null;
        };
        Update: {
          key?: string;
          label?: string;
          category?: string;
          icon?: string | null;
        };
        Relationships: [];
      };
      property_amenities: {
        Row: {
          property_id: string;
          amenity_id: string;
          value: string | null;
        };
        Insert: {
          property_id: string;
          amenity_id: string;
          value?: string | null;
        };
        Update: {
          value?: string | null;
        };
        Relationships: [];
      };
      property_costs: {
        Row: {
          id: string;
          property_id: string;
          label: string;
          category: CostCategory;
          amount: number | null;
          currency: string;
          is_known: boolean;
          is_mandatory: boolean;
          is_refundable: boolean;
          recurrence: CostRecurrence;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          label: string;
          category?: CostCategory;
          amount?: number | null;
          currency?: string;
          is_known?: boolean;
          is_mandatory?: boolean;
          is_refundable?: boolean;
          recurrence?: CostRecurrence;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          label?: string;
          category?: CostCategory;
          amount?: number | null;
          currency?: string;
          is_known?: boolean;
          is_mandatory?: boolean;
          is_refundable?: boolean;
          recurrence?: CostRecurrence;
          notes?: string | null;
        };
        Relationships: [];
      };
      availability_confirmations: {
        Row: {
          id: string;
          property_id: string;
          confirmed_by: string;
          confirmed_at: string;
          method: string;
          notes: string | null;
          expires_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          confirmed_by: string;
          confirmed_at?: string;
          method?: string;
          notes?: string | null;
          expires_at?: string;
        };
        Update: {
          notes?: string | null;
          expires_at?: string;
        };
        Relationships: [];
      };
      verification_cases: {
        Row: {
          id: string;
          subject_type: "user" | "property";
          subject_id: string;
          check_type: VerificationCheckType;
          status: VerificationStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          notes: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_type: "user" | "property";
          subject_id: string;
          check_type: VerificationCheckType;
          status?: VerificationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          notes?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: VerificationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          notes?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      verification_evidence: {
        Row: {
          id: string;
          case_id: string;
          uploaded_by: string;
          storage_path: string;
          kind: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          uploaded_by: string;
          storage_path: string;
          kind?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          kind?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      roommate_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          campus_id: string | null;
          neighbourhood_id: string | null;
          budget_min: number | null;
          budget_max: number | null;
          move_in_date: string | null;
          accommodation_type: PropertyType | null;
          bio: string | null;
          is_visible: boolean;
          contact_visibility: "on_match" | "after_request" | "private";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string;
          campus_id?: string | null;
          neighbourhood_id?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          move_in_date?: string | null;
          accommodation_type?: PropertyType | null;
          bio?: string | null;
          is_visible?: boolean;
          contact_visibility?: "on_match" | "after_request" | "private";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          campus_id?: string | null;
          neighbourhood_id?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          move_in_date?: string | null;
          accommodation_type?: PropertyType | null;
          bio?: string | null;
          is_visible?: boolean;
          contact_visibility?: "on_match" | "after_request" | "private";
        };
        Relationships: [];
      };
      roommate_preferences: {
        Row: {
          profile_id: string;
          sharing_arrangement: "own_room_shared_flat" | "shared_room" | "any";
          sleep_schedule: string | null;
          cleanliness: string | null;
          cooking: string | null;
          study_environment: string | null;
          guest_policy: string | null;
          smoking: string | null;
          gender_preference: string | null;
        };
        Insert: {
          profile_id: string;
          sharing_arrangement?: "own_room_shared_flat" | "shared_room" | "any";
          sleep_schedule?: string | null;
          cleanliness?: string | null;
          cooking?: string | null;
          study_environment?: string | null;
          guest_policy?: string | null;
          smoking?: string | null;
          gender_preference?: string | null;
        };
        Update: {
          sharing_arrangement?: "own_room_shared_flat" | "shared_room" | "any";
          sleep_schedule?: string | null;
          cleanliness?: string | null;
          cooking?: string | null;
          study_environment?: string | null;
          guest_policy?: string | null;
          smoking?: string | null;
          gender_preference?: string | null;
        };
        Relationships: [];
      };
      roommate_interests: {
        Row: {
          id: string;
          from_profile: string;
          to_profile: string;
          status: RoommateInterestStatus;
          message: string | null;
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          from_profile: string;
          to_profile: string;
          status?: RoommateInterestStatus;
          message?: string | null;
          created_at?: string;
          responded_at?: string | null;
        };
        Update: {
          status?: RoommateInterestStatus;
          message?: string | null;
          responded_at?: string | null;
        };
        Relationships: [];
      };
      saved_properties: {
        Row: {
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      shortlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          share_token: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          share_token?: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          is_public?: boolean;
        };
        Relationships: [];
      };
      shortlist_items: {
        Row: {
          shortlist_id: string;
          property_id: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          shortlist_id: string;
          property_id: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          note?: string | null;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          property_id: string;
          renter_id: string;
          provider_id: string;
          message: string;
          contact_preference: "in_app" | "whatsapp" | "phone";
          status: EnquiryStatus;
          lead_stage: LeadStage;
          responded_at: string | null;
          closed_at: string | null;
          lost_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          renter_id: string;
          provider_id?: string;
          message: string;
          contact_preference?: "in_app" | "whatsapp" | "phone";
          status?: EnquiryStatus;
          lead_stage?: LeadStage;
          responded_at?: string | null;
          closed_at?: string | null;
          lost_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: EnquiryStatus;
          lead_stage?: LeadStage;
          responded_at?: string | null;
          closed_at?: string | null;
          lost_reason?: string | null;
        };
        Relationships: [];
      };
      enquiry_messages: {
        Row: {
          id: string;
          enquiry_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          enquiry_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      inspections: {
        Row: {
          id: string;
          enquiry_id: string;
          property_id: string;
          requested_by: string;
          scheduled_at: string;
          status: InspectionStatus;
          notes: string | null;
          outcome: InspectionOutcome | null;
          outcome_notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enquiry_id: string;
          property_id: string;
          requested_by: string;
          scheduled_at: string;
          status?: InspectionStatus;
          notes?: string | null;
          outcome?: InspectionOutcome | null;
          outcome_notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          scheduled_at?: string;
          status?: InspectionStatus;
          notes?: string | null;
          outcome?: InspectionOutcome | null;
          outcome_notes?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      lead_events: {
        Row: {
          id: string;
          enquiry_id: string;
          from_stage: LeadStage | null;
          to_stage: LeadStage;
          actor_id: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          enquiry_id: string;
          from_stage?: LeadStage | null;
          to_stage: LeadStage;
          actor_id?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      rental_outcomes: {
        Row: {
          id: string;
          property_id: string;
          enquiry_id: string | null;
          reported_by: string;
          outcome: RentalOutcomeType;
          rent_amount: number | null;
          currency: string;
          notes: string | null;
          verified_by_platform: boolean;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          enquiry_id?: string | null;
          reported_by: string;
          outcome: RentalOutcomeType;
          rent_amount?: number | null;
          currency?: string;
          notes?: string | null;
          verified_by_platform?: boolean;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          verified_by_platform?: boolean;
          verified_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      commission_agreements: {
        Row: {
          id: string;
          property_id: string;
          agent_id: string | null;
          platform_percent: number;
          agent_percent: number;
          terms: string | null;
          signed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          agent_id?: string | null;
          platform_percent?: number;
          agent_percent?: number;
          terms?: string | null;
          signed_at?: string | null;
          created_at?: string;
        };
        Update: {
          agent_id?: string | null;
          platform_percent?: number;
          agent_percent?: number;
          terms?: string | null;
          signed_at?: string | null;
        };
        Relationships: [];
      };
      commission_records: {
        Row: {
          id: string;
          agreement_id: string;
          rental_outcome_id: string | null;
          rental_amount: number;
          platform_amount: number;
          agent_amount: number;
          status: CommissionRecordStatus;
          notes: string | null;
          dispute_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          rental_outcome_id?: string | null;
          rental_amount: number;
          platform_amount: number;
          agent_amount: number;
          status?: CommissionRecordStatus;
          notes?: string | null;
          dispute_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: CommissionRecordStatus;
          notes?: string | null;
          dispute_reason?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string | null;
          target_type: ReportTargetType;
          target_id: string;
          reason: ReportReason;
          details: string | null;
          severity: ReportSeverity;
          status: ReportStatus;
          assigned_to: string | null;
          resolution_notes: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: ReportTargetType;
          target_id: string;
          reason: ReportReason;
          details?: string | null;
          severity?: ReportSeverity;
          status?: ReportStatus;
          assigned_to?: string | null;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          severity?: ReportSeverity;
          status?: ReportStatus;
          assigned_to?: string | null;
          resolution_notes?: string | null;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      moderation_actions: {
        Row: {
          id: string;
          moderator_id: string;
          target_type: string;
          target_id: string;
          action: ModerationActionType;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          moderator_id: string;
          target_type: string;
          target_id: string;
          action: ModerationActionType;
          notes?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          href: string | null;
          payload: Json;
          channel: NotificationChannel;
          delivery_status: DeliveryStatus;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          href?: string | null;
          payload?: Json;
          channel?: NotificationChannel;
          delivery_status?: DeliveryStatus;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
          delivery_status?: DeliveryStatus;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before: Json | null;
          after: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before?: Json | null;
          after?: Json | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: number;
          event_name: string;
          props: Json;
          user_id: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          event_name: string;
          props?: Json;
          user_id?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      property_listings: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          property_type: PropertyType;
          furnished: boolean | null;
          listing_status: ListingStatus;
          availability_status: AvailabilityStatus;
          available_from: string | null;
          last_availability_confirmed_at: string | null;
          published_at: string | null;
          created_at: string;
          view_count: number;
          campus_id: string | null;
          neighbourhood_id: string | null;
          lat: number | null;
          lng: number | null;
          campus_name: string | null;
          campus_slug: string | null;
          university_name: string | null;
          neighbourhood_name: string | null;
          neighbourhood_slug: string | null;
          provider_id: string;
          provider_name: string | null;
          provider_avatar_url: string | null;
          min_rent: number | null;
          max_rent: number | null;
          unit_count: number;
          cover_photo: string | null;
          authorization_verified: VerificationStatus | null;
          visit_verified: VerificationStatus | null;
          provider_identity_verified: VerificationStatus | null;
          rent_period: RentPeriod | null;
        };
        Relationships: [];
      };
      public_profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Relationships: [];
      };
      public_verifications: {
        Row: {
          id: string;
          subject_type: "user" | "property";
          subject_id: string;
          check_type: VerificationCheckType;
          status: VerificationStatus;
          notes: string | null;
          expires_at: string | null;
          reviewed_at: string | null;
        };
        Relationships: [];
      };
      roommate_directory: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          campus_id: string | null;
          campus_name: string | null;
          neighbourhood_id: string | null;
          neighbourhood_name: string | null;
          budget_min: number | null;
          budget_max: number | null;
          move_in_date: string | null;
          accommodation_type: PropertyType | null;
          bio: string | null;
          is_visible: boolean;
          contact_visibility: "on_match" | "after_request" | "private";
          created_at: string;
          updated_at: string;
          sharing_arrangement:
            | "own_room_shared_flat"
            | "shared_room"
            | "any"
            | null;
          sleep_schedule: string | null;
          cleanliness: string | null;
          cooking: string | null;
          study_environment: string | null;
          guest_policy: string | null;
          smoking: string | null;
          avatar_url: string | null;
          identity_verified: boolean;
        };
        Relationships: [];
      };
      roommate_interest_inbox: {
        Row: {
          interest_id: string;
          from_profile: string;
          to_profile: string;
          status: RoommateInterestStatus;
          message: string | null;
          created_at: string;
          responded_at: string | null;
          my_profile_id: string;
          direction: "incoming" | "outgoing";
          counterpart_profile_id: string;
          counterpart_display_name: string;
          counterpart_contact_visibility: string;
          counterpart_campus_id: string | null;
          counterpart_campus_name: string | null;
          counterpart_neighbourhood_id: string | null;
          counterpart_neighbourhood_name: string | null;
          counterpart_avatar_url: string | null;
          counterpart_phone: string | null;
        };
        Relationships: [];
      };
      enquiry_contacts: {
        Row: {
          enquiry_id: string;
          renter_phone: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      has_role: {
        Args: { target_role: AppRole };
        Returns: boolean;
      };
      is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      can_view_property: {
        Args: { target_property: string };
        Returns: boolean;
      };
      can_manage_property: {
        Args: { target_property: string };
        Returns: boolean;
      };
      is_enquiry_party: {
        Args: { target_enquiry: string };
        Returns: boolean;
      };
      can_view_verification_case: {
        Args: { target_case: string };
        Returns: boolean;
      };
      ensure_own_profile: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      upgrade_to_provider: {
        Args: { requested_role: AppRole };
        Returns: undefined;
      };
      notify_user: {
        Args: {
          target_user: string;
          notice_type: NotificationType;
          notice_title: string;
          notice_body?: string | null;
          notice_href?: string | null;
          notice_payload?: Json;
        };
        Returns: string;
      };
      increment_property_view: {
        Args: { target_property: string };
        Returns: undefined;
      };
      get_shared_shortlist: {
        Args: { share_token_input: string };
        Returns: {
          property_id: string;
          slug: string;
          title: string;
          neighbourhood_name: string | null;
          campus_name: string | null;
          min_rent: number | null;
          max_rent: number | null;
          cover_photo: string | null;
          availability_status: AvailabilityStatus;
          note: string | null;
        }[];
      };
      distance_km: {
        Args: {
          lat1: number;
          lng1: number;
          lat2: number;
          lng2: number;
        };
        Returns: number;
      };
    };
    Enums: {
      app_role: AppRole;
      listing_status: ListingStatus;
      property_type: PropertyType;
      rent_period: RentPeriod;
      cost_category: CostCategory;
      cost_recurrence: CostRecurrence;
      verification_check_type: VerificationCheckType;
      verification_status: VerificationStatus;
      availability_status: AvailabilityStatus;
      enquiry_status: EnquiryStatus;
      lead_stage: LeadStage;
      inspection_status: InspectionStatus;
      inspection_outcome: InspectionOutcome;
      report_target_type: ReportTargetType;
      report_reason: ReportReason;
      report_status: ReportStatus;
      report_severity: ReportSeverity;
      moderation_action_type: ModerationActionType;
      roommate_interest_status: RoommateInterestStatus;
      rental_outcome_type: RentalOutcomeType;
      commission_record_status: CommissionRecordStatus;
      notification_type: NotificationType;
      notification_channel: NotificationChannel;
      delivery_status: DeliveryStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];
