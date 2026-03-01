---
phase: 3
plan: 3
wave: 3
---

# Plan 3.3: Manual Selection, Tags & View Updates

## Objective
Xây dựng ngăn kéo (Drawer) và các checkbox nhiều dòng trong DataTable để người dùng thực hiện Manual Selection các từ khóa. Cung cấp API để thêm/xóa lựa chọn, phân loại tag và gắn ghi chú (notes).

## Context
- .gsd/SPEC.md
- components/datasets/data-table.tsx
- package.json

## Tasks

<task type="auto">
  <name>Keyword Selection UI</name>
  <files>components/datasets/data-table.tsx, components/datasets/selection-drawer.tsx</files>
  <action>
    - Add a checkbox column to `DataTable` utilizing `@tanstack/react-table` row selection state.
    - Create a persistent `SelectionDrawer` component that floats at the bottom/side showing the count of selected keywords.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Datatable handles selecting multiple rows correctly.</done>
</task>

<task type="auto">
  <name>Selection API Route</name>
  <files>app/api/datasets/[id]/selections/route.ts</files>
  <action>
    - Create POST / GET methods to save, fetch, and update selections (including tags and notes).
    - Insert into `selections` table utilizing the mode defined in spec (Unique `(dataset_id, keyword_id)`).
  </action>
  <verify>tsc --noEmit</verify>
  <done>API successfully handles writing to `selections` DB.</done>
</task>

## Success Criteria
- [ ] User có thể multi-select keyword trên table.
- [ ] Drawer hiện ra số lượng đã chọn.
- [ ] Gửi yêu cầu lưu danh sách selection (cùng tag/notes) vào DB thông qua API thành công.
