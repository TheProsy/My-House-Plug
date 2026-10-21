-- MY AGENT seed data (pilot market: FUTA, Akure)
-- Demo accounts use password: DemoPass123!
-- Remove demo accounts and listings before a real public launch.

insert into public.universities (name, slug, state, city) values
  ('Federal University of Technology Akure', 'futa', 'Ondo', 'Akure')
on conflict (slug) do nothing;

insert into public.campuses (university_id, name, slug, address, lat, lng)
select id, 'FUTA Main Campus', 'futa-main', 'Obanla, Akure', 7.3043, 5.1379
from public.universities where slug = 'futa'
on conflict (university_id, slug) do nothing;

insert into public.neighbourhoods (campus_id, name, slug, lat, lng)
select c.id, v.name, v.slug, v.lat, v.lng
from public.campuses c
cross join (values
  ('Obanla', 'obanla', 7.3020, 5.1401),
  ('South Gate', 'south-gate', 7.2981, 5.1352),
  ('North Gate', 'north-gate', 7.3118, 5.1390),
  ('Ijoka', 'ijoka', 7.2952, 5.1281),
  ('Oke-Ijebu', 'oke-ijebu', 7.3075, 5.1305),
  ('Aule', 'aule', 7.2890, 5.1455)
) as v(name, slug, lat, lng)
where c.slug = 'futa-main'
on conflict (campus_id, slug) do nothing;

insert into public.amenities (key, label, category, icon) values
  ('prepaid_meter', 'Prepaid meter', 'utilities', 'gauge'),
  ('borehole', 'Borehole water', 'utilities', 'droplets'),
  ('generator', 'Generator', 'utilities', 'zap'),
  ('solar', 'Solar power', 'utilities', 'sun'),
  ('water', 'Water supply', 'utilities', 'droplets'),
  ('electricity', 'Electricity', 'utilities', 'zap'),
  ('internet', 'Internet', 'utilities', 'wifi'),
  ('kitchen', 'Kitchen', 'facilities', 'cooking-pot'),
  ('private_bathroom', 'Private bathroom', 'facilities', 'bath'),
  ('shared_bathroom', 'Shared bathroom', 'facilities', 'bath'),
  ('parking', 'Parking', 'facilities', 'car'),
  ('tiled_floors', 'Tiled floors', 'facilities', 'grid-3x3'),
  ('balcony', 'Balcony', 'facilities', 'building-2'),
  ('fenced_compound', 'Fenced compound', 'security', 'fence'),
  ('security', 'Security', 'security', 'shield'),
  ('cctv', 'CCTV', 'security', 'cctv'),
  ('gate_house', 'Gate house', 'security', 'door-open'),
  ('furnished', 'Furnished', 'facilities', 'sofa')
on conflict (key) do nothing;

-- Demo accounts
-- renter@ / renter2@ / landlord@ / agent@ / admin@ / verifier@
-- Password for all: DemoPass123!
do $$
declare
  demo_agent uuid := '11111111-1111-4111-8111-111111111111';
  demo_landlord uuid := '22222222-2222-4222-8222-222222222222';
  demo_renter uuid := '33333333-3333-4333-8333-333333333333';
  demo_renter_two uuid := '44444444-4444-4444-8444-444444444444';
  demo_admin uuid := '55555555-5555-4555-8555-555555555555';
  demo_verifier uuid := '66666666-6666-4666-8666-666666666666';
