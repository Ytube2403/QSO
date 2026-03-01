---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: Scoring Engine & Recompute Route

## Objective
Xây dựng API endpoint để tính toán lại điểm (`relevancy_score` và `total_score`) cho toàn bộ keyword trong một Dataset khi Preset bị thay đổi, giúp bảng dữ liệu luôn phản ánh đúng trọng số mới.

## Context
- .gsd/SPEC.md (sections 5, 6)
- app/api/datasets/import/route.ts
- lib/supabase/server.ts

## Tasks

<task type="auto">
  <name>Create Recompute API Route</name>
  <files>app/api/datasets/[id]/recompute/route.ts</files>
  <action>
    - Build a POST handler updating scores for a specific dataset `[id]`.
    - Fetch the requested Preset configuration.
    - Fetch all keywords for the dataset.
    - Loop over keywords recalculating `relevancy_score` and `total_score` based on the robust logic defined in SPEC.md (using normalization against dataset max/min if needed).
    - Batch Update records in `keywords` table.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Recompute API route handles updating keywords mathematically.</done>
</task>

<task type="auto">
  <name>Trigger Recompute on Client</name>
  <files>components/datasets/preset-selector.tsx, components/datasets/data-table.tsx</files>
  <action>
    - Ensure selecting a new preset from the dropdown prompts the user to "Recompute Scores".
    - Once confirmed, fetch the recompute POST route, and on success `router.refresh()` the dataset.
  </action>
  <verify>npm run build</verify>
  <done>UI correctly prompts and triggers score recalculation and refreshes the data context.</done>
</task>

## Success Criteria
- [ ] Logic tính Relevancy và TotalScore được gọi lại và cập nhật chính xác cho toàn bộ DB khi yêu cầu.
- [ ] Giao diện Dataset list cho phép chọn Preset và Refetch hiển thị điểm mới.
