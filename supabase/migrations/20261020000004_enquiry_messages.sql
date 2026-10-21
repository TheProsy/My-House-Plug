-- ============================================================
-- ENQUIRY MESSAGES (renter <-> provider thread)
-- ============================================================
create table public.enquiry_messages (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint enquiry_messages_body_length check (char_length(body) between 1 and 2000)
);

create index enquiry_messages_enquiry_idx on public.enquiry_messages (enquiry_id, created_at);

alter table public.enquiry_messages enable row level security;

create policy enquiry_messages_select on public.enquiry_messages
for select using (public.is_enquiry_party(enquiry_id));

create policy enquiry_messages_insert on public.enquiry_messages
for insert with check (
  sender_id = auth.uid()
  and public.is_enquiry_party(enquiry_id)
);

-- First provider reply marks the enquiry as responded; keep updated_at fresh.
create or replace function public.apply_enquiry_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  enquiry_row public.enquiries%rowtype;
begin
  select * into enquiry_row from public.enquiries where id = new.enquiry_id;
  if enquiry_row.id is null then
    return new;
  end if;

  update public.enquiries
  set
    updated_at = now(),
    responded_at = case
      when new.sender_id = enquiry_row.provider_id
        and enquiry_row.responded_at is null
      then now()
      else enquiry_row.responded_at
    end,
    status = case
      when new.sender_id = enquiry_row.provider_id
        and enquiry_row.status = 'open'
      then 'responded'
      else enquiry_row.status
    end
  where id = new.enquiry_id;

  return new;
end;
$$;

create trigger enquiry_messages_apply after insert on public.enquiry_messages
for each row execute function public.apply_enquiry_message();
