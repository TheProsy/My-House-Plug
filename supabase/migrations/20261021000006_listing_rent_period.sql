-- Expose the rent period alongside the cheapest rent so listing cards can
-- stop assuming every price is per year.

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
  (select vc.status from public.public_verifications vc where vc.subject_type = 'user' and vc.subject_id = p.owner_id and vc.check_type = 'identity' and vc.status = 'verified' and (vc.expires_at is null or vc.expires_at > now()) limit 1) as provider_identity_verified,
  (select pu.rent_period from public.property_units pu where pu.property_id = p.id and pu.rent_amount is not null order by pu.rent_amount asc, pu.created_at asc limit 1) as rent_period
from public.properties p
left join public.campuses c on c.id = p.campus_id
left join public.universities u on u.id = c.university_id
left join public.neighbourhoods n on n.id = p.neighbourhood_id
left join public.public_profiles pr on pr.id = p.owner_id;