begin
  if not exists (select 1 from auth.users where id = demo_agent) then
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    values (demo_agent, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'agent@demo.myagent.ng', crypt('DemoPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Adeola Adeyemi","account_type":"agent"}', now(), now(), '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), demo_agent, jsonb_build_object('sub', demo_agent::text, 'email', 'agent@demo.myagent.ng'), 'email', demo_agent::text, now(), now(), now());
  end if;

  if not exists (select 1 from auth.users where id = demo_landlord) then
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    values (demo_landlord, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'landlord@demo.myagent.ng', crypt('DemoPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Babatunde Ojo","account_type":"landlord"}', now(), now(), '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), demo_landlord, jsonb_build_object('sub', demo_landlord::text, 'email', 'landlord@demo.myagent.ng'), 'email', demo_landlord::text, now(), now(), now());
  end if;

  if not exists (select 1 from auth.users where id = demo_renter) then
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    values (demo_renter, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'renter@demo.myagent.ng', crypt('DemoPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Chiamaka Eze","account_type":"renter"}', now(), now(), '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), demo_renter, jsonb_build_object('sub', demo_renter::text, 'email', 'renter@demo.myagent.ng'), 'email', demo_renter::text, now(), now(), now());
  end if;

  if not exists (select 1 from auth.users where id = demo_renter_two) then
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    values (demo_renter_two, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'renter2@demo.myagent.ng', crypt('DemoPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ibrahim Musa","account_type":"renter"}', now(), now(), '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), demo_renter_two, jsonb_build_object('sub', demo_renter_two::text, 'email', 'renter2@demo.myagent.ng'), 'email', demo_renter_two::text, now(), now(), now());
  end if;

  if not exists (select 1 from auth.users where id = demo_admin) then
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    values (demo_admin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@demo.myagent.ng', crypt('DemoPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Admin","account_type":"renter"}', now(), now(), '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), demo_admin, jsonb_build_object('sub', demo_admin::text, 'email', 'admin@demo.myagent.ng'), 'email', demo_admin::text, now(), now(), now());
  end if;

  if not exists (select 1 from auth.users where id = demo_verifier) then
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    values (demo_verifier, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'verifier@demo.myagent.ng', crypt('DemoPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Verifier","account_type":"renter"}', now(), now(), '', '', '', '');
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), demo_verifier, jsonb_build_object('sub', demo_verifier::text, 'email', 'verifier@demo.myagent.ng'), 'email', demo_verifier::text, now(), now(), now());
  end if;

  insert into public.user_roles (user_id, role) values (demo_admin, 'admin')
  on conflict (user_id, role) do nothing;

  insert into public.user_roles (user_id, role) values (demo_verifier, 'verifier')
  on conflict (user_id, role) do nothing;
end $$;

-- Listings
insert into public.properties (id, owner_id, title, slug, description, property_type, campus_id, neighbourhood_id, address, lat, lng, furnished, listing_status, availability_status, available_from, last_availability_confirmed_at, published_at, created_at)
select v.id::uuid, v.owner_id::uuid, v.title, v.slug, v.description, v.property_type::public.property_type,
  (select id from public.campuses where slug = 'futa-main'),
  (select id from public.neighbourhoods where slug = v.neighbourhood),
  v.address, v.lat, v.lng, v.furnished, 'published'::public.listing_status, 'available'::public.availability_status,
  current_date + v.available_days, now() - (v.confirmed_days || ' days')::interval, now() - (v.published_days || ' days')::interval, now() - (v.published_days || ' days')::interval
from (values
  ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Sunny self-contain at Obanla', 'sunny-self-contain-obanla', 'Bright self-contain close to the Obanla gate. Prepaid meter, borehole water, and a quiet fenced compound. Tiled throughout with a private bathroom.', 'self_contain', 'obanla', 'Obanla, Akure', 7.3021, 5.1402, false, 5, 2, 12),
  ('aaaaaaaa-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'Tiled mini flat near South Gate', 'tiled-mini-flat-south-gate', 'Neat mini flat a short walk from the South Gate. Separate kitchen and bathroom, prepaid meter, and a gated compound with a caretaker.', 'mini_flat', 'south-gate', 'South Gate, Akure', 7.2981, 5.1353, false, 10, 20, 27),
  ('aaaaaaaa-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Shared room in a 3-bedroom flat, North Gate', 'shared-room-north-gate', 'One room available in a shared 3-bedroom flat occupied by two final-year students. Shared kitchen and bathroom. Quiet study-friendly flat.', 'shared_room', 'north-gate', 'North Gate, Akure', 7.3119, 5.1391, true, 14, 3, 9),
  ('aaaaaaaa-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'Modern 1-bedroom apartment, Ijoka', 'modern-1-bedroom-ijoka', 'Newly finished one-bedroom apartment with tiled floors, kitchen cabinets, and a balcony. Prepaid meter and borehole water. Suitable for young professionals.', 'one_bedroom', 'ijoka', 'Ijoka, Akure', 7.2953, 5.1282, true, 21, 1, 15),
  ('aaaaaaaa-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'Budget single room, Oke-Ijebu', 'budget-single-room-oke-ijebu', 'Affordable single room in a shared compound. Shared bathroom and kitchen. Water is available from the compound borehole. Good option for a first-year student.', 'single_room', 'oke-ijebu', 'Oke-Ijebu, Akure', 7.3076, 5.1306, false, 7, 6, 20),
  ('aaaaaaaa-0000-4000-8000-000000000006', '22222222-2222-4222-8222-222222222222', '2-bedroom bungalow with borehole, Aule', '2-bedroom-bungalow-aule', 'Spacious two-bedroom bungalow with a fenced compound, borehole, and space for parking. Ideal for sharing between two or three people.', 'bungalow', 'aule', 'Aule, Akure', 7.2891, 5.1456, false, 20, 25, 30),
  ('aaaaaaaa-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', 'Hostel space at Obanla Close', 'hostel-space-obanla-close', 'Bed space in a managed hostel close to campus. Shared facilities, steady water supply, and a resident caretaker. Service charge amount is still being confirmed by the provider.', 'hostel_space', 'obanla', 'Obanla Close, Akure', 7.3024, 5.1398, true, 30, 4, 6),
  ('aaaaaaaa-0000-4000-8000-000000000008', '22222222-2222-4222-8222-222222222222', 'Furnished self-contain, South Gate', 'furnished-self-contain-south-gate', 'Furnished self-contain with a bed, wardrobe, reading table, and private bathroom. Tiled and painted in 2025. Walking distance to the South Gate.', 'self_contain', 'south-gate', 'South Gate, Akure', 7.2979, 5.1350, true, 4, 1, 5),
  ('aaaaaaaa-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', '3-bedroom duplex for sharing, Ijoka', '3-bedroom-duplex-sharing-ijoka', 'Full duplex available for a group of three to four tenants. Large compound, parking, and a balcony. Rent can be split per room by agreement with the provider.', 'three_bedroom', 'ijoka', 'Ijoka, Akure', 7.2950, 5.1279, false, 18, 8, 18),
  ('aaaaaaaa-0000-4000-8000-000000000010', '22222222-2222-4222-8222-222222222222', 'Compact mini flat, North Gate', 'compact-mini-flat-north-gate', 'Compact mini flat with a separate bathroom and kitchenette. Prepaid meter and fenced compound. Close to the North Gate taxi stop.', 'mini_flat', 'north-gate', 'North Gate, Akure', 7.3115, 5.1388, false, 9, 5, 11)
) as v(id, owner_id, title, slug, description, property_type, neighbourhood, address, lat, lng, furnished, available_days, confirmed_days, published_days)
on conflict (id) do nothing;

insert into public.property_units (id, property_id, unit_type, title, bedrooms, bathrooms, is_shared, rent_amount, rent_period)
values
  ('bbbbbbbb-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'self_contain', 'Self-contain', 1, 1, false, 190000, 'per_year'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000002', 'mini_flat', 'Mini flat', 1, 1, false, 350000, 'per_year'),
  ('bbbbbbbb-0000-4000-8000-000000000003', 'aaaaaaaa-0000-4000-8000-000000000003', 'shared_room', 'Shared room', 1, 1, true, 120000, 'per_year'),
  ('bbbbbbbb-0000-4000-8000-000000000004', 'aaaaaaaa-0000-4000-8000-000000000004', 'one_bedroom', 'One bedroom', 1, 1, false, 450000, 'per_year'),
  ('bbbbbbbb-0000-4000-8000-000000000005', 'aaaaaaaa-0000-4000-8000-000000000005', 'single_room', 'Single room', 1, 1, true, 95000, 'per_year'),
  ('bbbbbbbb-0000-4000-8000-000000000006', 'aaaaaaaa-0000-4000-8000-000000000006', 'two_bedroom', 'Two bedrooms', 2, 1, false, 600000, 'per_year'),
  ('bbbbbbbb-0000-4000-8000-000000000007', 'aaaaaaaa-0000-4000-8000-000000000007', 'hostel_space', 'Bed space', 1, 1, true, 85000, 'per_year'),
  ('bbbbbbbb-0000-4000-8000-000000000008', 'aaaaaaaa-0000-4000-8000-000000000008', 'self_contain', 'Furnished self-contain', 1, 1, false, 260000, 'per_year'),
  ('bbbbbbbb-0000-4000-8000-000000000009', 'aaaaaaaa-0000-4000-8000-000000000009', 'three_bedroom', 'Duplex (whole)', 3, 2, false, 700000, 'per_year'),
  ('bbbbbbbb-0000-4000-8000-000000000010', 'aaaaaaaa-0000-4000-8000-000000000010', 'mini_flat', 'Mini flat', 1, 1, false, 300000, 'per_year')
on conflict (id) do nothing;

insert into public.property_costs (property_id, label, category, amount, is_known, is_mandatory, is_refundable, recurrence, notes)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Agency fee', 'agency_fee', 19000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Legal fee', 'legal_fee', 9500, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Caution deposit', 'caution_deposit', 30000, true, true, true, 'one_time', 'Refundable at the end of the tenancy, subject to the provider''s inspection.'),
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Service charge', 'service_charge', 15000, true, true, false, 'annually', null),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Agency fee', 'agency_fee', 35000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Legal fee', 'legal_fee', 17500, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Caution deposit', 'caution_deposit', 50000, true, true, true, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Service charge', 'service_charge', 20000, true, true, false, 'annually', null),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'Agency fee', 'agency_fee', 12000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'Caution deposit', 'caution_deposit', 20000, true, true, true, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'Service charge', 'service_charge', null, false, true, false, 'annually', 'Provider has not confirmed this amount yet.'),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'Agency fee', 'agency_fee', 45000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'Legal fee', 'legal_fee', 22500, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'Caution deposit', 'caution_deposit', 60000, true, true, true, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'Service charge', 'service_charge', 25000, true, true, false, 'annually', null),
  ('aaaaaaaa-0000-4000-8000-000000000005', 'Agency fee', 'agency_fee', 9500, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000005', 'Caution deposit', 'caution_deposit', 15000, true, true, true, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000006', 'Agency fee', 'agency_fee', 60000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000006', 'Legal fee', 'legal_fee', 30000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000006', 'Caution deposit', 'caution_deposit', 80000, true, true, true, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000006', 'Service charge', 'service_charge', 30000, true, true, false, 'annually', null),
  ('aaaaaaaa-0000-4000-8000-000000000007', 'Caution deposit', 'caution_deposit', 10000, true, true, true, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000007', 'Service charge', 'service_charge', null, false, true, false, 'annually', 'Amount still being confirmed by the provider.'),
  ('aaaaaaaa-0000-4000-8000-000000000008', 'Agency fee', 'agency_fee', 26000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000008', 'Legal fee', 'legal_fee', 13000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000008', 'Caution deposit', 'caution_deposit', 40000, true, true, true, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000008', 'Service charge', 'service_charge', 18000, true, true, false, 'annually', null),
  ('aaaaaaaa-0000-4000-8000-000000000009', 'Agency fee', 'agency_fee', 70000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000009', 'Legal fee', 'legal_fee', 35000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000009', 'Caution deposit', 'caution_deposit', 100000, true, true, true, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000009', 'Service charge', 'service_charge', 35000, true, true, false, 'annually', null),
  ('aaaaaaaa-0000-4000-8000-000000000010', 'Agency fee', 'agency_fee', 30000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000010', 'Legal fee', 'legal_fee', 15000, true, true, false, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000010', 'Caution deposit', 'caution_deposit', 45000, true, true, true, 'one_time', null),
  ('aaaaaaaa-0000-4000-8000-000000000010', 'Service charge', 'service_charge', 20000, true, true, false, 'annually', null);

insert into public.property_amenities (property_id, amenity_id)
select p.id, a.id
from (values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'prepaid_meter'), ('aaaaaaaa-0000-4000-8000-000000000001', 'borehole'), ('aaaaaaaa-0000-4000-8000-000000000001', 'private_bathroom'), ('aaaaaaaa-0000-4000-8000-000000000001', 'tiled_floors'), ('aaaaaaaa-0000-4000-8000-000000000001', 'security'), ('aaaaaaaa-0000-4000-8000-000000000001', 'parking'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'prepaid_meter'), ('aaaaaaaa-0000-4000-8000-000000000002', 'water'), ('aaaaaaaa-0000-4000-8000-000000000002', 'kitchen'), ('aaaaaaaa-0000-4000-8000-000000000002', 'private_bathroom'), ('aaaaaaaa-0000-4000-8000-000000000002', 'fenced_compound'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'shared_bathroom'), ('aaaaaaaa-0000-4000-8000-000000000003', 'kitchen'), ('aaaaaaaa-0000-4000-8000-000000000003', 'prepaid_meter'), ('aaaaaaaa-0000-4000-8000-000000000003', 'internet'), ('aaaaaaaa-0000-4000-8000-000000000003', 'furnished'),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'prepaid_meter'), ('aaaaaaaa-0000-4000-8000-000000000004', 'borehole'), ('aaaaaaaa-0000-4000-8000-000000000004', 'kitchen'), ('aaaaaaaa-0000-4000-8000-000000000004', 'balcony'), ('aaaaaaaa-0000-4000-8000-000000000004', 'tiled_floors'), ('aaaaaaaa-0000-4000-8000-000000000004', 'furnished'),
  ('aaaaaaaa-0000-4000-8000-000000000005', 'water'), ('aaaaaaaa-0000-4000-8000-000000000005', 'shared_bathroom'), ('aaaaaaaa-0000-4000-8000-000000000005', 'kitchen'), ('aaaaaaaa-0000-4000-8000-000000000005', 'security'),
  ('aaaaaaaa-0000-4000-8000-000000000006', 'borehole'), ('aaaaaaaa-0000-4000-8000-000000000006', 'parking'), ('aaaaaaaa-0000-4000-8000-000000000006', 'fenced_compound'), ('aaaaaaaa-0000-4000-8000-000000000006', 'kitchen'), ('aaaaaaaa-0000-4000-8000-000000000006', 'prepaid_meter'),
  ('aaaaaaaa-0000-4000-8000-000000000007', 'water'), ('aaaaaaaa-0000-4000-8000-000000000007', 'security'), ('aaaaaaaa-0000-4000-8000-000000000007', 'shared_bathroom'), ('aaaaaaaa-0000-4000-8000-000000000007', 'furnished'),
  ('aaaaaaaa-0000-4000-8000-000000000008', 'furnished'), ('aaaaaaaa-0000-4000-8000-000000000008', 'private_bathroom'), ('aaaaaaaa-0000-4000-8000-000000000008', 'tiled_floors'), ('aaaaaaaa-0000-4000-8000-000000000008', 'prepaid_meter'),
  ('aaaaaaaa-0000-4000-8000-000000000009', 'parking'), ('aaaaaaaa-0000-4000-8000-000000000009', 'balcony'), ('aaaaaaaa-0000-4000-8000-000000000009', 'fenced_compound'), ('aaaaaaaa-0000-4000-8000-000000000009', 'borehole'), ('aaaaaaaa-0000-4000-8000-000000000009', 'security'),
  ('aaaaaaaa-0000-4000-8000-000000000010', 'prepaid_meter'), ('aaaaaaaa-0000-4000-8000-000000000010', 'water'), ('aaaaaaaa-0000-4000-8000-000000000010', 'private_bathroom'), ('aaaaaaaa-0000-4000-8000-000000000010', 'fenced_compound')
) as v(property_id, amenity_key)
join public.properties p on p.id = v.property_id::uuid
join public.amenities a on a.key = v.amenity_key
on conflict do nothing;

insert into public.property_photos (property_id, storage_path, sort_order, is_cover)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=70', 0, true),
  ('aaaaaaaa-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=70', 1, false),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=70', 0, true),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=70', 1, false),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=70', 0, true),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=70', 0, true),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=70', 1, false),
  ('aaaaaaaa-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=70', 0, true),
  ('aaaaaaaa-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70', 0, true),
  ('aaaaaaaa-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=70', 0, true),
  ('aaaaaaaa-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=70', 0, true),
  ('aaaaaaaa-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70', 0, true),
  ('aaaaaaaa-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=70', 0, true)
on conflict do nothing;

insert into public.availability_confirmations (property_id, confirmed_by, confirmed_at, method, expires_at)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', now() - interval '2 days', 'provider_confirmation', now() + interval '12 days'),
  ('aaaaaaaa-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', now() - interval '20 days', 'provider_confirmation', now() + interval '1 day'),
  ('aaaaaaaa-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', now() - interval '3 days', 'provider_confirmation', now() + interval '11 days'),
  ('aaaaaaaa-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', now() - interval '1 day', 'provider_confirmation', now() + interval '13 days'),
  ('aaaaaaaa-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', now() - interval '6 days', 'provider_confirmation', now() + interval '8 days'),
  ('aaaaaaaa-0000-4000-8000-000000000006', '22222222-2222-4222-8222-222222222222', now() - interval '25 days', 'provider_confirmation', now() + interval '2 days'),
  ('aaaaaaaa-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', now() - interval '4 days', 'provider_confirmation', now() + interval '10 days'),
  ('aaaaaaaa-0000-4000-8000-000000000008', '22222222-2222-4222-8222-222222222222', now() - interval '1 day', 'provider_confirmation', now() + interval '13 days'),
  ('aaaaaaaa-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', now() - interval '8 days', 'provider_confirmation', now() + interval '6 days'),
  ('aaaaaaaa-0000-4000-8000-000000000010', '22222222-2222-4222-8222-222222222222', now() - interval '5 days', 'provider_confirmation', now() + interval '9 days');

insert into public.verification_cases (subject_type, subject_id, check_type, status, reviewed_by, reviewed_at, notes, expires_at)
values
  ('user', '11111111-1111-4111-8111-111111111111', 'identity', 'verified', '22222222-2222-4222-8222-222222222222', now() - interval '30 days', 'Identity document reviewed.', now() + interval '335 days'),
  ('user', '22222222-2222-4222-8222-222222222222', 'identity', 'verified', '22222222-2222-4222-8222-222222222222', now() - interval '28 days', 'Identity document reviewed.', now() + interval '337 days'),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000001', 'property_authorization', 'verified', '22222222-2222-4222-8222-222222222222', now() - interval '9 days', 'Owner authorization letter and utility bill reviewed.', now() + interval '356 days'),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000001', 'property_visit', 'verified', '22222222-2222-4222-8222-222222222222', now() - interval '8 days', 'Physical visit completed by platform verifier.', now() + interval '174 days'),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000002', 'property_authorization', 'pending_review', null, null, 'Awaiting review.', null),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000003', 'property_authorization', 'pending_review', null, null, 'Awaiting review.', null),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000004', 'property_authorization', 'verified', '22222222-2222-4222-8222-222222222222', now() - interval '12 days', 'Ownership documents reviewed.', now() + interval '353 days'),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000004', 'property_visit', 'verified', '22222222-2222-4222-8222-222222222222', now() - interval '11 days', 'Physical visit completed by platform verifier.', now() + interval '171 days'),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000005', 'property_authorization', 'more_info_required', null, null, 'Provider needs to submit a signed authorization letter.', null),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000006', 'property_authorization', 'verified', '22222222-2222-4222-8222-222222222222', now() - interval '20 days', 'Ownership documents reviewed.', now() + interval '345 days'),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000008', 'property_authorization', 'verified', '22222222-2222-4222-8222-222222222222', now() - interval '4 days', 'Ownership documents reviewed.', now() + interval '361 days'),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000009', 'property_authorization', 'pending_review', null, null, 'Awaiting review.', null),
  ('property', 'aaaaaaaa-0000-4000-8000-000000000010', 'property_authorization', 'pending_review', null, null, 'Awaiting review.', null)
on conflict do nothing;

-- Roommate profiles
insert into public.roommate_profiles (id, user_id, display_name, campus_id, neighbourhood_id, budget_min, budget_max, move_in_date, accommodation_type, bio, is_visible, contact_visibility)
values
  ('cccccccc-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Chiamaka', (select id from public.campuses where slug = 'futa-main'), (select id from public.neighbourhoods where slug = 'obanla'), 100000, 200000, current_date + 30, 'shared_room', 'Final-year student looking for a quiet shared flat near Obanla. Early riser, keeps shared spaces tidy.', true, 'after_request'),
  ('cccccccc-0000-4000-8000-000000000002', '44444444-4444-4444-8444-444444444444', 'Ibrahim', (select id from public.campuses where slug = 'futa-main'), (select id from public.neighbourhoods where slug = 'south-gate'), 120000, 250000, current_date + 21, 'shared_room', 'MSc student, mostly on campus during the day. Non-smoker, prefers a calm flat with occasional guests.', true, 'after_request')
on conflict (id) do nothing;

insert into public.roommate_preferences (profile_id, sharing_arrangement, sleep_schedule, cleanliness, cooking, study_environment, guest_policy, smoking, gender_preference)
values
  ('cccccccc-0000-4000-8000-000000000001', 'own_room_shared_flat', 'early_bird', 'tidy', 'often', 'quiet', 'occasionally', 'no', 'female'),
  ('cccccccc-0000-4000-8000-000000000002', 'shared_room', 'night_owl', 'moderate', 'sometimes', 'quiet', 'rarely', 'no', 'male')
on conflict (profile_id) do nothing;

-- Demo roommate interest: Ibrahim -> Chiamaka (pending, shows up in her interests inbox)
insert into public.roommate_interests (id, from_profile, to_profile, status, message, created_at)
values (
  '99999999-0000-4000-8000-000000000001',
  'cccccccc-0000-4000-8000-000000000002',
  'cccccccc-0000-4000-8000-000000000001',
  'pending',
  'Hi Chiamaka — we both want a quiet place near FUTA. Want to compare notes on budgets and areas?',
  now() - interval '1 day'
)
on conflict do nothing;

-- Demo report for the moderation queue
insert into public.reports (reporter_id, target_type, target_id, reason, details, severity, status)
values ('33333333-3333-4333-8333-333333333333', 'listing', 'aaaaaaaa-0000-4000-8000-000000000002', 'incorrect_availability', 'Provider said the mini flat has been taken, but the listing still shows as available.', 'medium', 'open');

insert into public.notifications (user_id, type, title, body, href)
values ('33333333-3333-4333-8333-333333333333', 'system', 'Welcome to MY AGENT', 'Start with a campus search, then save the homes you like.', '/search');

-- Demo enquiry thread: Chiamaka (renter) -> Faith (agent) for the FUTA 1-bedroom.
insert into public.enquiries (id, property_id, renter_id, provider_id, message, contact_preference, status, lead_stage, created_at, updated_at)
values (
  'dddddddd-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  'Hello, I am interested in this one-bedroom near FUTA main gate. Please confirm the total move-in cost and whether an inspection this weekend is possible.',
  'in_app',
  'responded',
  'inspection_scheduled',
  now() - interval '3 days',
  now() - interval '2 days'
);

insert into public.enquiry_messages (id, enquiry_id, sender_id, body, created_at)
values
  (
    'ffffffff-0000-4000-8000-000000000001',
    'dddddddd-0000-4000-8000-000000000001',
    '33333333-3333-4333-8333-333333333333',
    'Hello, I am interested in this one-bedroom near FUTA main gate. Please confirm the total move-in cost and whether an inspection this weekend is possible.',
    now() - interval '3 days'
  ),
  (
    'ffffffff-0000-4000-8000-000000000002',
    'dddddddd-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'Welcome! Total move-in cost is rent plus caution deposit and service charge, all listed on the page. Saturday 10:00 works for an inspection — please confirm so I can hold the slot.',
    now() - interval '2 days'
  );

insert into public.inspections (id, enquiry_id, property_id, requested_by, scheduled_at, status, notes, created_at, updated_at)
values (
  'eeeeeeee-0000-4000-8000-000000000001',
  'dddddddd-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000001',
  '33333333-3333-4333-8333-333333333333',
  now() + interval '2 days',
  'confirmed',
  'Prefer Saturday morning if possible.',
  now() - interval '2 days',
  now() - interval '1 day'
);

insert into public.notifications (user_id, type, title, body, href)
values
  ('11111111-1111-4111-8111-111111111111', 'new_enquiry', 'New enquiry on your listing', 'Chiamaka asked about FUTA main gate 1-bedroom.', '/provider/enquiries/dddddddd-0000-4000-8000-000000000001'),
  ('33333333-3333-4333-8333-333333333333', 'inspection_confirmed', 'Inspection confirmed', 'Your inspection has been confirmed by the provider.', '/inspections'),
  ('33333333-3333-4333-8333-333333333333', 'roommate_interest', 'New roommate interest', 'Ibrahim would like to connect about sharing a place near FUTA.', '/roommates/interests');
