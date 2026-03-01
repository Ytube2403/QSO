---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: CSV Parse & Dataset Creation API

## Objective
Xây dựng API route `/api/datasets/import` cho phép nhận file CSV, parse dữ liệu, tìm và map các cột (My Rank, Competitors), tính toán các derived metrics, tạo bản ghi Dataset và chèn hàng loạt (batch insert) các Keywords vào database.

## Context
- .gsd/SPEC.md (sections 4, 5, 6, 11)
- lib/supabase/server.ts

## Tasks

<task type="auto">
  <name>Install CSV Parsing Library</name>
  <files>package.json</files>
  <action>
    - Install `papaparse` and `@types/papaparse` for CSV parsing.
  </action>
  <verify>npm list papaparse</verify>
  <done>Papaparse is installed and available.</done>
</task>

<task type="auto">
  <name>Create Import API Route</name>
  <files>app/api/datasets/import/route.ts</files>
  <action>
    - Create a POST handler that accepts `multipart/form-data` with a CSV file and metadata (workspaceId, myRankColumn, competitorColumns config).
    - Parse CSV using Papaparse.
    - Validate and normalize keywords (trim, lowercase).
    - Calculate derived metrics per row: `competitor_ranked_count`, `competitor_topN_count`, `competitor_best_rank` (using N=20).
    - Calculate `relevancy_score` and `total_score` (using default preset weights or simple fallback).
    - Insert a new record into `datasets`.
    - Batch insert records into `keywords` (in chunks of 500-1000 if large).
  </action>
  <verify>tsc --noEmit</verify>
  <done>Import API route is strongly typed and handles parsing & database insertions correctly.</done>
</task>

## Success Criteria
- [ ] API có thể tiếp nhận file CSV và parse thành JSON thành công.
- [ ] Dữ liệu được tính toán đúng logic điểm số và map vào các cột DB tương ứng.
- [ ] Xử lý batch insert hoạt động không gặp lỗi memory.
