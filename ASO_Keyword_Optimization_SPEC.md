# SPEC - ASO Keyword Optimization (Next.js + Supabase + Vercel)

> Deploy public, dữ liệu private-by-default theo workspace, chỉ chia sẻ khi invite trực tiếp.

---

## 1) Mục tiêu sản phẩm

### Mục tiêu chính
1. Import 1 file CSV (AppTweak export) có cấu trúc:
   - `Keyword`, `Volume`, `Difficulty`, `KEI`
   - `Rank - <My App Name>`
   - `Rank - <Competitor 1..N>` (N tối đa 10)
2. Lọc keyword theo điều kiện:
   - Volume, Difficulty, KEI, My Rank
   - Competitive relevancy (định nghĩa theo đối thủ)
3. Chấm điểm `Total Score` theo công thức tùy chỉnh + có preset theo mục tiêu/market/app
4. Chọn keyword thủ công:
   - click, shift+click chọn dải, ctrl/cmd chọn nhiều
5. Export kết quả:
   - **Selected keywords (primary)**
   - Filtered results (optional)
   - CSV và XLSX

### Mục tiêu bảo mật - chia sẻ
- App public nhưng dữ liệu **private-by-default**
- User chỉ xem được workspace mà họ:
  - là owner hoặc
  - được mời (member)
- Không ai thấy workspace/dataset của người khác nếu không share

---

## 2) Scope MVP

### In scope
- Auth (Google OAuth hoặc email magic link)
- Workspace + share via invite (email)
- Import CSV -> mapping cột -> tạo dataset
- Tính derived metrics (relevancy theo đối thủ)
- Filter + score realtime
- Manual selection + tags/notes
- Export CSV/XLSX
- Presets lưu theo workspace

### Out of scope (MVP)
- Public share link (token) - để phase sau
- Đồng bộ realtime nhiều người cùng sửa 1 dataset
- Lark upload tự động (phase sau)
- NLP clustering/semantic grouping nâng cao

---

## 3) Tech stack
- Frontend: **Next.js (App Router) + TypeScript**
- Hosting: **Vercel**
- Auth + DB: **Supabase (Auth + Postgres + RLS)**
- CSV parse: PapaParse (client) hoặc server route
- Table: TanStack Table + virtualization
- Export XLSX: SheetJS (xlsx)

---

## 4) Data model (database)

### 4.1 Tables

#### `workspaces`
- `id` (uuid)
- `name` (text)
- `owner_id` (uuid - auth.users)
- `created_at` (timestamptz)

#### `workspace_members`
- `workspace_id` (uuid)
- `user_id` (uuid)
- `role` (text enum: owner | editor | viewer)
- `created_at` (timestamptz)
- Unique: `(workspace_id, user_id)`

#### `datasets`
- `id` (uuid)
- `workspace_id` (uuid)
- `name` (text)
- `source_filename` (text)
- `competitor_count` (int)
- `my_rank_column_name` (text)
- `competitor_column_names` (jsonb array)
- `created_by` (uuid)
- `created_at` (timestamptz)

#### `keywords`
- `id` (uuid)
- `dataset_id` (uuid)
- `keyword` (text)
- `volume` (numeric, nullable)
- `difficulty` (numeric, nullable)
- `kei` (numeric, nullable)
- `my_rank` (int, nullable)
- `competitor_ranks` (jsonb map: `{ "Rank - App A": 12, "Rank - App B": null }`)
- Derived cached:
  - `competitor_ranked_count` (int)
  - `competitor_topN_count` (int)
  - `competitor_best_rank` (int, nullable)
  - `relevancy_score` (numeric)
  - `total_score` (numeric)
- `created_at` (timestamptz)

#### `presets`
- `id` (uuid)
- `workspace_id` (uuid)
- `name` (text)
- `config` (jsonb)
- `created_by` (uuid)
- `created_at` (timestamptz)

#### `selections`
> Lưu ý: chốt 1 trong 2 mode.
- **Mode A (team-shared selection)**: Unique `(dataset_id, keyword_id)` và thêm `selected_by` chỉ để audit.
- **Mode B (per-user selection)**: Unique `(dataset_id, keyword_id, selected_by)`.

