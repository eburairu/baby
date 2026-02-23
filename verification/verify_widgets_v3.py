from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(service_workers='block')
    page = context.new_page()

    # Enhanced logging
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    # API Mocking
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"id": 1, "email": "test@example.com", "name": "Test User"}'
    ))

    page.route("**/api/babies", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id": 1, "name": "Test Baby", "birthday": "2024-01-01"}]'
    ))

    page.route("**/api/babies/", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id": 1, "name": "Test Baby", "birthday": "2024-01-01"}]'
    ))

    page.route("**/api/babies/*/records*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    ))

    page.route("**/api/babies/*/daily-summary*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"summary": "No data"}'
    ))

    page.route("**/api/family/members", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    ))

    page.route("**/api/notifications*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    ))

    # Mock POST requests
    feeding_route = None
    def handle_feeding(route):
        nonlocal feeding_route
        feeding_route = route

    page.route("**/api/feedings/", handle_feeding)

    diaper_route = None
    def handle_diaper(route):
        nonlocal diaper_route
        diaper_route = route

    page.route("**/api/diapers/", handle_diaper)

    # Navigate to dashboard
    print("Navigating to dashboard...")
    page.goto("http://localhost:8080/dashboard.html")

    # Wait for widgets to load
    print("Waiting for Test Baby...")
    page.wait_for_selector("text=Test Baby", timeout=10000)
    print("Found Test Baby!")

    # Take screenshot of dashboard
    page.screenshot(path="verification/dashboard_loaded.png")
    print("Screenshot saved to verification/dashboard_loaded.png")

    # Try to find buttons
    print("Looking for buttons...")
    try:
        # Debug: list all buttons
        buttons = page.get_by_role("button").all()
        print(f"Found {len(buttons)} buttons.")
        for i, btn in enumerate(buttons):
            txt = btn.text_content()
            label = btn.get_attribute("aria-label")
            print(f"Button {i}: text='{txt}', label='{label}'")

        milk_btn = page.get_by_label("ミルクを記録")
        if milk_btn.count() > 0:
            print("Found milk button by label!")
            milk_btn.click()
        else:
            print("Milk button not found by label, trying text...")
            page.get_by_role("button", name="ミルク").click()

    except Exception as e:
        print(f"Error interacting with buttons: {e}")
        page.screenshot(path="verification/interaction_error.png")

    # ... (rest omitted for debugging)

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
