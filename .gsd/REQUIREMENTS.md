# REQUIREMENTS.md

## Format
| ID | Requirement | Source | Status |
|----|-------------|--------|--------|
| REQ-01 | Tích hợp Auth qua Google OAuth hoặc Email Magic Link để đăng nhập | MVP Scope | Pending |
| REQ-02 | Hệ thống RLS để bảo mật dữ liệu Private-by-default theo Workspace | MVP Scope, Security | Pending |
| REQ-03 | Import file CSV của AppTweak, mapping đúng Schema và Insert Batch vào Database | MVP Scope | Pending |
| REQ-04 | Table interface hỗ trợ virtualization cho dataset dung lượng lớn | Tech Stack | Pending |
| REQ-05 | Tính toán Derived metrics (Relevancy, Total Score) theo cấu hình Preset | Core Logic | Pending |
| REQ-06 | Multi-select thủ công, hỗ trợ gắn Tags và Notes thông qua bảng (shift+click, ctrl+click) | MVP Scope | Completed |
| REQ-07 | Xử lý sanitize text khi export file CSV, XLSX (thêm `'` prefix cho `=` `+` `-` `@`) | Security | Completed |
