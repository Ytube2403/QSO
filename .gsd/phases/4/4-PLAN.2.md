---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: Security Hardening (Rate Limits & Audit Logging)

## Objective
Hoàn thiện tính năng bảo mật bao gồm giới hạn số lượng yêu cầu (Rate Limit) cho các API nhạy cảm (như Import, Export) và ghi log audit lại các hành động quan trọng (chia sẻ workspace, export dữ liệu).

## Context
- .gsd/SPEC.md
- middleware.ts
- lib/supabase/server.ts

## Tasks

<task type="auto">
  <name>Install Upstash Redis (Optional) or use Middleware Rate Limiting</name>
  <files>package.json, middleware.ts</files>
  <action>
    - Depending on complexity, implement a basic in-memory rate limiter or install `@upstash/redis` for robust rate limiting across Vercel Edge functions.
    - Rate limit applied to `/api/datasets/import` and `/api/datasets/*/export` to prevent abuse.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Rate limits mitigate abuse vectors against specific routes.</done>
</task>

<task type="auto">
  <name>Audit Logging System</name>
  <files>supabase/migrations/*_audit_logs.sql, lib/audit.ts</files>
  <action>
    - Create a new migration for `audit_logs` table (id, user_id, workspace_id, action, target_type, target_id, created_at).
    - Create a server utility `logAuditAction()` inside `lib/audit.ts` to be called during Dataset Import, Preset Update, Export requested.
  </action>
  <verify>npm run build</verify>
  <done>A centralized audit system pushes logs seamlessly without breaking user flows.</done>
</task>

## Success Criteria
- [ ] Export & import route throws 429 Too Many Requests if spammed.
- [ ] Mọi hành động quan trọng được insert vào table logic `audit_logs` trong Supabase có tracking ID user.
