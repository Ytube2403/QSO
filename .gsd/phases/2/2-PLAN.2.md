---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Import UI & Dataset Creation Action

## Objective
Xây dựng giao diện trang Dataset detail chứa nút import CSV. Người dùng tải file lên, mapper cột sẽ auto-detect các cột rank, và cho phép chọn `my_rank` (radio) và `competitor_ranks` (checkbox max 10). Giao tiếp với API `/api/datasets/import` đã tạo ở Plan 2.1.

## Context
- .gsd/SPEC.md
- app/api/datasets/import/route.ts
- components/ui/dialog, components/ui/button, components/ui/checkbox, components/ui/radio-group

## Tasks

<task type="auto">
  <name>Install Required UI Components</name>
  <files>components.json</files>
  <action>
    - Add `checkbox`, `radio-group`, `label`, `table`, `scroll-area` via `npx shadcn@latest add ...`
  </action>
  <verify>npm list</verify>
  <done>UI components are installed successfully.</done>
</task>

<task type="auto">
  <name>Create Import Modal UI</name>
  <files>components/datasets/import-modal.tsx, components/datasets/column-mapper.tsx</files>
  <action>
    - Build a Dialog modal for uploading CSV files.
    - Parse the CSV header locally using Papaparse to extract column names.
    - Build a mapper UI:
      - Auto-select columns starting with `Rank -` as competitors.
      - Let user pick exactly 1 column for `My Rank`.
      - Let user pick up to 10 columns for `Competitors`.
    - Submit the file + mapping config to `/api/datasets/import`.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Import modal components compile successfully without type errors.</done>
</task>

<task type="auto">
  <name>Workspace Dataset View</name>
  <files>app/app/w/[workspaceId]/page.tsx, components/datasets/dataset-list.tsx</files>
  <action>
    - Create the workspace detail page showing a list of Datasets.
    - Fetch Datasets using Supabase server client.
    - Place the Import Modal trigger here.
  </action>
  <verify>npm run build</verify>
  <done>Dataset page and components build successfully.</done>
</task>

## Success Criteria
- [ ] Giao diện Import Modal hiển thị đúng và trích xuất header CSV trên frontend.
- [ ] User có thể mapping thủ công cột Rank trước khi submit.
- [ ] Trang danh sách Dataset của Workspace tải được dữ liệu và cho phép click vào Dataset Detail.
