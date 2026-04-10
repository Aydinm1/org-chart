# Admin Auth + Directory Editor TODOs

This repo is still a public, read-only Next.js app backed by Airtable. Auth is now partially implemented with custom MySQL + JWT route handlers instead of Prisma/Auth.js.

## Current State

- [x] Added a MySQL pool helper in `lib/db.ts`.
- [x] Added `POST /api/auth/login`.
- [x] Added `POST /api/auth/logout`.
- [x] Added `GET /api/auth/me`.
- [x] Added shared auth/user types.
- [x] Added shared server auth helpers in `lib/auth/server.ts`.
- [x] Added an `/admin` layout that protects the admin subtree.
- [x] Added admin user-management API routes.
- [x] Added a working admin users table with list, edit, delete, and search UI.
- [x] Added a create-user API route in `POST /api/admin/users`.
- [ ] Wire create-user into the admin portal UI.
- [ ] Document the actual MySQL schema used for admin users.
- [ ] Add a bootstrap path for the first admin user.

## 1. Stabilize The Existing Auth Routes

- [x] Fix route import/type issues in `app/api/auth/login/route.ts`.
- [x] Fix async cookie usage in `app/api/auth/me/route.ts`.
- [x] Define and enforce a shared JWT payload shape.
- [ ] Stop returning the JWT in the login JSON body if the cookie is the session source of truth.
- [ ] Validate `JWT_SECRET` explicitly and fail clearly when missing.
- [ ] Normalize auth error responses so login/me/logout return a consistent shape.
- [ ] Decide whether `GET /api/auth/me` should return the raw decoded token or a sanitized user object.
- [ ] Decide whether `getCurrentUser()` should load the current user from MySQL so `isActive` and role changes apply immediately after login.

## 2. Extract Shared Server Auth Helpers

- [x] Add a server-only auth helper module for:
  - reading the auth cookie
  - verifying the JWT
  - returning the current user
  - checking required roles
- [x] Use that shared helper from route handlers instead of duplicating cookie/JWT logic.
- [x] Add one helper for `requireAdmin()`.
- [ ] Add one helper for `requireAuthenticatedUser()`.
- [ ] Add one helper for `requireEditorOrAdmin()` for directory editing routes.

## 3. Protect The Admin Surface

- [x] Protect `/admin` and nested admin pages with an admin layout.
- [x] Redirect unauthenticated users away from protected admin pages.
- [ ] Decide which admin pages are:
  - admin-only
  - editor-or-admin
- [ ] Split page protection so user-management pages stay admin-only while directory editor pages allow `editor`.
- [ ] Decide whether `viewer` gets any read-only admin access in v1.
- [ ] Add middleware only if page/layout-level guards stop being sufficient.

## 4. Finish The Login UX

- [x] Create a `/login` page.
- [x] Add an email/password form that posts to `/api/auth/login`.
- [x] Add a logout button in the admin UI that calls `/api/auth/logout`.
- [ ] Show polished inline error states for:
  - invalid credentials
  - inactive user
  - unexpected server failure
- [ ] Redirect authenticated users to `/admin` after login without using raw `window.location`.
- [ ] Redirect already-authenticated users away from `/login` on the server.
- [ ] Add loading/disabled states consistently across login/logout actions.

## 5. Lock Down The User Model

- [ ] Save the current `users` table definition in the repo, for example as `db/schema.sql` or documented SQL in `README.md`.
- [x] Confirm the table includes:
  - `id`
  - `email` unique
  - `name`
  - `passwordHash`
  - `role`
  - `isActive`
  - `createdAt`
  - `updatedAt`
- [x] Decide whether roles are:
  - `admin`
  - `editor`
  - `viewer`
- [ ] Add a script or documented SQL flow to create the first admin user with a hashed password.
- [ ] Add a password-hash utility for user creation and password reset flows.
- [ ] Decide whether hard delete remains allowed for users or whether deactivation should replace it.

## 6. Build The Admin Shell

