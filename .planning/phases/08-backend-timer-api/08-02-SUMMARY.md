---
phase: 08-backend-timer-api
plan: "02"
subsystem: backend
tags: [models, schemas, migration, timer, sqlalchemy, pydantic, alembic]
dependency_graph:
  requires: []
  provides:
    - ContractionTimerState SQLAlchemy model (app/models/timer.py)
    - FeedingTimerState SQLAlchemy model (app/models/timer.py)
    - ContractionTimerResponse/Update Pydantic schemas (app/schemas/timer.py)
    - FeedingTimerResponse/Update Pydantic schemas (app/schemas/timer.py)
    - contraction_timer_states DB table (g1h2i3j4 migration)
    - feeding_timer_states DB table (g1h2i3j4 migration)
  affects:
    - app/models/__init__.py (import list extended)
    - 08-03-PLAN.md (router implementation can now use these models)
tech_stack:
  added: []
  patterns:
    - SQLAlchemy DeclarativeBase model with unique ForeignKey constraint
    - Pydantic v2 ConfigDict from_attributes=True for ORM serialization
    - Alembic migration chained via down_revision
key_files:
  created:
    - app/models/timer.py
    - app/schemas/timer.py
    - alembic/versions/g1h2i3j4_add_timer_state_tables.py
  modified:
    - app/models/__init__.py
decisions:
  - "Migration down_revision set to a1b2c3d4e5f0 (not f2e3d4c5 as planned) — a1b2c3d4e5f0 was already the head on develop; chaining to f2e3d4c5 would have created split heads"
  - "DB was in inconsistent state (alembic_version=a1b2c3d4e5f0 but tables missing) — reset alembic_version and ran full migration chain from base"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-02"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 1
---

# Phase 8 Plan 02: タイマー状態モデル・スキーマ・マイグレーション Summary

**One-liner:** SQLAlchemy で baby_id 一意制約付き ContractionTimerState / FeedingTimerState を定義し、Pydantic スキーマと Alembic マイグレーションで DB 層の型契約を確立。

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | タイマー SQLAlchemy モデルと Pydantic スキーマを作成 | 67efe80 | app/models/timer.py, app/schemas/timer.py, app/models/__init__.py |
| 2 | Alembic マイグレーションを作成してローカル DB に適用 | 0f182d9 | alembic/versions/g1h2i3j4_add_timer_state_tables.py |

## Verification Results

```
Models: contraction_timer_states feeding_timer_states
Schemas: OK
alembic current: g1h2i3j4 (head)
Timer tables in DB: ['contraction_timer_states', 'feeding_timer_states']
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] マイグレーション down_revision を f2e3d4c5 から a1b2c3d4e5f0 に修正**
- **Found during:** Task 2
- **Issue:** プランでは down_revision='f2e3d4c5' と指定されていたが、develop DB にはすでに a1b2c3d4e5f0 が head として適用されていた。f2e3d4c5 を指定すると 2 つの head が生まれ `npm run migrate` が失敗した
- **Fix:** g1h2i3j4 の down_revision を 'a1b2c3d4e5f0' に修正してマイグレーションチェーンを正常化
- **Files modified:** alembic/versions/g1h2i3j4_add_timer_state_tables.py
- **Commit:** 0f182d9

**2. [Rule 1 - Bug] alembic_version テーブル不整合を修正**
- **Found during:** Task 2
- **Issue:** develop DB の alembic_version が a1b2c3d4e5f0 を示していたが実際のテーブルは alembic_version のみ存在（babies テーブル等が欠損）。`relation "babies" does not exist` エラーで migrate が失敗
- **Fix:** alembic_version テーブルをクリアし、base からすべてのマイグレーションを再実行
- **Files modified:** なし（DB のみ操作）
- **Commit:** 0f182d9（マイグレーション適用済みの状態でコミット）

## Self-Check

## Self-Check: PASSED

| Item | Status |
|------|--------|
| app/models/timer.py | FOUND |
| app/schemas/timer.py | FOUND |
| alembic/versions/g1h2i3j4_add_timer_state_tables.py | FOUND |
| Commit 67efe80 | FOUND |
| Commit 0f182d9 | FOUND |
