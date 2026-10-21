-- Tighten directory view grants.
--
-- Supabase's default privileges grant new views in `public` to anon as well as
-- authenticated, so `grant select ... to authenticated` in the previous
-- migration did not stop anonymous reads. These views expose roommate
-- profiles and consented contact details, which should require a session.
revoke all on public.roommate_directory from anon, public;
revoke all on public.roommate_interest_inbox from anon, public;
revoke all on public.enquiry_contacts from anon, public;

grant select on public.roommate_directory to authenticated;
grant select on public.roommate_interest_inbox to authenticated;
grant select on public.enquiry_contacts to authenticated;
