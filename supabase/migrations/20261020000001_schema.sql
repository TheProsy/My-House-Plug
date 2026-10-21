-- MY AGENT core schema
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ============================================================
-- ENUMS
-- ============================================================
create type public.app_role as enum ('renter', 'landlord', 'agent', 'verifier', 'moderator', 'admin');
create type public.listing_status as enum ('draft', 'pending_review', 'changes_requested', 'published', 'paused', 'rented', 'archived', 'suspended', 'rejected');
create type public.property_type as enum ('single_room', 'shared_room', 'self_contain', 'mini_flat', 'one_bedroom', 'two_bedroom', 'three_bedroom', 'duplex', 'bungalow', 'hostel_space', 'other');
create type public.rent_period as enum ('per_year', 'per_six_months', 'per_semester', 'per_month');
create type public.cost_category as enum ('rent', 'agency_fee', 'legal_fee', 'caution_deposit', 'service_charge', 'maintenance', 'utility', 'other');
create type public.cost_recurrence as enum ('one_time', 'monthly', 'quarterly', 'annually', 'other');
create type public.verification_check_type as enum ('identity', 'property_authorization', 'property_visit');
create type public.verification_status as enum ('not_started', 'pending_review', 'verified', 'more_info_required', 'rejected', 'expired', 'suspended');
create type public.availability_status as enum ('available', 'occupied', 'coming_soon', 'unknown');
create type public.enquiry_status as enum ('open', 'responded', 'closed');
create type public.lead_stage as enum ('new', 'contacted', 'qualified', 'inspection_scheduled', 'inspected', 'negotiation', 'rented', 'lost');
create type public.inspection_status as enum ('requested', 'confirmed', 'rescheduled', 'declined', 'cancelled', 'completed', 'no_show');
create type public.inspection_outcome as enum ('positive', 'negative', 'property_unavailable', 'no_show_renter', 'no_show_provider', 'unknown');
create type public.report_target_type as enum ('listing', 'user', 'message', 'enquiry');
create type public.report_reason as enum ('suspected_scam', 'misleading_price', 'unauthorized_listing', 'duplicate_property', 'harassment', 'incorrect_availability', 'unsafe_conduct', 'discrimination', 'impersonation', 'other');
create type public.report_status as enum ('open', 'triaged', 'investigating', 'resolved', 'dismissed');
create type public.report_severity as enum ('low', 'medium', 'high', 'critical');
create type public.moderation_action_type as enum ('listing_approved', 'listing_rejected', 'listing_suspended', 'listing_removed', 'user_suspended', 'user_reinstated', 'verification_approved', 'verification_rejected', 'report_resolved', 'report_dismissed', 'other');
create type public.roommate_interest_status as enum ('pending', 'accepted', 'declined', 'withdrawn', 'blocked');
create type public.rental_outcome_type as enum ('secured_via_platform', 'secured_elsewhere', 'not_yet', 'no_longer_looking');
create type public.commission_record_status as enum ('pending', 'invoiced', 'paid', 'disputed', 'waived');
create type public.notification_type as enum ('new_enquiry', 'enquiry_response', 'inspection_requested', 'inspection_confirmed', 'inspection_rescheduled', 'inspection_cancelled', 'inspection_reminder', 'availability_reminder', 'listing_approved', 'listing_rejected', 'verification_more_info', 'saved_listing_changed', 'roommate_interest', 'roommate_match', 'report_update', 'system');
create type public.notification_channel as enum ('in_app', 'email', 'sms', 'whatsapp');
create type public.delivery_status as enum ('pending', 'sent', 'delivered', 'failed');

-- ============================================================
-- IDENTITY
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  avatar_url text,
  bio text,
  is_suspended boolean not null default false,
  suspended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references public.profiles (id) on delete set null,
  granted_at timestamptz not null default now(),
  unique (user_id, role)
);