- [x] Replace the placeholder `/admin` page with a real admin landing page.
- [x] Create an admin layout separate from the public directory shell.
- [ ] Add admin navigation for:
  - `Users`
  - `Directory Editor`
- [x] Make the admin layout denser and more task-oriented than the public site.
- [ ] Add per-page shells for future admin subsections instead of keeping everything on one page.

## 7. Users View

- [ ] Create `/admin/users` as a dedicated user-management page instead of keeping the table only on `/admin`.
- [x] Add a table listing:
  - name
  - email
  - role
  - active/inactive status
  - id
- [x] Add admin-only actions for:
  - create user API
  - edit role
  - activate/deactivate user
  - delete user
- [ ] Wire create-user into the UI with a real form/modal/drawer.
- [ ] Add reset password flow.
- [x] Validate:
  - unique email
  - valid role
- [ ] Add UI-side validation polish for create/edit forms.
- [ ] Prevent removal or deactivation of the last active admin account.

## 8. Directory Editor Scope

- [ ] Create `/admin/directory`.
- [x] Keep Airtable as the source of truth for directory content in v1.
- [ ] Build the editor around the existing Airtable tables:
  - `Groups`
  - `People`
  - `Display Sections`
  - `Memberships`
  - `Unit Placements`
- [ ] Make directory editor permissions `editor` or `admin`, not admin-only.
- [ ] Prioritize polished editing for:
  - `People`
  - `Groups`
- [ ] Support at least basic management for:
  - display sections
  - memberships
  - unit placements

## 9. Airtable Editor Service Layer

- [ ] Split Airtable public read logic from Airtable admin/editor write logic.
- [ ] Keep `lib/airtable/repository.ts` focused on public page-building reads.
- [ ] Add a separate Airtable editor service layer for:
  - listing records for editor tables
  - fetching single records
  - creating records
  - updating records
- [ ] Keep directory editor write paths separate from public page-building functions.
- [ ] Normalize Airtable field handling so editor forms match current public rendering rules.
- [ ] Handle Airtable API failures cleanly in the editor UI.

## 10. Directory Editor API Surface

- [ ] Add editor-or-admin protected API routes for Airtable-backed resources, for example:
  - `/api/directory/people`
  - `/api/directory/people/[personId]`
  - `/api/directory/groups`
  - `/api/directory/groups/[groupId]`
- [ ] Start with `People` first, then `Groups`.
- [ ] Use per-record `PATCH` routes first; defer bulk update routes unless multiple-request save becomes a real pain point.

## 11. Directory Editor UI

- [ ] Build `PeopleTable` using the same client-side edit-draft pattern as `UsersTable`.
- [ ] Add search/filter support in the directory editor tables.
- [ ] Add save-state feedback for Airtable edits.
- [ ] Add create-record UI for the first managed Airtable table.
- [ ] Add table switching or tabs for managed Airtable resources.
- [ ] Preserve the current public rendering assumptions while editing:
  - people card fields
  - group naming/order
  - display section ordering

## 12. Guard Rails For Existing Public Behavior

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

## 13. Validation + Error Handling

- [x] Validate admin user updates server-side.
- [ ] Validate all editor-side Airtable mutations server-side.
- [ ] Add clear UI feedback for:
  - save success
  - validation failure
  - Airtable API failure
  - auth/session expiration
- [ ] Prevent invalid cross-links such as:
  - memberships without a group
  - placements without a parent group or child group
  - broken display section references

## 14. Testing

- [ ] Add auth tests for:
  - valid login
  - invalid login
  - inactive user rejection
  - `/api/auth/me` with a valid cookie
  - admin route protection
- [ ] Add authorization tests for:
  - admin access
  - editor directory-editor access
  - editor restrictions on user management
  - viewer restrictions
- [ ] Add user CRUD tests.
- [ ] Add Airtable editor service tests where feasible.
- [ ] Add regression checks for existing public pages.
- [ ] Run `npm run lint`.
- [x] Run `npx tsc --noEmit`.

## 15. Deployment / Rollout

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
