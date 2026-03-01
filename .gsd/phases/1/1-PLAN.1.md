---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Project Setup & Database Schema

## Objective
Khởi tạo dự án Next.js, cài đặt các thư viện (Supabase, Shadcn) và tạo file DDL migration cho DB schema (Workspaces, Members, Datasets, Keywords, Presets, Selections).

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md

## Tasks

<task type="auto">
  <name>Init Next.js & Libraries</name>
  <files>package.json, components.json, tsconfig.json</files>
  <action>
    - Initialize Next.js app router project (TypeScript, Tailwind).
    - Install @supabase/ssr, @supabase/supabase-js, shadcn-ui, lucide-react.
    - Create .env.example with Supabase variable templates.
  </action>
  <verify>npm run build</verify>
  <done>Next.js project builds successfully with the required UI/DB libraries.</done>
</task>

<task type="auto">
  <name>Create DB Schema Migration</name>
  <files>supabase/migrations/00000000000000_initial_schema.sql</files>
  <action>
    - Create the migration file defining the initial tables: workspaces, workspace_members, datasets, keywords, presets, selections.
    - Set up UUID defaults and `updated_at` triggers.
  </action>
  <verify>Check SQL syntax</verify>
  <done>Schema SQL file is created reflecting the tables in SPEC.md.</done>
</task>

## Success Criteria
- [ ] Dự án Next.js được khởi tạo thành công.
- [ ] File schema SQL Migration chuẩn bị sẵn sàng để đẩy lên Supabase.
