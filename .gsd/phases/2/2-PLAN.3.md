---
phase: 2
plan: 3
wave: 3
---

# Plan 2.3: Keywords Data Table & Virtualization

## Objective
Xây dựng giao diện trang Dataset Detail với bảng hiển thị danh sách keywords. Do dataset từ AppTweak có thể lên đến hàng vạn dòng, bảng cần được tích hợp virtualization (ví dụ: TanStack Virtual) và TanStack Table để sort, filter cơ bản các cột (Keyword, Volume, Difficulty, KEI, My Rank, Cột đối thủ).

## Context
- .gsd/SPEC.md
- components/datasets/column-mapper.tsx
- package.json

## Tasks

<task type="auto">
  <name>Install Table & Virtualization Dependencies</name>
  <files>package.json</files>
  <action>
    - Install `@tanstack/react-table` and `@tanstack/react-virtual`.
  </action>
  <verify>npm list @tanstack/react-table @tanstack/react-virtual</verify>
  <done>TanStack Table & Virtual dependencies are installed.</done>
</task>

<task type="auto">
  <name>Create DataTable Component</name>
  <files>components/datasets/data-table.tsx</files>
  <action>
    - Build a reusable data table using Tailwind, Shadcn, and `@tanstack/react-table`.
    - Implement row virtualization with `@tanstack/react-virtual` for performance on large keyword datasets.
    - Render standard columns: Keyword, Volume, Difficulty, KEI, My Rank, Competitor Max/Min.
    - Embed client-side sorting (e.g. by volume, rank).
  </action>
  <verify>tsc --noEmit</verify>
  <done>DataTable component compiles with proper type safety.</done>
</task>

<task type="auto">
  <name>Integrate DataTable into Dataset Detail Page</name>
  <files>app/app/w/[workspaceId]/datasets/[datasetId]/page.tsx</files>
  <action>
    - Create the route for the specific dataset.
    - Fetch the `dataset` details and its `keywords` via Supabase server client.
    - Pass keywords data into the `DataTable` component.
  </action>
  <verify>npm run build</verify>
  <done>Dataset page successfully fetches and renders virtualization table.</done>
</task>

## Success Criteria
- [ ] Bảng keywords render hàng nghìn dòng một mượt mà và không tụt FPS nhờ Virtualization.
- [ ] User có thể sort (volume, difficulty) trực tiếp trên giao diện bảng.
