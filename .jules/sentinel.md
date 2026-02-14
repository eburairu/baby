## 2025-05-15 - Path Traversal in Static File Serving
**Vulnerability:** The application was vulnerable to path traversal attacks via the `serve_frontend` endpoint. The `full_path` parameter was passed directly to `os.path.join`, allowing attackers to access files outside the intended directory using `..` sequences or absolute paths.
**Learning:** Relying on web server or framework defaults to sanitize paths can be risky. Always explicitly validate that the resolved path is within the intended base directory.
**Prevention:** Use `os.path.abspath` to resolve the target path and check if it starts with the canonical base path. Avoid trusting user-supplied path components blindly.

## 2026-02-14 - Exposed Default Credentials in Frontend Bundle
**Vulnerability:** Default test credentials (username and password) were exposed in the frontend bundle because they were assigned to `NEXT_PUBLIC_` environment variables. In Next.js, variables prefixed with `NEXT_PUBLIC_` are embedded in the client-side JavaScript during build time, making them visible to anyone inspecting the source code.
**Learning:** Never use `NEXT_PUBLIC_` for sensitive information, even for "test" or "default" credentials. Anything prefixed with `NEXT_PUBLIC_` is public by design.
**Prevention:** Use empty strings for default values in frontend forms. If default credentials are needed for automated testing, they should be handled by the testing framework (e.g., Playwright) or server-side scripts, never hardcoded or bundled into the client-side application.