-- ============================================================
-- GEOGRAPHY / TAXONOMY
-- ============================================================
create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  state text not null,
  city text not null,
  created_at timestamptz not null default now()
);

create table public.campuses (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities (id) on delete cascade,
  name text not null,
  slug text not null,
  address text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  created_at timestamptz not null default now(),
  unique (university_id, slug)
);

create table public.neighbourhoods (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references public.campuses (id) on delete cascade,
  name text not null,
  slug text not null,
  lat numeric(9, 6),
  lng numeric(9, 6),
  created_at timestamptz not null default now(),
  unique (campus_id, slug)
);

-- ============================================================
-- PROPERTIES
-- ============================================================
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  slug text not null unique,
  description text not null default '',
  property_type public.property_type not null default 'self_contain',
  campus_id uuid references public.campuses (id) on delete set null,
  neighbourhood_id uuid references public.neighbourhoods (id) on delete set null,
  address text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  furnished boolean,
  listing_status public.listing_status not null default 'draft',
  availability_status public.availability_status not null default 'unknown',
  available_from date,
  last_availability_confirmed_at timestamptz,
  published_at timestamptz,
  view_count integer not null default 0,
  is_duplicate_suspected boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  unit_type public.property_type not null,
  title text not null default '',
  bedrooms integer,
  bathrooms integer,
  is_shared boolean not null default false,
  rent_amount numeric(14, 2),
  rent_period public.rent_period not null default 'per_year',
  available_from date,
  created_at timestamptz not null default now(),
  constraint property_units_rent_positive check (rent_amount is null or rent_amount >= 0),
  constraint property_units_bedrooms_nonnegative check (bedrooms is null or bedrooms >= 0),
  constraint property_units_bathrooms_nonnegative check (bathrooms is null or bathrooms >= 0)
);

create table public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  category text not null default 'general',
  icon text
);

create table public.property_amenities (
  property_id uuid not null references public.properties (id) on delete cascade,
  amenity_id uuid not null references public.amenities (id) on delete cascade,
  value text,
  primary key (property_id, amenity_id)
);

create table public.property_costs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  label text not null,
  category public.cost_category not null default 'other',
  amount numeric(14, 2),
  currency text not null default 'NGN',
  is_known boolean not null default true,
  is_mandatory boolean not null default true,
  is_refundable boolean not null default false,
  recurrence public.cost_recurrence not null default 'one_time',
  notes text,
  created_at timestamptz not null default now(),
  constraint property_costs_amount_nonnegative check (amount is null or amount >= 0),
  constraint property_costs_known_requires_amount check (not is_known or amount is not null)
);

create table public.availability_confirmations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  confirmed_by uuid not null references public.profiles (id) on delete cascade,
  confirmed_at timestamptz not null default now(),
  method text not null default 'provider_confirmation',
  notes text,
  expires_at timestamptz not null default (now() + interval '14 days')
);

-- ============================================================
-- VERIFICATION
-- ============================================================
create table public.verification_cases (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('user', 'property')),
  subject_id uuid not null,
  check_type public.verification_check_type not null,
  status public.verification_status not null default 'not_started',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_type, subject_id, check_type)
);

