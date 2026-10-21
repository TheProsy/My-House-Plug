-- Verification resubmission + content review.
--
-- 1. Verification cases keep history: only one active case (pending/more info/
--    verified) can exist per subject and check type. A rejected or expired case
--    no longer blocks a fresh request.
-- 2. Providers may move any editable listing back to pending_review when its
--    content changes. Suspended listings stay admin-only.

alter table public.verification_cases
  drop constraint if exists verification_cases_subject_type_subject_id_check_type_key;

create unique index if not exists verification_cases_active_subject_idx
  on public.verification_cases (subject_type, subject_id, check_type)
  where status in ('pending_review', 'more_info_required', 'verified');

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
      or (old.listing_status = 'published' and new.listing_status in ('paused', 'rented', 'archived', 'pending_review'))
      or (old.listing_status = 'paused' and new.listing_status in ('published', 'archived', 'pending_review'))
      or (old.listing_status in ('rented', 'archived', 'rejected') and new.listing_status in ('published', 'pending_review'))
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
