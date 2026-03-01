# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] Hệ thống Auth (Google/Email) và Workspace (Share via invite).
- [ ] Giao diện Import file CSV, nhận diện và ánh xạ cột.
- [ ] Bảng dữ liệu: Lọc, tính Relevancy & TotalScore realtime.
- [ ] Tính năng chọn từ khóa thủ công + tags/notes.
- [ ] Tính năng Export ra CSV/XLSX an toàn.
- [ ] Supabase RLS policies.

## Phases

### Phase 1: Auth + Workspace + RLS skeleton
**Status**: ⬜ Not Started
**Objective**: Thiết lập foundation gồm Supabase Auth, cấu trúc DB + RLS policies, và CRUD Workspace (cùng tính năng mời thành viên bằng email).
**Requirements**: REQ-01, REQ-02

### Phase 2: Dataset import + table view
**Status**: ⬜ Not Started
**Objective**: Phát triển route upload CSV, hiển thị bảng keywords với virtualization và các bộ lọc cơ bản.
**Requirements**: REQ-03, REQ-04

### Phase 3: Scoring + Presets + Selection
**Status**: ⬜ Not Started
**Objective**: Phát triển UI cấu hình preset, hệ thống tính lại điểm số, drawer chọn từ khóa kèm tính năng ghi chú/gắn thẻ.
**Requirements**: REQ-05, REQ-06

### Phase 4: Export CSV/XLSX + hardening
**Status**: ⬜ Not Started
**Objective**: Hoàn thiện tính năng export (CSV & XLSX), thực hiện sanitize chống formula injection, áp dụng rate limit và thêm log audit.
**Requirements**: REQ-07

### Phase 5: Lark integration (optional)
**Status**: ⬜ Not Started
**Objective**: Upload file báo cáo kết quả tự động lên Lark Drive, Sheets, hoặc Base.
