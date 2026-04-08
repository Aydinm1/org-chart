# Admin Auth + Directory Editor TODOs

This repo is currently a public, read-only Next.js app backed by Airtable. The work below adds a protected admin area without changing the public browsing flow.

## Goals

- Keep `/`, `/groups/[groupId]`, and `/api/people/[personId]/photo` public.
- Add a protected `/admin` area that requires login.
- Use MySQL for application users and permissions.
- Use Auth.js with email/password login and JWT sessions.
- Keep Airtable as the source of truth for directory content in v1.
- Add two admin views:
  - user management
  - directory editor

## 1. Project Setup

- [ ] Add dependencies for:
  - `auth.js` / `next-auth`
  - `prisma`
  - `@prisma/client`
  - password hashing library such as `bcryptjs`
  - form/schema validation library if needed for admin payloads
- [ ] Add environment variables to `README.md` and local env setup for:
  - `DATABASE_URL`
  - Auth secret
  - admin bootstrap credentials if using a seed path
- [ ] Decide final route structure for auth and admin pages:
  - `/login`
  - `/admin`
  - `/admin/users`
  - `/admin/directory`

## 2. Prisma + MySQL User Model

- [ ] Initialize Prisma in the repo.
- [ ] Create a MySQL `User` model with:
  - `id`
  - `email` unique
  - `name`
  - `passwordHash`
  - `role`
  - `isActive`
  - `createdAt`
  - `updatedAt`
- [ ] Create a role enum:
  - `admin`
  - `editor`
  - `viewer`
- [ ] Generate and apply the first migration.
- [ ] Add a Prisma client helper for server-side use.
- [ ] Add a seed/bootstrap script for the first admin user.

## 3. Auth.js Integration

- [ ] Add Auth.js config for Next.js App Router.
- [ ] Use a credentials provider with email/password login.
- [ ] Configure JWT session strategy.
- [ ] Include `id`, `email`, and `role` in the session/JWT payload.
- [ ] Add password verification against stored password hashes.
- [ ] Reject inactive users.
- [ ] Add shared auth helpers for:
  - getting the current session/user on the server
  - checking whether the user is authenticated
  - checking whether the user has a required role

## 4. Route Protection

- [ ] Protect `/admin` and all nested admin routes.
- [ ] Redirect unauthenticated users to `/login`.
- [ ] Keep all existing public pages accessible without login.
- [ ] Prevent non-admins from reaching user-management mutations.
- [ ] Decide whether `viewer` can access read-only admin pages and enforce consistently.

## 5. Login UX

- [ ] Create a `/login` page.
- [ ] Add a simple email/password form.
- [ ] Show clear error states for:
  - invalid credentials
  - inactive user
  - unexpected auth failure
- [ ] Redirect authenticated users to `/admin`.
- [ ] Redirect already-authenticated users away from `/login`.

## 6. Admin Shell

- [ ] Create an admin layout separate from the public directory shell.
- [ ] Add admin navigation for:
  - `Users`
  - `Directory Editor`
- [ ] Reuse the repo's visual language where it still fits.
- [ ] Make the admin layout denser and more table-oriented than the public site.

## 7. Users View

- [ ] Create `/admin/users`.
- [ ] Add a table that lists:
  - name
  - email
  - role
  - active/inactive status
  - created date
- [ ] Add admin-only actions for:
  - create user
  - edit user role
  - activate/deactivate user
  - reset or change password
- [ ] Add validation for:
  - unique email
  - valid role
  - password rules
- [ ] Prevent an admin from accidentally removing the only active admin account.

## 8. Directory Editor Scope

- [ ] Create `/admin/directory`.
- [ ] Keep Airtable as the data source for directory content in v1.
- [ ] Build the editor around the Airtable tables already required by this repo:
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
- [ ] Keep admin write paths separate from public page-building functions.
- [ ] Normalize Airtable field handling so admin forms match the current public rendering rules.
- [ ] Handle Airtable API failures cleanly in the admin UI.

## 10. Directory Editor UX

- [ ] Add a top-level selector or tabs for each managed Airtable table.
- [ ] Add searchable/filterable tables for records.
- [ ] Add create/edit forms using drawers, modals, or split panes.
- [ ] For `People`, support:
  - name
  - email
  - phone
  - photo URL or attachment handling strategy
- [ ] For `Groups`, support:
  - group name
  - parent group
  - group order
- [ ] For `Display Sections`, support:
  - label
  - owning group
  - section order
  - show title
- [ ] For `Memberships`, support:
  - person
  - group
  - role
  - display section
  - order
  - chair flag
- [ ] For `Unit Placements`, support:
  - parent group
  - child group
  - display section
  - order
  - use representative card

## 11. Guard Rails For Existing Public Behavior

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

## 12. Server Actions / API Surface

- [ ] Decide whether admin mutations will use:
  - server actions
  - route handlers
  - a mix of both
- [ ] Keep the public site free of unnecessary new API routes.
- [ ] Add only the admin-side mutation surface needed for:
  - auth
  - user CRUD
  - Airtable record create/update

## 13. Validation + Error Handling

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

## 14. Testing

- [ ] Add auth tests for:
  - valid login
  - invalid login
  - inactive user rejection
  - admin route protection
- [ ] Add authorization tests for:
  - admin access
  - editor restrictions
  - viewer read-only behavior
- [ ] Add user CRUD tests.
- [ ] Add Airtable admin service tests where feasible.
- [ ] Add regression checks for existing public pages.
- [ ] Run `npm run lint`.
- [ ] Add at least one focused test pass for directory behavior after admin edits.

## 15. Deployment / Rollout

- [ ] Confirm MySQL is provisioned in each environment.
- [ ] Confirm secrets are available in each environment.
- [ ] Run Prisma migration in deployment flow.
- [ ] Seed or manually create the first admin user.
- [ ] Smoke test:
  - public home page
  - public group page
  - login page
  - admin users view
  - admin directory editor

## Suggested Implementation Order

- [ ] 1. Add Prisma, MySQL user model, migration, and seed path.
- [ ] 2. Add Auth.js credentials login with JWT session support.
- [ ] 3. Add `/login` and protect `/admin`.
- [ ] 4. Build admin shell and `Users` view first.
- [ ] 5. Add user CRUD.
- [ ] 6. Add Airtable admin service layer.
- [ ] 7. Build `Directory Editor` for `People` and `Groups`.
- [ ] 8. Add `Display Sections`, `Memberships`, and `Unit Placements` editing.
- [ ] 9. Add validation, permissions hardening, and regression tests.
