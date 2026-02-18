import os

import pytest
from fastapi.responses import FileResponse

from app.main import serve_frontend


@pytest.fixture
def frontend_dir(tmp_path, monkeypatch):
    """tmp_path 内にフロントエンドビルドのダミーディレクトリを作成する。"""
    out_dir = tmp_path / "frontend" / "out"
    out_dir.mkdir(parents=True)
    (out_dir / "index.html").write_text("<html>Index</html>")
    monkeypatch.setattr("app.main.frontend_build_path", str(out_dir))
    return out_dir


@pytest.mark.anyio
async def test_path_traversal_blocked(frontend_dir, tmp_path):
    # プロジェクトルート外の機密ファイルを tmp_path 内に作成
    sensitive_file = tmp_path / "sensitive.txt"
    sensitive_file.write_text("SECRET_DATA")

    # パストラバーサル攻撃のシミュレーション
    malicious_path = "../../sensitive.txt"

    response = await serve_frontend(malicious_path)

    # フォールバックとして index.html が返されることを検証
    assert isinstance(response, FileResponse)

    resolved_path = os.path.abspath(response.path)
    expected_fallback_path = os.path.abspath(
        os.path.join(str(frontend_dir), "index.html")
    )

    assert resolved_path == expected_fallback_path, (
        f"Expected fallback to index.html, but got {resolved_path}"
    )

    # 機密ファイルにアクセスされていないことを検証
    assert resolved_path != str(sensitive_file.resolve()), (
        "VULNERABILITY: Sensitive file was accessed!"
    )


@pytest.mark.anyio
async def test_serve_valid_file(frontend_dir):
    # 有効なファイルを配置
    (frontend_dir / "test.js").write_text("console.log('test')")

    response = await serve_frontend("test.js")

    assert isinstance(response, FileResponse)
    resolved_path = os.path.abspath(response.path)
    expected_path = os.path.abspath(os.path.join(str(frontend_dir), "test.js"))

    assert resolved_path == expected_path
