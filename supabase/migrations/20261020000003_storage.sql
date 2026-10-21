-- Storage buckets and object policies
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('property-photos', 'property-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('verification-evidence', 'verification-evidence', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy property_photos_public_read on storage.objects
for select using (bucket_id = 'property-photos');

create policy property_photos_owner_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'property-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy property_photos_owner_update on storage.objects
for update to authenticated
using (
  bucket_id = 'property-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy property_photos_owner_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'property-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy avatars_public_read on storage.objects
for select using (bucket_id = 'avatars');

create policy avatars_owner_write on storage.objects
for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy avatars_owner_update on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy avatars_owner_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy verification_evidence_read on storage.objects
for select to authenticated
using (
  bucket_id = 'verification-evidence'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_staff()
  )
);

create policy verification_evidence_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'verification-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy verification_evidence_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'verification-evidence'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);
