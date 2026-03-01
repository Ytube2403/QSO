---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Lark Integration (Optional Phase)

## Objective
Xây dựng tính năng "Push to Lark" (Lark Open Platform API) để tự động hóa quy trình upload file CSV/XLSX kết quả phân tích ASO thẳng lên Lark Drive hoặc Lark Bitable / Sheets của tổ chức (team không cần download rải rác).

## Context
- Phase 5 là tuỳ chọn (Optional) được thiết kế cho nhu cầu mở rộng.
- Cần có `LARK_APP_ID` và `LARK_APP_SECRET`. 

## Roadmap for Next Steps

<task type="auto">
  <name>Bootstrap Lark Open API</name>
  <files>lib/lark.ts</files>
  <action>
    - Viết helper lấy `tenant_access_token` từ Lark Open API `v3/auth/tenant_access_token/internal`.
    - Viết hàm upload file lên thư mục định sẵn trên Lark Drive thông qua `drive/v1/files/upload_all`.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Lark authentication API wrappers are constructed properly.</done>
</task>

<task type="auto">
  <name>Build Upload API Endpoint</name>
  <files>app/api/datasets/[id]/lark/route.ts</files>
  <action>
    - Endpoint này sẽ nhận một lệnh từ front-end để tạo lại buffer file tương tự như logic export hiện tại.
    - Gọi hàm `lark.ts` để upload file buffer này lên mây kèm token.
  </action>
  <verify>tsc --noEmit</verify>
  <done>Backend route securely pushes memory buffer to Lark without intermediate temp files.</done>
</task>

<task type="auto">
  <name>Dataset UI Integration</name>
  <files>app/app/w/[workspaceId]/datasets/[datasetId]/page.tsx</files>
  <action>
    - Thêm nút "Push to Lark" ở cạnh nút download truyền thống.
    - Thêm tuỳ chọn để user điền `Folder ID` (hoặc để config mặc định trong Workspace setting).
  </action>
  <verify>npm run build</verify>
  <done>UI reflects the new option intuitively.</done>
</task>

## Success Criteria
- [ ] Hàm lấy token hoạt động với biến môi trường hợp lệ.
- [ ] Gửi thành công request multipart/form-data upload file lên Lark Drive.
- [ ] Front-end báo Toast thành công hoặc lỗi với chi tiết phản hồi.
