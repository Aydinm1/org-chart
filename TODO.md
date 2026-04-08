# Admin Auth + Directory Editor TODOs

This repo is still a public, read-only Next.js app backed by Airtable. Auth is now partially started with custom MySQL + JWT route handlers instead of Prisma/Auth.js.

## Current State

- [x] Added a MySQL pool helper in `lib/db.ts`.
- [x] Added `POST /api/auth/login`.
- [x] Added `POST /api/auth/logout`.
- [x] Added `GET /api/auth/me`.
- [x] Added an `/admin` placeholder page.
- [x] Chose direct MySQL access instead of Prisma for v1.
- [ ] Document the actual MySQL schema used for admin users.
- [ ] Add a bootstrap path for the first admin user.

## 1. Stabilize The Existing Auth Routes

- [x] Fix route import/type issues in `app/api/auth/login/route.ts`.
- [x] Fix async cookie usage in `app/api/auth/me/route.ts`.
- [ ] Stop returning the JWT in the login JSON body if the cookie is the session source of truth.
- [X] Define and enforce a shared JWT payload shape.
- [ ] Validate `JWT_SECRET` explicitly and fail clearly when missing.
- [ ] Normalize auth error responses so login/me/logout return a consistent shape.
- [ ] Decide whether `GET /api/auth/me` should return the raw decoded token or a sanitized user object.

## 2. Extract Shared Server Auth Helpers

- [X] Add a server-only auth helper module for:
  - reading the auth cookie
  - verifying the JWT
  - returning the current user
  - checking required roles
- [X] Use that shared helper from route handlers instead of duplicating cookie/JWT logic.
- [ ] Add one helper for "require authenticated user".
- [X] Add one helper for "require admin role".

## 3. Protect The Admin Surface

- [ ] Protect `/admin` and all future nested admin routes.
- [ ] Redirect unauthenticated users to `/login`.
- [ ] Prevent non-admin users from loading admin pages.
- [ ] Decide whether `editor` and `viewer` roles should exist in v1 or whether only `admin` should be allowed initially.
- [ ] Add middleware or server-side guards before building more admin pages.

## 4. Finish The Login UX

- [ ] Create a `/login` page.
- [ ] Add an email/password form that posts to `/api/auth/login`.
- [ ] Show clear error states for:
  - invalid credentials
  - inactive user
  - unexpected server failure
- [ ] Redirect authenticated users to `/admin`.
- [ ] Redirect already-authenticated users away from `/login`.
- [ ] Add a logout action/button in the admin UI that calls `/api/auth/logout`.

## 5. Lock Down The User Model

- [ ] Save the current `users` table definition in the repo, for example as `db/schema.sql` or documented SQL in `README.md`.
- [X] Confirm the table includes:
  - `id`
  - `email` unique
  - `name`
  - `passwordHash`
  - `role`
  - `isActive`
  - `createdAt`
  - `updatedAt`
- [X] Decide whether roles are:
  - `admin`
  - `editor`
  - `viewer`
- [ ] Add a script or documented SQL flow to create the first admin user with a hashed password.
- [ ] Add a password-hash utility for user creation and password reset flows.

## 6. Build The Admin Shell

- [ ] Replace the placeholder `/admin` page with a real admin landing page.
- [ ] Create an admin layout separate from the public directory shell.
- [ ] Add admin navigation for:
  - `Users`
  - `Directory Editor`
- [ ] Keep the public site visuals intact while making admin pages denser and more task-oriented.

## 7. Users View

- [ ] Create `/admin/users`.
- [ ] Add a table listing:
  - name
  - email
  - role
  - active/inactive status
  - created date
- [ ] Add admin-only actions for:
  - create user
  - change role
  - activate/deactivate user
  - reset password
- [ ] Validate:
  - unique email
  - valid role
  - password rules
- [ ] Prevent removal or deactivation of the last active admin account.

## 8. Directory Editor Scope

- [ ] Create `/admin/directory`.
- [ ] Keep Airtable as the source of truth for directory content in v1.
- [ ] Build the editor around the existing Airtable tables:
  - `Groups`
  - `People`
  - `Display Sections`
  - `Memberships`
  - `Unit Placements`
- [ ] Prioritize polished editing for:
  - `People`
  - `Groups`
- [ ] Support at least basic management for:
  - display sections
  - memberships
  - unit placements

## 9. Airtable Admin Service Layer

- [ ] Split Airtable read logic from Airtable write logic.
- [ ] Add server-side functions for:
  - listing records for admin tables
  - fetching single records
  - creating records
  - updating records
- [ ] Keep admin write paths separate from the public page-building functions.
- [ ] Normalize Airtable field handling so admin forms match current public rendering rules.
- [ ] Handle Airtable API failures cleanly in the admin UI.

## 10. Guard Rails For Existing Public Behavior

- [ ] Preserve root page behavior:
  - `/` still uses `Midwest Institutions`
  - root cards still come from child groups under that root
  - root ordering still follows `Groups.GroupOrder`
- [ ] Preserve group page behavior:
  - sections still come from `Display Sections`
  - people cards still come from `Memberships`
  - child-group cards still come from `Unit Placements`
- [ ] Preserve representative-card behavior:
  - `Use Representative Card` still depends on a child group's chair membership
- [ ] Preserve public photo behavior:
  - `/api/people/[personId]/photo` still redirects correctly

## 11. Validation + Error Handling

- [ ] Validate all admin inputs server-side.
- [ ] Add clear UI feedback for:
  - save success
  - validation failure
  - Airtable API failure
  - auth/session expiration
- [ ] Prevent invalid cross-links such as:
  - memberships without a group
  - placements without a parent group or child group
  - broken display section references

## 12. Testing

- [ ] Add auth tests for:
  - valid login
  - invalid login
  - inactive user rejection
  - `/api/auth/me` with a valid cookie
  - admin route protection
- [ ] Add authorization tests for:
  - admin access
  - editor restrictions
  - viewer read-only behavior
- [ ] Add user CRUD tests.
- [ ] Add Airtable admin service tests where feasible.
- [ ] Add regression checks for existing public pages.
- [ ] Run `npm run lint`.
- [ ] Run `npx tsc --noEmit`.

## 13. Deployment / Rollout

- [ ] Add auth-related environment variables to `README.md`:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `JWT_SECRET`
- [ ] Confirm MySQL is provisioned in each environment.
- [ ] Confirm secrets are available in each environment.
- [ ] Create the first admin user in each environment.
