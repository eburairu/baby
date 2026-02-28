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

## 2026-03-01 - [React List Performance: Memoization Chain]
**Learning:** In lists using `useInfiniteScroll` where items are appended, simply wrapping list items in `React.memo` is insufficient if the event handlers passed to them are re-created on every render (e.g., inline arrow functions). This causes O(n) re-renders for O(1) updates.
**Action:** Always wrap event handlers passed to memoized list items in `useCallback` to ensure reference stability.

## 2026-03-05 - [SQLAlchemy N+1 Loop Prevention]
**Learning:** Querying related entities (like `FamilyUser` roles) inside a loop across multiple records (`RecordComment`) is a hidden N+1 bottleneck. SQLAlchemy's `first()` inside a loop does not batch queries by default.
**Action:** Extract all required IDs from the list into a set, and perform a single `.in_()` query to fetch related records in batch. Combine this with `joinedload` for eager loading of direct relationships (like `.user`) to keep database queries constant regardless of list size.

## 2026-03-05 - [SQLAlchemy N+1 Loop Prevention in Family Retrieval]
**Learning:** Querying related entity aggregations (like member count per family) inside a loop (`db.query(func.count(FamilyUser.user_id)).filter(FamilyUser.family_id == f.id).scalar()`) creates a significant N+1 bottleneck when paginating families in the admin dashboard.
**Action:** Extract family IDs into a list (`[f.id for f in families]`) and execute a single grouped query (`.in_(family_ids)` combined with `.group_by(FamilyUser.family_id)`) to map counts into a dictionary before the loop. This reduces queries from O(N) to O(1).
