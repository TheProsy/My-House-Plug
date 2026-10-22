# My House Plug

A Nigeria-first accommodation platform for students and young professionals. My House Plug helps renters find verified homes near campus, book inspections, compare total move-in costs, and connect with providers — while giving providers and moderators the tools to keep listings trustworthy.

Pilot market: FUTA / Akure. The data model is campus-based, so new universities can be added without schema changes.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Supabase** (Postgres, Auth, Storage, Row Level Security)
- **Tailwind CSS v4** with a small in-house UI kit (Radix primitives)
- **Zod** for validation, **Vitest** + Testing Library for tests

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project values
npm run dev
```

Open http://localhost:3000.

### Environment

| Variable                        | Purpose                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key                                     |
| `NEXT_PUBLIC_SITE_URL`          | Public origin used for auth redirects, canonical URLs, share links |

Auth emails (confirmation, password reset) use `NEXT_PUBLIC_SITE_URL` as the redirect target. Add that origin to **Supabase → Authentication → URL Configuration** (Site URL and Redirect URLs) or links will fall back to the wrong host.

### Database

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push          # apply supabase/migrations to the linked project
npx supabase db reset         # rebuild the local database and run supabase/seed.sql
```

For a hosted project, run the seed SQL through the Supabase SQL editor instead of `db reset`.

The migrations are idempotent where practical and cover schema, RLS, storage policies, public directory views, onboarding/terms columns, security hardening, and the content-review workflow.

If `db push` hangs on a slow connection, apply the migration SQL through the Supabase dashboard/Management API and insert the matching row into `supabase_migrations.schema_migrations` so local and remote history stay in sync.

### Demo accounts (seeded)

All seeded accounts use the password `DemoPass123!`. Do not ship these credentials to production.

| Role                    | Email                      |
| ----------------------- | -------------------------- |
| Renter                  | `renter@demo.myagent.ng`   |
| Renter (second profile) | `renter2@demo.myagent.ng`  |
| Agent                   | `agent@demo.myagent.ng`    |
| Landlord                | `landlord@demo.myagent.ng` |
| Admin                   | `admin@demo.myagent.ng`    |
| Verifier                | `verifier@demo.myagent.ng` |

A signed-in renter can become a provider at `/become-a-provider`; staff roles are assigned only through the database/seed.

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest (single run)
```

Before shipping a change, run `npm run typecheck`, `npm run test`, `npm run lint`, and `npm run build`.

## How the product works

- **Renters** search by campus, neighbourhood, budget, property type, and amenities; save homes; start enquiries; request inspections; compare move-in costs; and manage roommate profiles/interests.
- **Providers** (landlords and agents) publish listings with units, photos, amenities, and costs. Verified providers can confirm availability and respond to enquiries/inspections.
- **Staff** review listings before they go live, verify identity/property checks, and handle reports. Suspending or reinstating a listing is recorded and re-notifies the provider.

### Trust and moderation flow

1. A provider submits a listing; it enters `pending_review`.
2. Staff approve it (`published`) or reject it with a note.
3. Editing content on a live listing sends it back to `pending_review` automatically, so photos/price/amenities cannot change after approval without re-review.
4. Suspended listings are read-only for providers until staff reinstate them.
5. Verification cases can be resubmitted after rejection or expiry; an active case cannot be duplicated.

### Security model

- RLS is enabled on every table. Staff access is derived from `user_roles`, never from user-editable profile fields.
- Public directory data is exposed through views that only reveal safe projections (no verification notes/evidence, no private contact details).
- Enquiries keep an immutable property/renter/provider identity after creation; inspection requests must match the enquiry's property.
- Roommate interests can only be accepted/declined/blocked by the recipient.
- In-app notifications are restricted to people with a legitimate relationship to the subject and are rate-limited.
- Analytics events require an authenticated user and cannot be spoofed for another account.

## Project structure

```text
src/
  app/                 routes (public, auth, provider, admin) and route handlers
  components/          UI, property, search, provider, admin, navigation
  features/            server queries and actions grouped by domain
  lib/                 Supabase clients, utils, constants, storage helpers
  schemas/             Zod input schemas
  types/               generated-style Supabase database types
supabase/
  migrations/          schema, RLS, storage, security, and workflow changes
  seed.sql             demo data and demo accounts
```

## Deployment notes

- Set `NEXT_PUBLIC_SITE_URL` to the production origin and add it to Supabase Auth redirect URLs.
- Keep the anon key public; never expose the service-role key to the client.
- Run migrations before deploying app code that depends on new columns/views.
- Rotate any credentials that were shared during development.
