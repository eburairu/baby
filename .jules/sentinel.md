## 2025-05-15 - Path Traversal in Static File Serving
**Vulnerability:** The application was vulnerable to path traversal attacks via the `serve_frontend` endpoint. The `full_path` parameter was passed directly to `os.path.join`, allowing attackers to access files outside the intended directory using `..` sequences or absolute paths.
**Learning:** Relying on web server or framework defaults to sanitize paths can be risky. Always explicitly validate that the resolved path is within the intended base directory.
**Prevention:** Use `os.path.abspath` to resolve the target path and check if it starts with the canonical base path. Avoid trusting user-supplied path components blindly.

## 2026-02-14 - Exposed Default Credentials in Frontend Bundle
**Vulnerability:** Default test credentials (username and password) were exposed in the frontend bundle because they were assigned to `NEXT_PUBLIC_` environment variables. In Next.js, variables prefixed with `NEXT_PUBLIC_` are embedded in the client-side JavaScript during build time, making them visible to anyone inspecting the source code.
**Learning:** Never use `NEXT_PUBLIC_` for sensitive information, even for "test" or "default" credentials. Anything prefixed with `NEXT_PUBLIC_` is public by design.
**Prevention:** Use empty strings for default values in frontend forms. If default credentials are needed for automated testing, they should be handled by the testing framework (e.g., Playwright) or server-side scripts, never hardcoded or bundled into the client-side application.

## 2026-02-15 - Missing Input Validation in User Schemas
**Vulnerability:** User-related schemas (`UserCreate`, `FamilyCreate`, `LoginRequest`) lacked input validation for length and complexity. This could allow attackers to perform DoS attacks by sending massive payloads (e.g., extremely long passwords that take significant time to hash) or bypass expected security standards for passwords.
**Learning:** Pydantic models should always include reasonable `min_length`, `max_length`, and `pattern` constraints for user-supplied data to prevent resource exhaustion and ensure data integrity.
**Prevention:** Use Pydantic's `Field` with `min_length`, `max_length`, and `pattern` (regex) to enforce constraints. For login schemas, prioritize `max_length` for DoS protection while ensuring compatibility with existing users.

## 2026-02-16 - Weak and Inconsistent Invite Code Generation
**Vulnerability:** Family invite codes were generated with low/inconsistent entropy (32-bit `token_hex(4)` in `auth.py` vs ~48-bit `token_urlsafe(8)` in `family.py`) and lacked collision checks during regeneration. This increased the risk of brute-force attacks and code guessing.
**Learning:** Security-critical tokens should have consistent high entropy across the application. Relying on short tokens for user-friendly features can compromise security if not properly balanced with rate limiting or sufficient length.
**Prevention:** Standardized on 64-bit entropy (16-character uppercase hex strings) using `secrets.token_hex(8).upper()` and enforced uniqueness checks for all generation paths.

## 2025-02-23 - [Insecure File Upload & Error Leakage]
**Vulnerability:** File upload endpoint relied solely on content-type header and extension, allowing potential file masquerading. Additionally, internal server errors leaked stack trace/implementation details.
**Learning:** Checking `file.content_type` is insufficient as it is client-controlled. Always validate file content (magic bytes).
**Prevention:** Implement server-side content validation using magic bytes. Use generic error messages for 500 responses.

## 2026-03-01 - Timing Attack Vulnerability in Login Endpoint
**Vulnerability:** The login endpoint (`/api/auth/login`) was vulnerable to user enumeration via timing attacks. When a user was not found, the function returned immediately without verifying a password hash, whereas a valid user (with incorrect password) would undergo a time-consuming bcrypt verification. This difference in response time allowed attackers to determine if a username exists.
**Learning:** Security controls like password hashing can introduce side channels if not applied consistently. Always ensure that sensitive operations like authentication take a similar amount of time regardless of the outcome (success/failure).
**Prevention:** Implemented a dummy hash verification that runs when a user is not found, ensuring that `verify_password` is called in both scenarios to equalize execution time.

## 2026-03-02 - Enhancing Security Headers
**Vulnerability:** Missing `Permissions-Policy` allowed potential access to sensitive browser features. API endpoints lacked `Cache-Control: no-store`, risking sensitive data caching.
**Learning:** Defense in depth includes proactively disabling unused browser features and strictly controlling caching for authenticated APIs.
**Prevention:** Added `Permissions-Policy` to disable camera/mic/geo by default. Added `Cache-Control: no-store` middleware for `/api/` routes.

## 2026-03-03 - Case-Sensitive Username Impersonation
**Vulnerability:** Usernames were treated case-sensitively by the database (PostgreSQL), allowing attackers to register confusingly similar accounts (e.g., 'admin' vs 'Admin') and potentially impersonate users or bypass checks.
**Learning:** Default database collation often treats strings as case-sensitive. Application logic must explicitly normalize identifiers (like usernames) to prevent homograph/case-based confusion attacks.
**Prevention:** Enforce lowercase normalization on both storage and lookup for usernames. Use `func.lower(Column) == value.lower()` for case-insensitive comparisons in SQLAlchemy queries.

## 2026-03-03 - User Registration Race Condition (TOCTOU)
**Vulnerability:** A Time-of-Check to Time-of-Use (TOCTOU) race condition existed in user registration. Concurrent requests with the same username (case-insensitive) could bypass the initial existence check and trigger an unhandled `IntegrityError` during insertion, causing a 500 Internal Server Error.
**Learning:** Checking for existence before insertion is insufficient for uniqueness guarantees in concurrent environments. Database constraints are the final source of truth.
**Prevention:** Always wrap database insertion logic in `try...except IntegrityError` blocks when unique constraints are involved. Convert database errors into user-friendly HTTP 400 responses.

## 2026-03-04 - Missing Input Length Validation
**Vulnerability:** Several Pydantic schemas (`FeedingCreate`, `SleepCreate`, etc.) lacked `max_length` constraints on free-text fields like `notes`. This could allow attackers to send excessively long strings, potentially causing Denial of Service (DoS) or storage exhaustion.
**Learning:** Pydantic's default `str` type does not enforce length limits. Explicit validation is necessary for all user-supplied text to prevent abuse.
**Prevention:** Added `Field(..., max_length=2000)` to all free-text fields in schemas. Always define reasonable upper bounds for string inputs.
