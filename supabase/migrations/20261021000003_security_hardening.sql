-- Security hardening from the full-project audit.
--
--  1. public_verifications no longer exposes reviewer notes or non-verified
--     (pending/rejected) cases to anonymous visitors.
--  2. Enquiry identity fields are immutable: a party can no longer rewrite
--     renter_id/provider_id/contact_preference to unlock enquiry_contacts.
--  3. Roommate interest status transitions are guarded so only the recipient
--     can accept/decline/block; the sender may only resend or withdraw.
--  4. Inspections must belong to the enquiry's property and cannot be moved
--     to another enquiry after creation.
--  5. notify_user only allows notifying users you share an enquiry or roommate
--     interest with (staff exempt) and rate-limits notifications per target.
--  6. Analytics inserts are authenticated and self-attributed only.

-- 1. Verification projection ------------------------------------------------
create or replace view public.public_verifications as
select
  id,
  subject_type,
  subject_id,
  check_type,
  status,
  null::text as notes,
  expires_at,
  reviewed_at
from public.verification_cases
where status = 'verified';

grant select on public.public_verifications to anon, authenticated;

-- 2. Enquiry identity freeze -----------------------------------------------
create or replace function public.enforce_enquiry_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.property_id is distinct from old.property_id
    or new.renter_id is distinct from old.renter_id
    or new.provider_id is distinct from old.provider_id
    or new.contact_preference is distinct from old.contact_preference
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Enquiry parties and contact preference cannot be changed'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists enquiries_identity_freeze on public.enquiries;
create trigger enquiries_identity_freeze
before update on public.enquiries
for each row execute function public.enforce_enquiry_identity();

-- 3. Roommate interest transitions ----------------------------------------
create or replace function public.enforce_roommate_interest_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender uuid;
  receiver uuid;
begin
  if new.from_profile is distinct from old.from_profile
    or new.to_profile is distinct from old.to_profile
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Interest participants cannot be changed'
      using errcode = '42501';
  end if;

  if public.is_staff() then
    return new;
  end if;

  select user_id into sender
  from public.roommate_profiles
  where id = old.from_profile;

  select user_id into receiver
  from public.roommate_profiles
  where id = old.to_profile;

  if old.status = 'blocked' and new.status <> 'blocked' then
    raise exception 'This interest is blocked and cannot be reopened'
      using errcode = '42501';
  end if;

  if new.status = old.status then
    if old.status <> 'pending' and new.message is distinct from old.message then
      raise exception 'This interest is already settled'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if auth.uid() = sender then
    if old.status = 'accepted' then
      raise exception 'This match is already accepted'
        using errcode = '42501';
    end if;
    if old.status = 'withdrawn' and new.status = 'pending' then
      raise exception 'This interest was withdrawn'
        using errcode = '42501';
    end if;
    if new.status not in ('pending', 'withdrawn') then
      raise exception 'Only the recipient can accept, decline, or block'
        using errcode = '42501';
    end if;
  elsif auth.uid() = receiver then
    if old.status <> 'pending' then
      raise exception 'This interest is already settled'
        using errcode = '42501';
    end if;
    if new.status not in ('accepted', 'declined', 'blocked') then
      raise exception 'Unknown interest action'
        using errcode = '42501';
    end if;
  else
    raise exception 'Not a participant in this interest'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists roommate_interests_transition_guard on public.roommate_interests;
create trigger roommate_interests_transition_guard
before update on public.roommate_interests
for each row execute function public.enforce_roommate_interest_transition();

-- 4. Inspection integrity ---------------------------------------------------
create or replace function public.enforce_inspection_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
    and (
      new.enquiry_id is distinct from old.enquiry_id
      or new.property_id is distinct from old.property_id
      or new.requested_by is distinct from old.requested_by
    )
  then
    raise exception 'Inspections cannot be moved to another enquiry or property'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.enquiries e
    where e.id = new.enquiry_id
      and e.property_id = new.property_id
      and new.requested_by in (e.renter_id, e.provider_id)
  ) then
    raise exception 'Inspection does not match its enquiry'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists inspections_integrity_guard on public.inspections;
create trigger inspections_integrity_guard
before insert or update on public.inspections
for each row execute function public.enforce_inspection_integrity();

-- 5. Notification hardening ------------------------------------------------
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
  allowed boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if notice_title is null or char_length(notice_title) = 0 or char_length(notice_title) > 120 then
    raise exception 'Invalid notification title'
      using errcode = '22023';
  end if;

  if notice_body is not null and char_length(notice_body) > 600 then
    raise exception 'Notification body is too long'
      using errcode = '22023';
  end if;

  if notice_href is not null
    and (notice_href not like '/%' or notice_href like '//%')
  then
    raise exception 'Notification link must be an internal path'
      using errcode = '22023';
  end if;

  if public.is_staff() or target_user = auth.uid() then
    allowed := true;
  else
    select
      exists (
        select 1
        from public.enquiries e
        where (e.renter_id = auth.uid() and e.provider_id = target_user)
          or (e.provider_id = auth.uid() and e.renter_id = target_user)
      )
      or exists (
        select 1
        from public.roommate_interests ri
        join public.roommate_profiles fp on fp.id = ri.from_profile
        join public.roommate_profiles tp on tp.id = ri.to_profile
        where (fp.user_id = auth.uid() and tp.user_id = target_user)
          or (tp.user_id = auth.uid() and fp.user_id = target_user)
      )
    into allowed;
  end if;

  if not allowed then
    raise exception 'You are not allowed to notify this user'
      using errcode = '42501';
  end if;

  if (
    select count(*)
    from public.notifications n
    where n.user_id = target_user
      and n.created_at > now() - interval '10 minutes'
  ) >= 20 then
    raise exception 'Too many notifications for this user. Try again later.'
      using errcode = '53400';
  end if;

  insert into public.notifications (user_id, type, title, body, href, payload)
  values (target_user, notice_type, notice_title, notice_body, notice_href, notice_payload)
  returning id into notice_id;

  return notice_id;
end;
$$;

revoke all on function public.notify_user(uuid, public.notification_type, text, text, text, jsonb) from public;
grant execute on function public.notify_user(uuid, public.notification_type, text, text, text, jsonb) to authenticated;

-- 6. Analytics inserts are self-attributed --------------------------------
drop policy if exists analytics_insert on public.analytics_events;
create policy analytics_insert on public.analytics_events
for insert to authenticated
with check (user_id = auth.uid());

revoke insert, update, delete on public.analytics_events from anon;
