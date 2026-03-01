---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Presets Configuration UI & State

## Objective
Tạo giao diện quản lý Preset cho Workspace bao gồm cấu hình các tham số đánh giá Relevancy (MinTopCount, N) và trọng số TotalScore (wRel, wVol, wKEI, wDiff, wRank). Tạo API CRUD điểm lưu thiết lập Preset.

## Context
- .gsd/SPEC.md
- app/app/w/[workspaceId]/page.tsx
- package.json

## Tasks

<task type="auto">
  <name>Presets API Routes</name>
  <files>app/api/presets/route.ts</files>
  <action>
    - Ensure a proper API logic to create, read, and update presets for a given workspace.
    - Fields standard config JSON:
      `{ filters: {}, relevancy: { minTopCount: 2, n: 20 }, weights: { rel: 0.5, vol: 0.5, kei: 0, diff: 2, rank: 0 } }`
  </action>
  <verify>tsc --noEmit</verify>
  <done>Preset API endpoints handle POST and GET with proper config objects.</done>
</task>

<task type="auto">
  <name>Preset Configuration Modal/Component</name>
  <files>components/presets/preset-manager.tsx</files>
  <action>
    - Add UI to workspace detail to list existing presets.
    - Build a dialog for creating / editing a preset with sliders or number inputs for the weights.
  </action>
  <verify>npm run build</verify>
  <done>Preset UI components compile properly.</done>
</task>

## Success Criteria
- [ ] User có thể xem danh sách và tạo Preset mới trong giao diện Workspace.
- [ ] API lấy và lưu trữ JSON cấu hình điểm số chuẩn xác.
