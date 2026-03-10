import pytest
from playwright.sync_api import Page, expect
import subprocess
import time
import os
import signal
import sys
import socket

# サーバー管理用のフィクスチャ
@pytest.fixture(scope="module")
def nextjs_server():
    # サーバー起動
    print("Starting Next.js server...")
    # プロセスグループで起動して、終了時に子プロセスも道連れにする
    process = subprocess.Popen(
        ["pnpm", "dev"],
        cwd="frontend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid
    )

    # サーバーが立ち上がるのを待つ
    server_ready = False
    for i in range(60):
        try:
            with socket.create_connection(("localhost", 3000), timeout=1):
                server_ready = True
                break
        except (socket.timeout, ConnectionRefusedError):
            time.sleep(1)
            # プロセスが死んでないか確認
            if process.poll() is not None:
                break

    if not server_ready:
        print("Server failed to start")
        out, err = process.communicate()
        print("STDOUT:", out.decode())
        print("STDERR:", err.decode())
        pytest.fail("Next.js server failed to start")

    yield "http://localhost:3000"

    # サーバー停止
    print("Stopping Next.js server...")
    os.killpg(os.getpgid(process.pid), signal.SIGTERM)

def test_landing_page_ui(page: Page, nextjs_server):
    # APIモック: 未ログイン状態をシミュレート
    page.route("**/api/auth/me", lambda route: route.fulfill(status=401))

    # LPにアクセス
    try:
        page.goto(nextjs_server, timeout=60000)
    except Exception as e:
        print(f"Failed to load page: {e}")
        raise e

    # 1. フッターCTAの確認
    footer_heading = page.get_by_role("heading", name="もう、育児の記録で迷わない。")
    expect(footer_heading).to_be_visible()

    footer_text = page.get_by_text("今日から家族みんなでシェアして、余裕のある時間を。")
    expect(footer_text).to_be_visible()

    # 2. フローティング通知の確認 (アニメーション待ち)
    # パパの記録通知
    dad_notification = page.get_by_text("パパが記録しました")
    # アニメーション待機 (delayがあるため)
    expect(dad_notification).to_be_visible(timeout=10000)

    # AIアドバイス通知
    ai_notification = page.get_by_text("AIアドバイス", exact=True)
    expect(ai_notification).to_be_visible(timeout=10000)

    print("UI verification passed!")
