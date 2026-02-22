## 2026-02-14 - Unified Record Fetching Architecture
**Learning:** The `get_records` endpoint in `app/routers/baby.py` fetches ALL records from 4 different tables (Feeding, Sleep, Diaper, Growth), instantiates all ORM objects, sorts them in Python, and returns them all. This is a significant scalability bottleneck as the number of records grows.
**Action:** In future optimizations, consider refactoring this to use a UNION query with pagination at the database level, or implement separate paginated endpoints for the timeline view.

## 2026-02-20 - [PostgreSQL FK Indexes]
**Learning:** PostgreSQL does not automatically create indexes for Foreign Keys. This can lead to slow joins and sequential scans when filtering by the FK column.
**Action:** Always explicitly define `Index` or `index=True` for ForeignKey columns in SQLAlchemy models, especially if they are used for filtering.

## 2026-02-20 - [Partial Deep Comparison Risks]
**Learning:** `React.memo` custom comparison functions that skip "old" data for performance can cause subtle bugs (e.g., historical edits not reflecting). Correctness > Micro-optimization.
**Action:** Always verify "rare" user actions (like editing old records) when optimizing list renders. Modern JS engines handle 100+ JSON.stringifys faster than a React re-render.

## 2026-02-26 - [N+1 Comment Count Optimization]
**Learning:** Fetching auxiliary data (like comment counts) by scanning the entire table for a parent ID (e.g., `baby_id`) is inefficient when only a subset of records is returned.
**Action:** Use a "fetch-then-batch" strategy: Retrieve the main records first, collect their IDs, and then execute a single targeted query using `IN` (or `OR` + `AND` for composite keys) to fetch only the necessary auxiliary data.
