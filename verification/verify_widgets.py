from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(service_workers='block')
    page = context.new_page()

    # Enhanced logging
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))
    page.on("requestfailed", lambda req: print(f"REQUEST FAILED: {req.url} {req.failure}"))

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

    # Mock all other necessary endpoints
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
        # Do not fulfill immediately

    page.route("**/api/feedings/", handle_feeding)

    diaper_route = None
    def handle_diaper(route):
        nonlocal diaper_route
        diaper_route = route
        # Do not fulfill immediately

    page.route("**/api/diapers/", handle_diaper)

    # Navigate to dashboard
    print("Navigating to dashboard...")
    page.goto("http://localhost:8080/dashboard.html")

    # Wait for widgets to load
    print("Waiting for Test Baby...")
    page.wait_for_selector("text=Test Baby", timeout=10000)
    print("Found Test Baby!")

    # 1. Verify Feeding Widget Loading State
    print("Verifying Feeding Widget...")
    milk_btn = page.get_by_label("ミルクを記録")
    breast_btn = page.get_by_label("母乳を記録")

    print("Clicking Milk button...")
    milk_btn.click()

    # Wait a bit for React to update state
    page.wait_for_timeout(500)

    print("Taking screenshot of Feeding Widget loading...")
    page.screenshot(path="verification/feeding_loading.png")

    # Check loading state
    # The active button should be disabled and showing loading
    # The inactive button should be disabled

    # Note: Loader2 replaces the content, or is added?
    # FeedingWidget implementation:
    # {loadingAction === "bottle" ? (
    #     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    # ) : ... }
    # Wait, Button component handles loading prop by prepending Loader2.

    # Verify milk button is disabled
    expect(milk_btn).to_be_disabled()
    # Verify breast button is disabled
    expect(breast_btn).to_be_disabled()

    # Fulfill the request
    if feeding_route:
        print("Fulfilling feeding request...")
        feeding_route.fulfill(status=200, body='{"id": 1}')
        feeding_route = None
    else:
        print("Warning: feeding_route was not captured!")

    # Wait for loading to finish
    expect(milk_btn).to_be_enabled()
    expect(breast_btn).to_be_enabled()

    # 2. Verify Diaper Widget Loading State
    print("Verifying Diaper Widget...")
    diaper_wet_btn = page.get_by_label("おしっこ")
    diaper_dirty_btn = page.get_by_label("うんち")

    print("Clicking Wet Diaper button...")
    diaper_wet_btn.click()

    page.wait_for_timeout(500)

    print("Taking screenshot of Diaper Widget loading...")
    page.screenshot(path="verification/diaper_loading.png")

    expect(diaper_wet_btn).to_be_disabled()
    expect(diaper_dirty_btn).to_be_disabled()

    if diaper_route:
        print("Fulfilling diaper request...")
        diaper_route.fulfill(status=200, body='{"id": 2}')
        diaper_route = None
    else:
        print("Warning: diaper_route was not captured!")

    expect(diaper_wet_btn).to_be_enabled()

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