Fields:
- `id` (uuid)
- `dataset_id` (uuid)
- `keyword_id` (uuid)
- `selected_by` (uuid)
- `tags` (jsonb array)
- `note` (text)
- `created_at` (timestamptz)

---

## 5) Competitive relevancy (đúng logic)

### 5.1 Derived metrics (từ competitor rank columns)
- `competitor_ranked_count`: số đối thủ có rank hợp lệ (>0)
- `competitor_topN_count`: số đối thủ rank <= N (default N=20)
- `competitor_best_rank`: rank nhỏ nhất trong các đối thủ (min)

### 5.2 Relevancy rule (gate)
- `relevancy_pass` nếu `competitor_topN_count >= MinTopCount`
- default:
  - `N = 20`
  - `MinTopCount = 2`
- Support competitor_count tối đa 10

### 5.3 RelevancyScore (configurable)
- `TopFactor = topN_count / competitor_count`
- `RankedFactor = ranked_count / competitor_count`
- `BestRankFactor = (T - min(best_rank, T)) / T` (T default 50)
- `Bonus` nếu pass gate

Các tham số A/B/C/T/Bonus, N, MinTopCount đều nằm trong preset config.

---

## 6) Scoring engine - Total Score

### 6.1 Normalize
- Normalize Volume/Difficulty/KEI về 0-100 theo min-max dataset
- Volume có toggle `log(volume+1)`

### 6.2 TotalScore (preset-based)
`total_score = wRel*Rel + wVol*Vol + wKEI*KEI - wDiff*Diff - wRank*RankPenalty`

RankPenalty:
- option 1: phạt nếu có `my_rank` (rank càng nhỏ càng ít phạt)
- option 2: không phạt nếu unranked (toggle)

---

## 7) Presets (bắt buộc)
Preset lưu theo workspace, gồm:
- Filters default (volume min, diff max, ...)
- Relevancy settings (N, MinTopCount, weights A/B/C, bonus, T)
- TotalScore weights (wRel, wVol, wKEI, wDiff, wRank)
- Transforms (log-volume on/off)
- Rank penalty mode

Preset mẫu MVP:
- Balanced
- Relevancy-first
- Low-competition focus (ưu tiên difficulty vừa phải, KEI cao)
- Growth/Volume lean

---

## 8) UX screens (wireframe functional)

### Screen A - Auth
- Login with Google/email
- Redirect to `/app`

### Screen B - Workspace list
- My workspaces
- Shared with me
- Create workspace
- Open workspace

### Screen C - Workspace detail
- Datasets list
- Presets list
- Members management (invite)

### Screen D - Import dataset
- Upload CSV
- Map columns:
  - Keyword, Volume, Difficulty, KEI (dropdown)
  - Auto-detect rank columns: all columns startsWith `Rank -`
  - Choose My Rank (radio - exactly 1)
  - Choose Competitors (checkbox - 0..10)
- Build dataset

### Screen E - Dataset workspace (core)
- Left: Filters (Volume/Difficulty/KEI/My Rank/Relevancy)
- Top: Preset selector + Save preset
- Center: Table sortable + multi-select (click/shift/ctrl)
- Right: keyword proof detail (list competitor ranks)
- Bottom/Side: Selected drawer (tags/notes, remove, export)

### Screen F - Export modal
- Export Selected hoặc Filtered
- Format CSV/XLSX
- Options: include proof fields + include preset metadata sheet (XLSX)

---

## 9) Security - xây ngay từ đầu (must-have)

### 9.1 Authorization enforced at DB level (RLS)
- Bật RLS trên tất cả bảng dữ liệu
- Policy theo nguyên tắc: user chỉ truy cập row nếu là owner/member của workspace liên quan
- Không dựa vào client filtering

### 9.2 CSV/Excel injection prevention khi export
- Sanitize tất cả text field (keyword, note, tag, app names)
- Nếu bắt đầu bằng `=`, `+`, `-`, `@`, tab -> prepend `'` để Excel hiểu là text

### 9.3 Secrets management
- Không bao giờ đưa service role key vào client
- Supabase anon key có thể ở client
- Service role chỉ dùng trong server route (invite, admin ops)
- Vercel env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)

### 9.4 Import safety
- Giới hạn file size và row count
- Validate numeric columns
- Rate limit import endpoint theo user

