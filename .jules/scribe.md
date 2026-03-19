## 2026-03-19 - AI Settings API Specification Drift
**学び:** A pattern of specification drift occurs when new backend configuration properties (like `llm_reasoning_effort` in `app/services/ai_settings.py`) are introduced but omitted from the corresponding TypeScript interfaces (e.g., `AISettings`) and initial seed data documented in `.specify/specs/settings/ai_settings.md`.
**アクション:** When analyzing AI settings endpoints, verify that any new backend configuration parameters are accurately reflected in the frontend's TypeScript interface definitions and initial seed data documentation.
