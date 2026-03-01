---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: Workspace UI and API

## Objective
Xây dựng giao diện và API cơ bản để người dùng đăng nhập, xem danh sách Workspace, tạo mới Workspace.

## Context
- .gsd/SPEC.md
- lib/supabase/server.ts

## Tasks

<task type="auto">
  <name>Auth & Workspace API</name>
  <files>app/api/workspaces/route.ts</files>
  <action>
    - Create a server action or API API to create a new workspace.
    - Make sure creation inserts into `workspaces` and into `workspace_members` as owner.
  </action>
  <verify>tsc --noEmit</verify>
  <done>API routes are strongly typed and use Supabase server client properly.</done>
</task>

<task type="auto">
  <name>Workspace Dashboard UI</name>
  <files>app/page.tsx, components/workspaces/workspace-list.tsx, components/auth/login-button.tsx</files>
  <action>
    - Implement a Login component (using OAuth or Magic Link logic from Supabase).
    - Implement a basic Dashboard `/app` displaying the user's workspaces.
    - Add a "Create Workspace" form/modal.
  </action>
  <verify>npm run build</verify>
  <done>UI components build successfully.</done>
</task>

## Success Criteria
- [ ] Màn hình đăng nhập hoạt động về mặt giao diện.
- [ ] Danh sách Workspace và API tạo mới hoạt động trên lý thuyết mã nguồn.
