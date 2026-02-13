import os
import pytest
from app.main import serve_frontend, frontend_build_path
from fastapi.responses import FileResponse

@pytest.mark.anyio
async def test_path_traversal_blocked():
    # Setup
    os.makedirs("frontend/out", exist_ok=True)
    with open("frontend/out/index.html", "w") as f:
        f.write("<html>Index</html>")

    # Create sensitive file outside
    with open("sensitive.txt", "w") as f:
        f.write("SECRET_DATA")

    # Test logic directly with malicious input
    malicious_path = "../../sensitive.txt"

    response = await serve_frontend(malicious_path)

    # Assert
    assert isinstance(response, FileResponse)

    # We expect it to resolve to index.html (fallback) instead of sensitive file
    resolved_path = os.path.abspath(response.path)
    expected_fallback_path = os.path.abspath(os.path.join(frontend_build_path, "index.html"))

    assert resolved_path == expected_fallback_path, f"Expected fallback to index.html, but got {resolved_path}"

    # Ensure sensitive file is NOT accessed
    expected_sensitive_path = os.path.abspath("sensitive.txt")
    assert resolved_path != expected_sensitive_path, "VULNERABILITY: Sensitive file was accessed!"

@pytest.mark.anyio
async def test_serve_valid_file():
    # Setup
    os.makedirs("frontend/out", exist_ok=True)
    with open("frontend/out/test.js", "w") as f:
        f.write("console.log('test')")

    response = await serve_frontend("test.js")

    assert isinstance(response, FileResponse)
    resolved_path = os.path.abspath(response.path)
    expected_path = os.path.abspath(os.path.join(frontend_build_path, "test.js"))

    assert resolved_path == expected_path
