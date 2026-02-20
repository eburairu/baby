## 2026-02-14 - Unified Record Fetching Architecture
**Learning:** The `get_records` endpoint in `app/routers/baby.py` fetches ALL records from 4 different tables (Feeding, Sleep, Diaper, Growth), instantiates all ORM objects, sorts them in Python, and returns them all. This is a significant scalability bottleneck as the number of records grows.
**Action:** In future optimizations, consider refactoring this to use a UNION query with pagination at the database level, or implement separate paginated endpoints for the timeline view.

## 2026-02-20 - [PostgreSQL FK Indexes]
**Learning:** PostgreSQL does not automatically create indexes for Foreign Keys. This can lead to slow joins and sequential scans when filtering by the FK column.
**Action:** Always explicitly define `Index` or `index=True` for ForeignKey columns in SQLAlchemy models, especially if they are used for filtering.
