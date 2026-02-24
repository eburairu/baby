import os
import re
import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Using mobile view to check responsiveness as well
    # BLOCK Service Workers to ensure API mocking works
    context = browser.new_context(
        viewport={"width": 375, "height": 667},
        service_workers="block"
    )
    page = context.new_page()

    # Log console messages
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    # Log requests to debug 404s
    page.on("request", lambda request: print(f"Request: {request.method} {request.url}"))
    page.on("response", lambda response: print(f"Response: {response.status} {response.url}"))

    # Mock API routes
    page.route(re.compile(r".*/api/auth/me"), lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"id": 1, "username": "testuser", "email": "test@example.com"}'
    ))

    # Mock babies
    babies_json = '[{"id": 1, "name": "Baby", "gender": "BOY", "birth_date": "2024-01-01T00:00:00", "family_id": 1}]'

    # Mock /api/babies and /api/babies/ (both)
    page.route(re.compile(r".*/api/babies/?(\?.*)?$"), lambda route: route.fulfill(
        status=200, content_type="application/json", body=babies_json
    ))

    # Mock specific baby endpoint
    page.route(re.compile(r".*/api/babies/1/?(\?.*)?$"), lambda route: route.fulfill(
        status=200, content_type="application/json", body=babies_json[1:-1]
    ))

    # Mock family members (crucial for permissions)
    page.route(re.compile(r".*/api/family/members"), lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"user_id": 1, "username": "testuser", "role": "admin", "joined_at": "2024-01-01T00:00:00"}]'
    ))

    # Mock records endpoints
    page.route(re.compile(r".*/api/babies/1/summary"), lambda route: route.fulfill(
        status=200, content_type="application/json", body='{"today_total": 0}'
    ))

    page.route(re.compile(r".*/api/babies/1/records.*"), lambda route: route.fulfill(
        status=200, content_type="application/json", body='[]'
    ))

    # Mock notifications to reduce noise
    page.route(re.compile(r".*/api/notifications.*"), lambda route: route.fulfill(
        status=200, content_type="application/json", body='{"count": 0, "results": []}'
    ))

    # Mock version
    page.route(re.compile(r".*/api/version"), lambda route: route.fulfill(
        status=200, content_type="application/json", body='{"version": "1.0.0"}'
    ))

    # Navigate to dashboard
    try:
        print("Navigating to dashboard...")
        page.goto("http://localhost:3000/dashboard")

        # Wait for content to load
        page.wait_for_load_state("networkidle", timeout=30000)

        # Check if login page redirected (should happen if auth fails)
        if "login" in page.url:
            print("Redirected to login page - auth mock failed?")
            page.screenshot(path="verification/login_fail.png")
            return

        print("Waiting for 'Baby' text...")
        # Just take a screenshot to see what's happening
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/debug_state.png")

        print("Waiting for widget content...")
        # Using a more generic wait or check for the widget
        page.wait_for_selector("text=授乳", timeout=30000)

        # Take screenshot of dashboard
        page.screenshot(path="verification/dashboard.png")
        print("Dashboard screenshot saved to verification/dashboard.png")

        # Verify the widget card button
        # We look for the link with aria-label "授乳の詳細を見る"
        print("Checking for accessible link...")
        link = page.get_by_role("link", name="授乳の詳細を見る")

        if link.count() > 0:
            print("SUCCESS: Found link with aria-label '授乳の詳細を見る'")
            assert link.is_visible()

            # Highlight it
            link.hover()
            page.screenshot(path="verification/dashboard_highlighted.png")
            print("Highlighted screenshot saved")

            # Also verify it contains the ArrowRight icon (SVG)
            svg = link.locator("svg.lucide-arrow-right")
            if svg.count() > 0:
                 print("SUCCESS: Link contains ArrowRight icon")
            else:
                 print("WARNING: Link does not contain ArrowRight icon")
        else:
            print("FAILURE: Link with aria-label '授乳の詳細を見る' NOT found")
            # Fallback search to debug
            print("Dumping all links:")
            for l in page.get_by_role("link").all():
                print(f"Link: {l.get_attribute('href')} - Label: {l.get_attribute('aria-label')}")

    except Exception as e:
        print(f"Error during verification: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)
