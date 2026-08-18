# Tasks - Removing Organizations

- `[x]` Update database schema (`prisma/schema.prisma`)
- `[x]` Update Better Auth configuration (`src/lib/auth.ts` and `src/lib/auth-client.ts`)
- `[x]` Update authentication session helper (`src/lib/auth-session.ts`)
- `[x]` Update Server Actions:
  - `[x]` `src/app/actions/patient.ts` & `src/app/actions/visit.ts` (Remove activeOrgId checks)
  - `[x]` `src/app/actions/user-mgmt.ts` (Implement direct user creation/deactivation)
- `[x]` Update page layouts & navigation components:
  - `[x]` `src/app/(protected)/layout.tsx` (Remove context block screen)
  - `[x]` `src/components/navigation.tsx` (Remove organization selector switcher)
  - `[x]` `src/app/(protected)/settings/page.tsx` (Adjust user lists and registration panels)
- `[x]` Update database seeding script (`prisma/seed.ts`)
- `[x]` Execute migrations and seed database
- `[x]` Compile and verify clean build
