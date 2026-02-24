import os
import time
import re
from playwright.sync_api import sync_playwright, expect

def verify_button_loading():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            service_workers='block'
        )

        # モック設定
        # 認証
        context.route(re.compile(r".*/api/auth/me/?$"), lambda route: (
            print(f"Intercepted Auth: {route.request.url}"),
            route.fulfill(
                status=200,
                content_type="application/json",
                body='{"id": 1, "username": "testuser", "email": "test@example.com"}'
            )
        ))

        # バージョン
        context.route(re.compile(r".*/api/version/?$"), lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"version": "1.0.0"}'
        ))

        # 通知
        context.route(re.compile(r".*/api/notifications.*"), lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        ))

        # 未読カウント
        context.route(re.compile(r".*/api/notifications/unread-count/?$"), lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"count": 0}'
        ))

        # 赤ちゃん一覧
        context.route(re.compile(r".*/api/babies/?$"), lambda route: (
            print(f"Intercepted Babies: {route.request.url}"),
            route.fulfill(
                status=200,
                content_type="application/json",
                body='[{"id": 1, "name": "Test Baby", "birth_date": "2023-01-01", "gender": "BOY"}]'
            )
        ))

        # 家族メンバー（修正済み）
        context.route(re.compile(r".*/api/family/members.*"), lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            # usernameをトップレベルに配置
            body='[{"user_id": 1, "role": "admin", "username": "testuser", "joined_at": "2023-01-01T00:00:00"}]'
        ))

        # 記録一覧
        context.route(re.compile(r".*/api/babies/1/records.*"), lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        ))

        # デイリーサマリー
        context.route(re.compile(r".*/api/babies/1/daily-summary.*"), lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        ))

        # Diaper POST を遅延させる
        def handle_diaper_post(route):
            print("Handling Diaper POST - delaying 2s")
            time.sleep(2)
            route.fulfill(
                status=200,
                content_type="application/json",
                body='{"id": 100, "baby_id": 1, "diaper_type": "WET", "change_time": "2023-10-27T10:00:00"}'
            )

        context.route(re.compile(r".*/api/diapers/?$"), handle_diaper_post)

        page = context.new_page()

        print("Navigating to dashboard...")
        try:
            page.goto("http://localhost:3000/dashboard?baby_id=1", timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")

        try:
            print("Waiting for main selector...")
            page.wait_for_selector('main', state='visible', timeout=15000)
        except Exception as e:
            print(f"Wait for main failed: {e}")
            os.makedirs("verification_results", exist_ok=True)
            page.screenshot(path="verification_results/timeout.png")
            browser.close()
            return

        print("Looking for button...")
        try:
            button = page.get_by_label("おしっこ")
            button.wait_for(state='visible', timeout=5000)
            print("Button found.")
        except Exception as e:
             print(f"Button not found: {e}")
             page.screenshot(path="verification_results/button_not_found.png")
             browser.close()
             return

        os.makedirs("verification_results", exist_ok=True)
        page.screenshot(path="verification_results/before_click.png")
        print("Before click screenshot saved.")

        print("Clicking button...")
        # クリックを確実にするためforce=Trueにするか、click後にwaitする
        button.click()

        # ローディング状態になるまで待機
        try:
            print("Waiting for busy state...")
            expect(button).to_have_attribute("aria-busy", "true", timeout=3000)
            print("Button is busy.")
            # ビジーになった直後だとまだレンダリングが追いついていない可能性があるので少し待つ
            time.sleep(0.1)
            page.screenshot(path="verification_results/loading_state.png")
            print("Loading state screenshot saved.")
        except Exception as e:
            print(f"Failed to catch loading state: {e}")
            page.screenshot(path="verification_results/failed_catch.png")

        browser.close()

if __name__ == "__main__":
    verify_button_loading()
