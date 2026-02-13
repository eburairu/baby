## 2025-05-15 - Path Traversal in Static File Serving
**Vulnerability:** The application was vulnerable to path traversal attacks via the `serve_frontend` endpoint. The `full_path` parameter was passed directly to `os.path.join`, allowing attackers to access files outside the intended directory using `..` sequences or absolute paths.
**Learning:** Relying on web server or framework defaults to sanitize paths can be risky. Always explicitly validate that the resolved path is within the intended base directory.
**Prevention:** Use `os.path.abspath` to resolve the target path and check if it starts with the canonical base path. Avoid trusting user-supplied path components blindly.
