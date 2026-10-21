-- MY AGENT row level security

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.universities enable row level security;
alter table public.campuses enable row level security;
alter table public.neighbourhoods enable row level security;
alter table public.properties enable row level security;
alter table public.property_units enable row level security;
alter table public.property_photos enable row level security;
alter table public.amenities enable row level security;
alter table public.property_amenities enable row level security;
alter table public.property_costs enable row level security;
alter table public.availability_confirmations enable row level security;
alter table public.verification_cases enable row level security;
alter table public.verification_evidence enable row level security;
alter table public.roommate_profiles enable row level security;
alter table public.roommate_preferences enable row level security;
alter table public.roommate_interests enable row level security;
alter table public.saved_properties enable row level security;
alter table public.shortlists enable row level security;
alter table public.shortlist_items enable row level security;
alter table public.enquiries enable row level security;
alter table public.inspections enable row level security;
alter table public.lead_events enable row level security;
alter table public.rental_outcomes enable row level security;
alter table public.commission_agreements enable row level security;
alter table public.commission_records enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.analytics_events enable row level security;

-- ============================================================
-- ACCESS HELPERS
-- ============================================================
create or replace function public.can_view_property(target_property uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.properties p
    where p.id = target_property
      and (
        p.listing_status = 'published'
        or p.owner_id = auth.uid()
        or public.is_staff()
      )
  );
$$;

create or replace function public.can_manage_property(target_property uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.properties p
    where p.id = target_property
      and (p.owner_id = auth.uid() or public.is_staff())
  );
$$;

create or replace function public.is_enquiry_party(target_enquiry uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enquiries e
    where e.id = target_enquiry
      and (e.renter_id = auth.uid() or e.provider_id = auth.uid() or public.is_staff())
  );
$$;

create or replace function public.can_view_verification_case(target_case uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.verification_cases vc
    where vc.id = target_case
      and (
        public.is_staff()
        or (vc.subject_type = 'user' and vc.subject_id = auth.uid())
        or (
          vc.subject_type = 'property'
          and exists (
            select 1 from public.properties p
            where p.id = vc.subject_id and p.owner_id = auth.uid()
          )
        )
      )
  );
$$;

grant execute on function public.can_view_property(uuid) to anon, authenticated;
grant execute on function public.can_manage_property(uuid) to anon, authenticated;
grant execute on function public.is_enquiry_party(uuid) to anon, authenticated;
grant execute on function public.can_view_verification_case(uuid) to anon, authenticated;

-- ============================================================
-- PROFILES / ROLES
-- ============================================================
create policy profiles_select on public.profiles
for select using (id = auth.uid() or public.is_staff());

create policy profiles_insert on public.profiles
for insert with check (id = auth.uid());

create policy profiles_update_own on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid() and is_suspended = false);

create policy profiles_admin_update on public.profiles
for update using (public.is_admin())
with check (public.is_admin());

create policy user_roles_select on public.user_roles
for select using (user_id = auth.uid() or public.is_staff());

create policy user_roles_admin_all on public.user_roles
for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- TAXONOMY (public read, admin write)
-- ============================================================
create policy universities_read on public.universities for select using (true);
create policy universities_admin on public.universities for all using (public.is_admin()) with check (public.is_admin());

create policy campuses_read on public.campuses for select using (true);
create policy campuses_admin on public.campuses for all using (public.is_admin()) with check (public.is_admin());

create policy neighbourhoods_read on public.neighbourhoods for select using (true);
create policy neighbourhoods_admin on public.neighbourhoods for all using (public.is_admin()) with check (public.is_admin());

create policy amenities_read on public.amenities for select using (true);
create policy amenities_admin on public.amenities for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- PROPERTIES
-- ============================================================
create policy properties_select on public.properties
for select using (
  listing_status = 'published'
  or owner_id = auth.uid()
  or public.is_staff()
);

create policy properties_insert on public.properties
for insert with check (
  owner_id = auth.uid()
  and listing_status in ('draft', 'pending_review')
);

create policy properties_update on public.properties
for update using (owner_id = auth.uid() or public.is_staff())
with check (owner_id = auth.uid() or public.is_staff());

create policy properties_delete on public.properties
for delete using (
  owner_id = auth.uid() and listing_status = 'draft'
  or public.is_admin()
);

create or replace function public.enforce_listing_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Listing ownership cannot be transferred';
  end if;

  if not public.is_staff() and new.listing_status is distinct from old.listing_status then
    if not (
      (old.listing_status in ('draft', 'changes_requested') and new.listing_status = 'pending_review')
      or (old.listing_status = 'pending_review' and new.listing_status in ('draft', 'changes_requested'))
      or (old.listing_status = 'published' and new.listing_status in ('paused', 'rented', 'archived'))
      or (old.listing_status = 'paused' and new.listing_status in ('published', 'archived'))
      or (old.listing_status in ('rented', 'archived') and new.listing_status = 'published')
    ) then
      raise exception 'Listing status transition not permitted';
    end if;
  end if;

  if new.listing_status = 'published' and old.listing_status is distinct from 'published' then
    new.published_at := now();
  end if;

  return new;
