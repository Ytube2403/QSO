---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Export CSV/XLSX & Sanitization

## Objective
Xây dựng tính năng cho phép người dùng xuất (Export) danh sách các Keyword đã chọn (Selections) ra định dạng CSV và XLSX. Để đảm bảo an toàn, tất cả các field dạng text phải được sanitize để chống lỗi Formula Injection.

## Context
- .gsd/SPEC.md
- app/api/datasets/[id]/export/route.ts
- REQ-07 (Sanitize text khi export file CSV, XLSX thêm `'` prefix cho `=` `+` `-` `@`)

## Tasks

<task type="auto">
  <name>Install SheetJS (xlsx)</name>
  <files>package.json</files>
  <action>
    - Run `npm install xlsx` to generate robust XLSX/CSV output.
  </action>
  <verify>npm list xlsx</verify>
  <done>Export dependency is added strictly for Phase 4.</done>
</task>

<task type="auto">
  <name>Create Utility for Anti-Formula-Injection</name>
  <files>lib/utils.ts</files>
  <action>
    - Add a function `sanitizeForExport(value: string | number | null): string | number`
    - If string matches `/^[-+@=]/` prefix it with `'` (single quote).
  </action>
  <verify>tsc --noEmit</verify>
  <done>Sanitize utility handles edge cases cleanly.</done>
</task>

<task type="auto">
  <name>Build Export API Route</name>
  <files>app/api/datasets/[id]/export/route.ts</files>
  <action>
    - Build a GET endpoint to fetch all keywords mapped with their selections (`tags`, `notes`) for a dataset.
    - Transform the array into flat objects.
    - Loop over the values and apply `sanitizeForExport`.
    - Generate XLSX / CSV based on a requested format parameter `?format=csv` vs `?format=xlsx`.
    - Send response as a proper downloadable blob with headers (`Content-Disposition: attachment; filename=...`).
  </action>
  <verify>tsc --noEmit</verify>
  <done>Export API generates sanitized blobs based on query params.</done>
</task>

<task type="auto">
  <name>Add Export Button to Dataset View</name>
  <files>app/app/w/[workspaceId]/datasets/[datasetId]/page.tsx</files>
  <action>
    - Add export button next to the Preset Selector triggering a download action pointing to the API route.
  </action>
  <verify>npm run build</verify>
  <done>Export buttons are functional and render correctly on the page.</done>
</task>

## Success Criteria
- [ ] User click Export -> downloads file correctly.
- [ ] Export file includes keyword metrics and manual selection notes/tags.
- [ ] Những keyword hoặc notes có ký tự nguy hiểm (`=CMD()`) bị chặn thực thi trên Excel bằng dấu `'`.
