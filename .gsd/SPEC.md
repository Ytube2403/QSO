# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Công cụ ASO nội bộ giúp team import dữ liệu AppTweak nhanh chóng, chấm điểm từ khóa dựa trên mức độ cạnh tranh thực tế của các đối thủ, cho phép lọc, chọn và xuất dữ liệu an toàn. Dữ liệu được cô lập bảo mật theo từng Workspace với nguyên tắc private-by-default.

## Goals
1. Import CSV keyword từ AppTweak, mapping cấu trúc: Keyword, Volume, Difficulty, KEI, My Rank, Competitor Ranks.
2. Tự động tính toán Derived metrics (competitor_ranked_count, topN_count, best_rank) và đánh giá Relevancy.
3. Chấm điểm Total Score theo công thức tùy chỉnh linh hoạt kết hợp Preset được lưu theo workspace.
4. Chọn từ khóa thủ công linh hoạt qua thao tác bảng (click, shift+click, multi-select).
5. Xuất báo cáo (CSV/XLSX) các từ khóa đã chọn kèm theo Selected (primary) và metadata, có sanitize an toàn.
6. Thiết lập Workspace permission và Row Level Security (RLS) để cô lập dữ liệu hiệu quả.

## Non-Goals (Out of Scope)
- Public share link (token) cho người ngoài.
- Đồng bộ realtime đồng tác giả nhiều người cùng sửa 1 dataset.
- Tự động upload/sync vào Lark (dành cho phase sau).
- NLP clustering/semantic grouping nâng cao.

## Users
- ASO Specialists, App Marketers.

## Constraints
- **Technical**: Multi-tenant database bằng Supabase RLS.
- **Security**: Prevent CSV/Excel formula injection khi export.
- **Performance**: Xử lý import batch mượt mà cho tập dữ liệu lớn.

## Success Criteria
- [ ] Tính năng import mapping đúng các cột điểm số và thứ hạng của My App / Competitors.
- [ ] Bộ lọc, rules Relevancy và Total Score engine hoạt động chính xác với Preset.
- [ ] Row Level Security (RLS) policies ngăn chặn triệt để truy cập trái phép chéo workspace.
- [ ] Sanitize xuất sắc đầu ra CSV/XLSX để bảo vệ khỏi formula injection.