end;
$$;

create trigger properties_enforce_rules before update on public.properties
for each row execute function public.enforce_listing_rules();

-- ============================================================
-- PROPERTY CHILD RECORDS
-- ============================================================
create policy property_units_select on public.property_units
for select using (public.can_view_property(property_id));

create policy property_units_write on public.property_units
for all using (public.can_manage_property(property_id))
with check (public.can_manage_property(property_id));

create policy property_photos_select on public.property_photos
for select using (public.can_view_property(property_id));

create policy property_photos_write on public.property_photos
for all using (public.can_manage_property(property_id))
with check (public.can_manage_property(property_id));

create policy property_amenities_select on public.property_amenities
for select using (public.can_view_property(property_id));

create policy property_amenities_write on public.property_amenities
for all using (public.can_manage_property(property_id))
with check (public.can_manage_property(property_id));

create policy property_costs_select on public.property_costs
for select using (public.can_view_property(property_id));

create policy property_costs_write on public.property_costs
for all using (public.can_manage_property(property_id))
with check (public.can_manage_property(property_id));

create policy availability_select on public.availability_confirmations
for select using (public.can_manage_property(property_id) or public.is_staff());

create policy availability_insert on public.availability_confirmations
for insert with check (
  confirmed_by = auth.uid() and public.can_manage_property(property_id)
);

-- ============================================================
-- VERIFICATION
-- ============================================================
create policy verification_cases_select on public.verification_cases
for select using (
  public.is_staff()
  or (subject_type = 'user' and subject_id = auth.uid())
  or (subject_type = 'property' and public.can_manage_property(subject_id))
);

create policy verification_cases_insert on public.verification_cases
for insert with check (
  status = 'pending_review'
  and (
    (subject_type = 'user' and subject_id = auth.uid())
    or (subject_type = 'property' and public.can_manage_property(subject_id))
  )
);

create policy verification_cases_staff_update on public.verification_cases
for update using (public.is_staff()) with check (public.is_staff());

create policy verification_cases_admin_delete on public.verification_cases
for delete using (public.is_admin());

create policy verification_evidence_select on public.verification_evidence
for select using (uploaded_by = auth.uid() or public.is_staff());

create policy verification_evidence_insert on public.verification_evidence
for insert with check (
  uploaded_by = auth.uid() and public.can_view_verification_case(case_id)
);

create policy verification_evidence_delete on public.verification_evidence
for delete using (uploaded_by = auth.uid() or public.is_admin());

-- ============================================================
-- ROOMMATES
-- ============================================================
create policy roommate_profiles_select on public.roommate_profiles
for select using (
  user_id = auth.uid()
  or (auth.uid() is not null and is_visible)
  or public.is_staff()
);

create policy roommate_profiles_insert on public.roommate_profiles
for insert with check (user_id = auth.uid());

create policy roommate_profiles_update on public.roommate_profiles
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy roommate_profiles_delete on public.roommate_profiles
for delete using (user_id = auth.uid() or public.is_admin());

create policy roommate_preferences_select on public.roommate_preferences
for select using (
  exists (
    select 1 from public.roommate_profiles rp
    where rp.id = profile_id
      and (rp.user_id = auth.uid() or (auth.uid() is not null and rp.is_visible) or public.is_staff())
  )
);

create policy roommate_preferences_write on public.roommate_preferences
for all using (
  exists (select 1 from public.roommate_profiles rp where rp.id = profile_id and rp.user_id = auth.uid())
)
with check (
  exists (select 1 from public.roommate_profiles rp where rp.id = profile_id and rp.user_id = auth.uid())
);

create policy roommate_interests_select on public.roommate_interests
for select using (
  exists (
    select 1 from public.roommate_profiles rp
    where rp.id in (from_profile, to_profile) and (rp.user_id = auth.uid() or public.is_staff())
  )
);

create policy roommate_interests_insert on public.roommate_interests
for insert with check (
  status = 'pending'
  and exists (
    select 1 from public.roommate_profiles rp
    where rp.id = from_profile and rp.user_id = auth.uid()
  )
  and exists (
    select 1 from public.roommate_profiles rp
    where rp.id = to_profile and rp.is_visible
  )
);

create policy roommate_interests_update on public.roommate_interests
for update using (
  exists (
    select 1 from public.roommate_profiles rp
    where rp.id in (from_profile, to_profile) and rp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.roommate_profiles rp
    where rp.id in (from_profile, to_profile) and rp.user_id = auth.uid()
  )
);

-- ============================================================
-- SAVED / SHORTLISTS
-- ============================================================
create policy saved_select on public.saved_properties
for select using (user_id = auth.uid());

create policy saved_write on public.saved_properties
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy shortlists_select on public.shortlists
for select using (user_id = auth.uid());

