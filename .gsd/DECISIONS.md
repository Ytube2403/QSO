# DECISIONS

| Date | Context | Decision | Rationale |
|------|---------|----------|-----------|
| 2026-03-01 | Project scaffolding | Khởi tạo với GSD framework | Phương pháp chuẩn hoá tiến trình xây dựng MVP |
| 2026-03-01 | Data security | Supabase RLS | Phương pháp tốt nhất ngăn chặn truy cập dữ liệu chéo thay vì kiểm soát ở tầng client |
| 2026-03-01 | Prevent Injection | CSV Sanitize | Thêm ký tự `'` trước `=`, `+`, `-`, `@` trên pipeline export |
