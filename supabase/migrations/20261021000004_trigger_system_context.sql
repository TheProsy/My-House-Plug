-- Allow trusted database/service-role maintenance to bypass the client-facing
-- identity transition guards. PostgREST requests from clients always carry an
-- auth.uid() whenever RLS would permit the write, so a null uid is a system
-- context (migrations, seed, service role).
create or replace function public.enforce_enquiry_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

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

  if public.is_staff() or auth.uid() is null then
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