create policy shortlists_write on public.shortlists
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy shortlist_items_select on public.shortlist_items
for select using (
  exists (select 1 from public.shortlists s where s.id = shortlist_id and s.user_id = auth.uid())
);

create policy shortlist_items_write on public.shortlist_items
for all using (
  exists (select 1 from public.shortlists s where s.id = shortlist_id and s.user_id = auth.uid())
)
with check (
  exists (select 1 from public.shortlists s where s.id = shortlist_id and s.user_id = auth.uid())
);

create or replace function public.get_shared_shortlist(share_token_input uuid)
returns table (
  property_id uuid,
  slug text,
  title text,
  neighbourhood_name text,
  campus_name text,
  min_rent numeric,
  max_rent numeric,
  cover_photo text,
  availability_status public.availability_status,
  note text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pl.id,
    pl.slug,
    pl.title,
    pl.neighbourhood_name,
    pl.campus_name,
    pl.min_rent,
    pl.max_rent,
    pl.cover_photo,
    pl.availability_status,
    si.note
  from public.shortlists s
  join public.shortlist_items si on si.shortlist_id = s.id
  join public.property_listings pl on pl.id = si.property_id
  where s.share_token = share_token_input
    and s.is_public = true
    and pl.listing_status = 'published';
$$;

grant execute on function public.get_shared_shortlist(uuid) to anon, authenticated;

-- ============================================================
-- ENQUIRIES / INSPECTIONS / OUTCOMES
-- ============================================================
create policy enquiries_select on public.enquiries
for select using (renter_id = auth.uid() or provider_id = auth.uid() or public.is_staff());

create policy enquiries_insert on public.enquiries
for insert with check (
  renter_id = auth.uid()
  and exists (
    select 1 from public.properties p
    where p.id = property_id and p.listing_status = 'published'
  )
);

create policy enquiries_update on public.enquiries
for update using (renter_id = auth.uid() or provider_id = auth.uid() or public.is_staff())
with check (renter_id = auth.uid() or provider_id = auth.uid() or public.is_staff());

create policy enquiries_delete_admin on public.enquiries
for delete using (public.is_admin());

create policy inspections_select on public.inspections
for select using (public.is_enquiry_party(enquiry_id));

create policy inspections_insert on public.inspections
for insert with check (public.is_enquiry_party(enquiry_id) and requested_by = auth.uid());

create policy inspections_update on public.inspections
for update using (public.is_enquiry_party(enquiry_id))
with check (public.is_enquiry_party(enquiry_id));

create policy lead_events_select on public.lead_events
for select using (public.is_enquiry_party(enquiry_id));

create policy rental_outcomes_select on public.rental_outcomes
for select using (
  reported_by = auth.uid()
  or public.is_staff()
  or exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
);

create policy rental_outcomes_insert on public.rental_outcomes
for insert with check (
  reported_by = auth.uid()
  and (
    exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
    or exists (select 1 from public.enquiries e where e.id = enquiry_id and e.renter_id = auth.uid())
  )
);

create policy rental_outcomes_staff_update on public.rental_outcomes
for update using (public.is_staff()) with check (public.is_staff());

-- ============================================================
-- COMMISSIONS
-- ============================================================
create policy commission_agreements_select on public.commission_agreements
for select using (
  public.is_staff()
  or agent_id = auth.uid()
  or exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
);

create policy commission_agreements_admin on public.commission_agreements
for all using (public.is_admin()) with check (public.is_admin());

create policy commission_records_select on public.commission_records
for select using (
  public.is_staff()
  or exists (
    select 1 from public.commission_agreements ca
    join public.properties p on p.id = ca.property_id
    where ca.id = agreement_id and (ca.agent_id = auth.uid() or p.owner_id = auth.uid())
  )
);

create policy commission_records_admin on public.commission_records
for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- REPORTS / MODERATION
-- ============================================================
create policy reports_insert on public.reports
for insert with check (reporter_id = auth.uid());

create policy reports_select on public.reports
for select using (reporter_id = auth.uid() or public.is_staff());

create policy reports_staff_update on public.reports
for update using (public.is_staff()) with check (public.is_staff());

create policy moderation_actions_select on public.moderation_actions
for select using (public.is_staff());

create policy moderation_actions_insert on public.moderation_actions
for insert with check (public.is_staff() and moderator_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS / AUDIT / ANALYTICS
-- ============================================================
create policy notifications_select on public.notifications
for select using (user_id = auth.uid());

create policy notifications_update on public.notifications
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy notifications_delete on public.notifications
for delete using (user_id = auth.uid());

create policy audit_logs_select on public.audit_logs
for select using (public.is_staff());

create policy analytics_insert on public.analytics_events
for insert with check (true);

create policy analytics_select on public.analytics_events
for select using (public.is_staff());

-- ============================================================
-- VIEW COUNTER RPC
-- ============================================================
create or replace function public.increment_property_view(target_property uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.properties
  set view_count = view_count + 1
  where id = target_property and listing_status = 'published';
$$;

grant execute on function public.increment_property_view(uuid) to anon, authenticated;
