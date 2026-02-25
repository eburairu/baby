import re
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Mock Auth
    page.route(re.compile(r".*/api/auth/me"), lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"id": "user1", "username": "testuser", "display_name": "Test User"}'
    ))

    # Mock Babies
    page.route(re.compile(r".*/api/babies"), lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id": 1, "name": "Baby", "birthday": "2024-01-01T00:00:00Z", "gender": "male"}]'
    ))

    # Mock Family Members
    page.route(re.compile(r".*/api/family/members"), lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    ))

    # Mock Contractions
    page.route(re.compile(r".*/api/contractions.*"), lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''[
            {
                "id": 1,
                "baby_id": 1,
                "start_time": "2024-01-01T10:00:00Z",
                "end_time": "2024-01-01T10:01:00Z",
                "duration_seconds": 60,
                "interval_seconds": 600,
                "notes": "Test note",
                "recorded_by_display_name": "Test User",
                "comment_count": 0
            },
            {
                "id": 2,
                "baby_id": 1,
                "start_time": "2024-01-01T10:11:00Z",
                "end_time": "2024-01-01T10:12:00Z",
                "duration_seconds": 60,
                "interval_seconds": 600,
                "notes": "Test note 2",
                "recorded_by_display_name": "Test User",
                "comment_count": 0
            }
        ]'''
    ))

    # Navigate to Contraction Page
    try:
        print("Navigating to page...")
        page.goto("http://localhost:3000/contraction?baby_id=1")

        # Wait for content
        print("Waiting for content...")
        page.wait_for_selector("text=陣痛記録", timeout=10000)

        # Wait for user name to appear in the list (confirmation that data is rendered)
        page.wait_for_selector("text=Test User", timeout=5000)

        # Scroll down to ensure everything is rendered
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(1000) # Wait for scroll

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification_contraction.png", full_page=True)
        print("Verification successful!")
    except Exception as e:
        print(f"Verification failed: {e}")
        page.screenshot(path="verification_failed.png", full_page=True)
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