create table public.verification_evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.verification_cases (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  kind text not null default 'document',
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROOMMATE MATCHING
-- ============================================================
create table public.roommate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  display_name text not null default '',
  campus_id uuid references public.campuses (id) on delete set null,
  neighbourhood_id uuid references public.neighbourhoods (id) on delete set null,
  budget_min numeric(14, 2),
  budget_max numeric(14, 2),
  move_in_date date,
  accommodation_type public.property_type,
  bio text,
  is_visible boolean not null default false,
  contact_visibility text not null default 'after_request' check (contact_visibility in ('on_match', 'after_request', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roommate_profiles_budget_order check (budget_min is null or budget_max is null or budget_min <= budget_max)
);

create table public.roommate_preferences (
  profile_id uuid primary key references public.roommate_profiles (id) on delete cascade,
  sharing_arrangement text not null default 'any' check (sharing_arrangement in ('own_room_shared_flat', 'shared_room', 'any')),
  sleep_schedule text,
  cleanliness text,
  cooking text,
  study_environment text,
  guest_policy text,
  smoking text,
  gender_preference text
);

create table public.roommate_interests (
  id uuid primary key default gen_random_uuid(),
  from_profile uuid not null references public.roommate_profiles (id) on delete cascade,
  to_profile uuid not null references public.roommate_profiles (id) on delete cascade,
  status public.roommate_interest_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (from_profile, to_profile),
  constraint roommate_interests_no_self check (from_profile <> to_profile)
);

-- ============================================================
-- SAVED / SHORTLISTS
-- ============================================================
create table public.saved_properties (
  user_id uuid not null references public.profiles (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create table public.shortlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null default 'My shortlist',
  share_token uuid not null unique default gen_random_uuid(),
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.shortlist_items (
  shortlist_id uuid not null references public.shortlists (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  primary key (shortlist_id, property_id)
);

-- ============================================================
-- ENQUIRIES / INSPECTIONS / LEADS
-- ============================================================
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  renter_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  contact_preference text not null default 'in_app' check (contact_preference in ('in_app', 'whatsapp', 'phone')),
  status public.enquiry_status not null default 'open',
  lead_stage public.lead_stage not null default 'new',
  responded_at timestamptz,
  closed_at timestamptz,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  requested_by uuid not null references public.profiles (id) on delete cascade,
  scheduled_at timestamptz not null,
  status public.inspection_status not null default 'requested',
  notes text,
  outcome public.inspection_outcome,
  outcome_notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  from_stage public.lead_stage,
  to_stage public.lead_stage not null,
  actor_id uuid references public.profiles (id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.rental_outcomes (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  enquiry_id uuid references public.enquiries (id) on delete set null,
  reported_by uuid not null references public.profiles (id) on delete cascade,
  outcome public.rental_outcome_type not null,
  rent_amount numeric(14, 2),
  currency text not null default 'NGN',
  notes text,
  verified_by_platform boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- COMMISSIONS
-- ============================================================
create table public.commission_agreements (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  agent_id uuid references public.profiles (id) on delete set null,
  platform_percent numeric(5, 2) not null default 0,
  agent_percent numeric(5, 2) not null default 0,
  terms text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint commission_percent_range check (platform_percent >= 0 and platform_percent <= 100 and agent_percent >= 0 and agent_percent <= 100)
);

create table public.commission_records (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.commission_agreements (id) on delete restrict,
  rental_outcome_id uuid references public.rental_outcomes (id) on delete set null,
  rental_amount numeric(14, 2) not null,
  platform_amount numeric(14, 2) not null,
  agent_amount numeric(14, 2) not null,
  status public.commission_record_status not null default 'pending',
  notes text,
  dispute_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TRUST & SAFETY
-- ============================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason public.report_reason not null,
  details text,
  severity public.report_severity not null default 'medium',
  status public.report_status not null default 'open',
  assigned_to uuid references public.profiles (id) on delete set null,
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references public.profiles (id) on delete restrict,
  target_type text not null,
  target_id uuid not null,
  action public.moderation_action_type not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS / AUDIT / ANALYTICS
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  href text,
  payload jsonb not null default '{}'::jsonb,
  channel public.notification_channel not null default 'in_app',
  delivery_status public.delivery_status not null default 'pending',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  props jsonb not null default '{}'::jsonb,
  user_id uuid references public.profiles (id) on delete set null,
  session_id text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index properties_status_published_idx on public.properties (listing_status, published_at desc);
create index properties_campus_idx on public.properties (campus_id);
create index properties_neighbourhood_idx on public.properties (neighbourhood_id);
create index properties_type_idx on public.properties (property_type);
create index properties_owner_idx on public.properties (owner_id);
create index properties_title_trgm_idx on public.properties using gin (title gin_trgm_ops);
create index properties_description_trgm_idx on public.properties using gin (description gin_trgm_ops);
create index property_units_property_idx on public.property_units (property_id);
create index property_units_rent_idx on public.property_units (rent_amount);
create index property_photos_property_idx on public.property_photos (property_id, sort_order);
create index property_costs_property_idx on public.property_costs (property_id);
create index availability_property_idx on public.availability_confirmations (property_id, confirmed_at desc);
create index verification_subject_idx on public.verification_cases (subject_type, subject_id);
create index enquiries_provider_idx on public.enquiries (provider_id, status, created_at desc);
create index enquiries_renter_idx on public.enquiries (renter_id, created_at desc);
create index inspections_enquiry_idx on public.inspections (enquiry_id);
create index inspections_scheduled_idx on public.inspections (scheduled_at, status);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;
create index reports_status_idx on public.reports (status, severity, created_at desc);
create index analytics_event_idx on public.analytics_events (event_name, created_at desc);
create index audit_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index roommate_profiles_campus_idx on public.roommate_profiles (campus_id) where is_visible;
create index rental_outcomes_property_idx on public.rental_outcomes (property_id);

-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.has_role(target_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = target_role
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('verifier', 'moderator', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger properties_updated_at before update on public.properties
for each row execute function public.set_updated_at();

create trigger verification_cases_updated_at before update on public.verification_cases
for each row execute function public.set_updated_at();

create trigger roommate_profiles_updated_at before update on public.roommate_profiles
for each row execute function public.set_updated_at();

create trigger enquiries_updated_at before update on public.enquiries
for each row execute function public.set_updated_at();

create trigger inspections_updated_at before update on public.inspections
for each row execute function public.set_updated_at();

create trigger reports_updated_at before update on public.reports
for each row execute function public.set_updated_at();

create trigger commission_records_updated_at before update on public.commission_records
for each row execute function public.set_updated_at();

-- New auth user -> profile + default renter role. Never trust metadata for staff roles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  );

  requested_role := case new.raw_user_meta_data ->> 'account_type'
    when 'landlord' then 'landlord'
    when 'agent' then 'agent'
    else 'renter'
  end;

  insert into public.user_roles (user_id, role) values (new.id, 'renter');
  if requested_role <> 'renter' then
    insert into public.user_roles (user_id, role) values (new.id, requested_role);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Providers may only publish their own listings; keep provider attribution authoritative.
create or replace function public.set_enquiry_provider()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  property_owner uuid;
begin
  select owner_id into property_owner from public.properties where id = new.property_id;
  if property_owner is null then
    raise exception 'Property not found';
  end if;
  new.provider_id := property_owner;
  return new;
end;
$$;

create trigger enquiries_set_provider before insert on public.enquiries
for each row execute function public.set_enquiry_provider();

-- Record every lead-stage transition.
create or replace function public.log_lead_stage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.lead_stage is distinct from old.lead_stage then
    insert into public.lead_events (enquiry_id, from_stage, to_stage, actor_id, reason)
    values (new.id, old.lead_stage, new.lead_stage, auth.uid(), new.lost_reason);
  end if;
  return new;
end;
$$;

create trigger enquiries_log_stage after update on public.enquiries
for each row execute function public.log_lead_stage();

-- Inserting a lead event at creation time.
create or replace function public.log_lead_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lead_events (enquiry_id, from_stage, to_stage, actor_id)
  values (new.id, null, new.lead_stage, auth.uid());
  return new;
end;
$$;

create trigger enquiries_log_created after insert on public.enquiries
for each row execute function public.log_lead_created();

-- Availability confirmation updates the property's freshness signal.
create or replace function public.apply_availability_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.properties
  set last_availability_confirmed_at = new.confirmed_at,
      availability_status = 'available'
  where id = new.property_id;
  return new;
end;
$$;

create trigger availability_applied after insert on public.availability_confirmations
for each row execute function public.apply_availability_confirmation();

-- Audit sensitive changes.
create or replace function public.audit_sensitive_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before, after)
  values (
    auth.uid(),
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('UPDATE', 'INSERT') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

create trigger verification_cases_audit after insert or update on public.verification_cases
for each row execute function public.audit_sensitive_change();

create trigger moderation_actions_audit after insert on public.moderation_actions
for each row execute function public.audit_sensitive_change();

-- Notify a user through a controlled function so clients cannot spam others directly.
create or replace function public.notify_user(
  target_user uuid,
  notice_type public.notification_type,
  notice_title text,
  notice_body text default null,
  notice_href text default null,
  notice_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  notice_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.notifications (user_id, type, title, body, href, payload)
  values (target_user, notice_type, notice_title, notice_body, notice_href, notice_payload)
  returning id into notice_id;

  return notice_id;
end;
$$;

revoke all on function public.notify_user(uuid, public.notification_type, text, text, text, jsonb) from public;
grant execute on function public.notify_user(uuid, public.notification_type, text, text, text, jsonb) to authenticated;

-- Distance helper (Haversine, kilometres) for proximity sorting.
create or replace function public.distance_km(lat1 numeric, lng1 numeric, lat2 numeric, lng2 numeric)
returns numeric
language sql
immutable
as $$
  select 6371 * 2 * asin(
    sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2) +
      cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
    )
  );
$$;

-- ============================================================
-- PUBLIC LISTING VIEW
-- ============================================================
create or replace view public.property_listings
with (security_invoker = true) as
select
  p.id,
  p.slug,
  p.title,
  p.description,
  p.property_type,
  p.furnished,
  p.listing_status,
  p.availability_status,
  p.available_from,
  p.last_availability_confirmed_at,
  p.published_at,
  p.created_at,
  p.view_count,
  p.campus_id,
  p.neighbourhood_id,
  p.lat,
  p.lng,
  c.name as campus_name,
  c.slug as campus_slug,
  u.name as university_name,
  n.name as neighbourhood_name,
  n.slug as neighbourhood_slug,
  p.owner_id as provider_id,
  pr.full_name as provider_name,
  pr.avatar_url as provider_avatar_url,
  (select min(pu.rent_amount) from public.property_units pu where pu.property_id = p.id) as min_rent,
  (select max(pu.rent_amount) from public.property_units pu where pu.property_id = p.id) as max_rent,
  (select count(*) from public.property_units pu where pu.property_id = p.id) as unit_count,
  (select pp.storage_path from public.property_photos pp where pp.property_id = p.id order by pp.is_cover desc, pp.sort_order asc limit 1) as cover_photo,
  (select vc.status from public.verification_cases vc where vc.subject_type = 'property' and vc.subject_id = p.id and vc.check_type = 'property_authorization' and vc.status = 'verified' and (vc.expires_at is null or vc.expires_at > now()) limit 1) as authorization_verified,
  (select vc.status from public.verification_cases vc where vc.subject_type = 'property' and vc.subject_id = p.id and vc.check_type = 'property_visit' and vc.status = 'verified' and (vc.expires_at is null or vc.expires_at > now()) limit 1) as visit_verified,
  (select vc.status from public.verification_cases vc where vc.subject_type = 'user' and vc.subject_id = p.owner_id and vc.check_type = 'identity' and vc.status = 'verified' and (vc.expires_at is null or vc.expires_at > now()) limit 1) as provider_identity_verified
from public.properties p
left join public.campuses c on c.id = p.campus_id
left join public.universities u on u.id = c.university_id
left join public.neighbourhoods n on n.id = p.neighbourhood_id
left join public.profiles pr on pr.id = p.owner_id;

-- Safe public projection of provider profiles.
create or replace view public.public_profiles as
select id, full_name, avatar_url, bio, created_at
from public.profiles
where is_suspended = false;

grant select on public.property_listings to anon, authenticated;
grant select on public.public_profiles to anon, authenticated;
