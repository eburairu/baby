import time
import subprocess
import threading
from playwright.sync_api import sync_playwright

# Start static server
server_process = subprocess.Popen(["python", "verification/serve_static.py"])
time.sleep(2) # Wait for server to start

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(service_workers='block')
        page = context.new_page()

        # Mock API responses
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
            # Dummy records for RecentActivityFeed
            records = [
                {
                    "id": 1,
                    "type": "feeding",
                    "timestamp": "2024-05-24T10:00:00Z",
                    "recorded_by_id": 1,
                    "recorded_by_display_name": "Dad",
                    "comment_count": 0,
                    "details": {"amount": 100, "unit": "ml", "notes": "Drank well"}
                },
                {
                    "id": 2,
                    "type": "sleep",
                    "timestamp": "2024-05-24T08:00:00Z",
                    "recorded_by_id": 1,
                    "recorded_by_display_name": "Mom",
                    "comment_count": 2,
                    "details": {"start_time": "2024-05-24T08:00:00Z", "end_time": "2024-05-24T09:30:00Z", "notes": "Morning nap"}
                }
            ]
            import json
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(records)
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

        def handle_family_members(route):
            print(f"Mocking {route.request.url}")
            route.fulfill(
                status=200,
                content_type="application/json",
                body='[{"id": 1, "username": "testuser", "role": "admin"}]'
            )
        page.route("**/api/family/members", handle_family_members)

        # Set cookies
        context.add_cookies([{
            "name": "access_token",
            "value": "dummy_token",
            "domain": "localhost",
            "path": "/"
        }])

        print("Navigating to dashboard...")
        # Access the static file directly via the local server
        page.goto("http://localhost:8001/dashboard.html")

        # Wait for records to load
        page.wait_for_selector("text=Drank well", timeout=10000)

        # Focus on the first record button
        # Use a reliable locator for the button we just added
        first_record_button = page.locator("ul.space-y-3 > li > button").first
        first_record_button.focus()

        # Take screenshot of the focused state
        page.screenshot(path="verification/dashboard_focus.png")
        print("Screenshot saved to verification/dashboard_focus.png")

        # Verify accessibility attributes
        is_button = first_record_button.evaluate("el => el.tagName === 'BUTTON'")
        has_type_button = first_record_button.evaluate("el => el.getAttribute('type') === 'button'")

        if is_button and has_type_button:
            print("VERIFICATION SUCCESS: List item is now a button with type='button'")
        else:
            print(f"VERIFICATION FAILED: is_button={is_button}, has_type_button={has_type_button}")
            exit(1)

        browser.close()

except Exception as e:
    print(f"Error: {e}")
    exit(1)
finally:
    server_process.terminate()
