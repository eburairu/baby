from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(service_workers='block')
    page = context.new_page()

    # Enhanced logging
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))
    page.on("request", lambda req: print(f"REQUEST: {req.method} {req.url}"))
    page.on("requestfailed", lambda req: print(f"REQUEST FAILED: {req.url} {req.failure}"))
    page.on("response", lambda res: print(f"RESPONSE: {res.status} {res.url}"))

    # API Mocking
    # Use explicit wildcards
    page.route("**/api/auth/me", lambda route: (print(f"Mocking auth/me: {route.request.url}"), route.fulfill(
        status=200,
        content_type="application/json",
        body='{"id": 1, "email": "test@example.com", "name": "Test User"}'
    )))

    page.route("**/api/babies", lambda route: (print(f"Mocking babies: {route.request.url}"), route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id": 1, "name": "Test Baby", "birthday": "2024-01-01"}]'
    )))

    # Also mock with trailing slash just in case
    page.route("**/api/babies/", lambda route: (print(f"Mocking babies/: {route.request.url}"), route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id": 1, "name": "Test Baby", "birthday": "2024-01-01"}]'
    )))

    page.route("**/api/records*", lambda route: (print(f"Mocking records: {route.request.url}"), route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    )))

    # Navigate
    try:
        print("Navigating to dashboard...")
        page.goto("http://localhost:8080/dashboard.html")

        # Take a screenshot immediately after load to see initial state
        time.sleep(2)
        page.screenshot(path="verification/debug_v2_initial.png")

        print("Waiting for Test Baby...")
        page.wait_for_selector("text=Test Baby", timeout=5000)
        print("Found Test Baby!")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/debug_v2_error.png")
        print("Screenshot saved to verification/debug_v2_error.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