### 9.5 Logging
- Log event metadata (ai import/export/invite) nhưng không log nội dung CSV

---

## 10) API/Routes (Next.js)

### Client routes
- `/app` (workspace list)
- `/app/w/[workspaceId]`
- `/app/w/[workspaceId]/datasets/[datasetId]`

### Server routes (recommended)
- `POST /api/workspaces/invite` (owner/editor only)
- `POST /api/datasets/import` (parse + insert batch)
- `POST /api/datasets/[id]/recompute-scores` (khi đổi preset config; optional)
- `POST /api/export` (generate CSV/XLSX, apply sanitize)

> MVP có thể tính score client-side; nhưng để shared consistent và dataset lớn, nên lưu score server-side.

---

## 11) Import pipeline (CSV -> DB)
1. Parse CSV
2. Normalize keyword (lowercase/trim/collapse spaces)
3. Detect rank columns
4. Map:
   - `my_rank` = value từ cột My Rank
   - `competitor_ranks` = map từ các cột competitor
5. Compute derived metrics (`topN_count`, `ranked_count`, `best_rank`)
6. Compute `relevancy_score` + `total_score` theo preset default của workspace
7. Insert batch keywords (500–2000 rows per batch)

---

## 12) Export strategy + Lark

### MVP recommendation
- Export:
  - CSV: canonical, dễ re-import
  - XLSX: review-friendly, multi sheet
- XLSX structure:
  - Sheet 1: Selected
  - Sheet 2: Filtered (optional)
  - Sheet 3: Preset metadata

### Phase sau - Lark
- Lark phù hợp để lưu trữ/collab dạng Sheets/Base
- Giữ CSV làm canonical, XLSX để review/team

---

## 13) Testing - acceptance

### Core tests
- RLS:
  - User A không đọc được workspace/dataset/keywords của User B
  - Member viewer chỉ read, editor mới write
- Import:
  - rank columns parse đúng
  - competitor_count 5..10 hoạt động
- Relevancy:
  - `>=2` competitor top20 -> pass
- Export:
  - sanitize chống formula injection
- Selection:
  - shift/cmd/ctrl multi-select đúng

---

## 14) Roadmap triển khai (phù hợp Antigravity/GSD)

### Phase 1 - Auth + Workspace + RLS skeleton
- Supabase Auth setup
- DB schema + RLS policies
- Workspace CRUD + members invite (email)

### Phase 2 - Dataset import + table view
- CSV import route
- keywords table + virtualization
- filters cơ bản

### Phase 3 - Scoring + Presets + Selection
- preset config UI
- recompute score
- selected drawer + tags/notes

### Phase 4 - Export CSV/XLSX + hardening
- export modal + sanitize
- rate limit import/export
- audit logs

### Phase 5 - Lark integration (optional)
- upload file to Lark Drive hoặc push vào Lark Sheets/Base

---

---

## UI Requirements (MVP)

### Design goals
- Giao diện **tối giản**, ưu tiên tốc độ và độ rõ ràng để giúp người dùng **chọn keyword hợp lý nhất**.
- Tránh “dashboard overload”: chỉ hiển thị những gì phục vụ cho **Filter → Score → Select → Export**.

### Color system
- Primary: `#FEB107`
- Neutral/Dark: `#000000`
- Accent: `#FF8903`
- Có thể mở rộng bằng các màu **gần** (tints/shades) để tạo:
  - background / surface nhẹ
  - border / hover / disabled
  - trạng thái (selected, warning)

### UI patterns
- Layout ưu tiên “table-first” (bảng keyword là trung tâm).
- Filters ở sidebar trái; detail/proof ở panel phải; selected drawer ở dưới hoặc bên phải.
- Trạng thái **Selected** phải nổi bật (row highlight + checkbox) nhưng không gây rối mắt.
- Typography đơn giản, dễ đọc; spacing thoáng để scan bảng nhanh.

## 15) DECISIONS (chốt)
- Multi-tenant isolation: **Supabase RLS** là nguồn chân lý
- Share: invite by email (MVP)
- Competitors: tối đa 10, lấy từ cột `Rank - …`
- Export: luôn sanitize để chống CSV injection
- Canonical data: DB là nguồn, XLSX/CSV chỉ là output

---
