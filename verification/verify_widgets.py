from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(service_workers='block')
    page = context.new_page()

    # コンソールログを出力
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
    page.on("requestfailed", lambda request: print(f"Request failed: {request.url} {request.failure}"))
    page.on("request", lambda request: print(f"Request: {request.url}"))

    # APIモック
    def handle_auth_me(route):
        print(f"Mocking {route.request.url}")
        route.fulfill(
            status=200,
            content_type="application/json",
            body='{"id": 1, "email": "test@example.com", "username": "testuser", "is_active": true, "is_superuser": false}'
        )
    page.route("**/api/auth/me", handle_auth_me)

    def handle_babies(route):
        print(f"Mocking {route.request.url}")
        route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id": 1, "name": "Baby", "birthday": "2024-01-01", "gender": "BOY"}]'
        )
    page.route("**/api/babies/", handle_babies)
    page.route("**/api/babies", handle_babies)

    def handle_records(route):
        print(f"Mocking {route.request.url}")
        route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        )
    page.route("**/api/babies/*/records", handle_records)
    page.route("**/api/babies/*/records/", handle_records)

    def handle_daily_summary(route):
        print(f"Mocking {route.request.url}")
        route.fulfill(
            status=200,
            content_type="application/json",
            body='{"feeding_count": 0, "sleep_total_minutes": 0, "diaper_count": 0}'
        )
    page.route("**/api/babies/*/daily-summary", handle_daily_summary)

    # 権限関連
    def handle_family_members(route):
        print(f"Mocking {route.request.url}")
        route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id": 1, "username": "testuser", "role": "admin"}]'
        )
    page.route("**/api/family/members", handle_family_members)

    # Cookie設定
    context.add_cookies([{
        "name": "access_token",
        "value": "dummy_token",
        "domain": "localhost",
        "path": "/"
    }])

    try:
        print("Navigating to dashboard...")
        page.goto("http://localhost:3000/dashboard")

        # UIが表示されるまで待つ
        page.wait_for_timeout(5000)

        # スクリーンショット
        page.screenshot(path="verification/dashboard.png", full_page=True)
        print("Screenshot saved to verification/dashboard.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
