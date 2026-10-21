-- Repair auth users created before the handle_new_user trigger was deployed.
-- Their sessions are valid but they have no profile/roles, so the app treats
-- them as signed out and bounces protected routes back to /login.

insert into public.profiles (id, full_name, phone)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(u.email, 'Member'), '@', 1)
  ),
  nullif(trim(u.raw_user_meta_data ->> 'phone'), '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select u.id, 'renter'::public.app_role
from auth.users u
where not exists (
  select 1 from public.user_roles r
  where r.user_id = u.id and r.role = 'renter'
)
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select u.id, (u.raw_user_meta_data ->> 'account_type')::public.app_role
from auth.users u
where u.raw_user_meta_data ->> 'account_type' in ('landlord', 'agent')
on conflict (user_id, role) do nothing;

-- App-level safety net: authenticated users can repair their own missing
-- profile and roles without exposing role escalation (only renter, landlord,
-- or agent can be derived from signup metadata).
create or replace function public.ensure_own_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  account_meta jsonb;
  account_email text;
  requested_role public.app_role;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select u.raw_user_meta_data, u.email
  into account_meta, account_email
  from auth.users u
  where u.id = current_user_id;

  if not found then
    raise exception 'Account not found';
  end if;

  insert into public.profiles (id, full_name, phone)
  values (
    current_user_id,
    coalesce(
      nullif(trim(account_meta ->> 'full_name'), ''),
      split_part(coalesce(account_email, 'Member'), '@', 1)
    ),
    nullif(trim(account_meta ->> 'phone'), '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (current_user_id, 'renter')
  on conflict (user_id, role) do nothing;

  requested_role := case account_meta ->> 'account_type'
    when 'landlord' then 'landlord'::public.app_role
    when 'agent' then 'agent'::public.app_role
    else null
  end;

  if requested_role is not null then
    insert into public.user_roles (user_id, role)
    values (current_user_id, requested_role)
    on conflict (user_id, role) do nothing;
  end if;
end;
$$;

revoke all on function public.ensure_own_profile() from public;
grant execute on function public.ensure_own_profile() to authenticated;
