-- Public directory views.
--
-- profiles / verification_cases RLS only exposes rows to their owner (or staff).
-- These security-definer views (owned by the migration role, which bypasses RLS)
-- expose safe projections so directory, trust signals, and consented contact
-- details render for other users:
--   * public_verifications        - check status without notes/evidence
--   * property_listings (rebuild) - provider name/avatar + verification flags
--   * roommate_directory          - visible roommate profiles for matching
--   * roommate_interest_inbox     - interests involving the viewer, contact gated
--   * enquiry_contacts            - renter phone for providers, only when consented

-- Public verification projection: check status and the public review summary
-- (no evidence paths, no staff-only fields beyond the review note).
create or replace view public.public_verifications as
select
  id,
  subject_type,
  subject_id,
  check_type,
  status,
  notes,
  expires_at,
  reviewed_at
from public.verification_cases;

grant select on public.public_verifications to anon, authenticated;

-- Rebuild property_listings so provider identity and verification flags
-- resolve through the definer views instead of RLS-filtered tables.
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
  (select vc.status from public.public_verifications vc where vc.subject_type = 'property' and vc.subject_id = p.id and vc.check_type = 'property_authorization' and vc.status = 'verified' and (vc.expires_at is null or vc.expires_at > now()) limit 1) as authorization_verified,
  (select vc.status from public.public_verifications vc where vc.subject_type = 'property' and vc.subject_id = p.id and vc.check_type = 'property_visit' and vc.status = 'verified' and (vc.expires_at is null or vc.expires_at > now()) limit 1) as visit_verified,
  (select vc.status from public.public_verifications vc where vc.subject_type = 'user' and vc.subject_id = p.owner_id and vc.check_type = 'identity' and vc.status = 'verified' and (vc.expires_at is null or vc.expires_at > now()) limit 1) as provider_identity_verified
from public.properties p
left join public.campuses c on c.id = p.campus_id
left join public.universities u on u.id = c.university_id
left join public.neighbourhoods n on n.id = p.neighbourhood_id
left join public.public_profiles pr on pr.id = p.owner_id;

-- Roommate directory: only profiles that are visible (or the viewer's own),
-- with display data and an identity-verified signal.
create or replace view public.roommate_directory as
select
  rp.id,
  rp.user_id,
  rp.display_name,
  rp.campus_id,
  c.name as campus_name,
  rp.neighbourhood_id,
  n.name as neighbourhood_name,
  rp.budget_min,
  rp.budget_max,
  rp.move_in_date,
  rp.accommodation_type,
  rp.bio,
  rp.is_visible,
  rp.contact_visibility,
  rp.created_at,
  rp.updated_at,
  pref.sharing_arrangement,
  pref.sleep_schedule,
  pref.cleanliness,
  pref.cooking,
  pref.study_environment,
  pref.guest_policy,
  pref.smoking,
  pp.avatar_url,
  exists (
    select 1
    from public.public_verifications vc
    where vc.subject_type = 'user'
      and vc.subject_id = rp.user_id
      and vc.check_type = 'identity'
      and vc.status = 'verified'
      and (vc.expires_at is null or vc.expires_at > now())
  ) as identity_verified
from public.roommate_profiles rp
left join public.roommate_preferences pref on pref.profile_id = rp.id
left join public.public_profiles pp on pp.id = rp.user_id
left join public.campuses c on c.id = rp.campus_id
left join public.neighbourhoods n on n.id = rp.neighbourhood_id
where rp.is_visible or rp.user_id = auth.uid();

grant select on public.roommate_directory to authenticated;

-- Interest inbox: every interest involving the viewer, with counterpart
-- display data. The counterpart's phone is only exposed once the interest is
-- accepted and their contact visibility allows it.
create or replace view public.roommate_interest_inbox as
select
  ri.id as interest_id,
  ri.from_profile,
  ri.to_profile,
  ri.status,
  ri.message,
  ri.created_at,
  ri.responded_at,
  mrp.id as my_profile_id,
  case when ri.from_profile = mrp.id then 'outgoing' else 'incoming' end as direction,
  cp.id as counterpart_profile_id,
  cp.display_name as counterpart_display_name,
  cp.contact_visibility as counterpart_contact_visibility,
  cp.campus_id as counterpart_campus_id,
  cc.name as counterpart_campus_name,
  cp.neighbourhood_id as counterpart_neighbourhood_id,
  cn.name as counterpart_neighbourhood_name,
  cperson.avatar_url as counterpart_avatar_url,
  case
    when ri.status = 'accepted'
      and cp.contact_visibility <> 'private'
      and cperson.is_suspended = false
    then cperson.phone
  end as counterpart_phone
from public.roommate_interests ri
join public.roommate_profiles mrp
  on mrp.user_id = auth.uid()
  and (mrp.id = ri.from_profile or mrp.id = ri.to_profile)
join public.roommate_profiles cp
  on cp.id = case when ri.from_profile = mrp.id then ri.to_profile else ri.from_profile end
left join public.profiles cperson on cperson.id = cp.user_id
left join public.campuses cc on cc.id = cp.campus_id
left join public.neighbourhoods cn on cn.id = cp.neighbourhood_id;

grant select on public.roommate_interest_inbox to authenticated;

-- Enquiry contacts: a provider can see the renter's phone only when the renter
-- chose phone/WhatsApp as the contact preference for that enquiry.
create or replace view public.enquiry_contacts as
select
  e.id as enquiry_id,
  ren.phone as renter_phone
from public.enquiries e
join public.profiles ren on ren.id = e.renter_id
where e.provider_id = auth.uid()
  and e.contact_preference in ('phone', 'whatsapp')
  and ren.phone is not null;

grant select on public.enquiry_contacts to authenticated;
