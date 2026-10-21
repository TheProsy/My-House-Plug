-- Onboarding: record terms acceptance, support self-service provider upgrades.

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists provider_terms_accepted_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    terms_accepted_at,
    terms_version
  )
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    case
      when new.raw_user_meta_data ->> 'terms_accepted' = 'true' then now()
      else null
    end,
    new.raw_user_meta_data ->> 'terms_version'
  )
  on conflict (id) do nothing;

  requested_role := case new.raw_user_meta_data ->> 'account_type'
    when 'landlord' then 'landlord'
    when 'agent' then 'agent'
    else 'renter'
  end;

  insert into public.user_roles (user_id, role) values (new.id, 'renter')
  on conflict (user_id, role) do nothing;

  if requested_role <> 'renter' then
    insert into public.user_roles (user_id, role) values (new.id, requested_role)
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.upgrade_to_provider(requested_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if requested_role not in ('landlord', 'agent') then
    raise exception 'Only landlord or agent roles can be self-assigned';
  end if;

  insert into public.profiles (id, full_name, provider_terms_accepted_at)
  values (current_user_id, '', now())
  on conflict (id) do update
    set provider_terms_accepted_at = now();

  insert into public.user_roles (user_id, role)
  values (current_user_id, requested_role)
  on conflict (user_id, role) do nothing;
end;
$$;

revoke all on function public.upgrade_to_provider(public.app_role) from public;
grant execute on function public.upgrade_to_provider(public.app_role) to authenticated;
