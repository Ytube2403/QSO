---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Authentication & Authorization (RLS)

## Objective
Thiết lập xác thực người dùng qua Supabase Auth và thiết lập logic Row Level Security để bảo vệ dữ liệu theo Workspace.

## Context
- .gsd/SPEC.md
- supabase/migrations/00000000000000_initial_schema.sql

## Tasks

<task type="auto">
  <name>Supabase Client Setup</name>
  <files>lib/supabase/client.ts, lib/supabase/server.ts, middleware.ts</files>
  <action>
    - Create Supabase SSR client utilities (client, server, middleware).
    - Configure middleware to protect routes under `/app`.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Supabase server/client utilities compile correctly.</done>
</task>

<task type="auto">
  <name>RLS Policies Migration</name>
  <files>supabase/migrations/00000000000001_rls_policies.sql</files>
  <action>
    - Ensure RLS is enabled on all tables created in 00000000000000_initial_schema.sql.
    - workspaces: owners can read/write, members can read.
    - workspace_members: readable by members of the workspace.
    - datasets, keywords, presets, selections: accessible only if the user is an owner or member of the associated workspace.
  </action>
  <verify>Check SQL syntax for basic correctness</verify>
  <done>RLS SQL file correctly enforces cross-tenant data isolation.</done>
</task>

## Success Criteria
- [ ] Các tiện ích Supabase client sẵn sàng hoạt động trong Next.js.
- [ ] RLS policies được định nghĩa chặt chẽ để private-by-default.
