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
        body='{"id": 1, "email": "test@example.com", "name": "Test User", "username": "testuser"}'
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

    # Mock family members with permission
    page.route("**/api/family/members", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id": 1, "username": "testuser", "role": "admin"}]'
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
        print("Captured feeding route")

    page.route("**/api/feedings/", handle_feeding)

    diaper_route = None
    def handle_diaper(route):
        nonlocal diaper_route
        diaper_route = route
        print("Captured diaper route")

    page.route("**/api/diapers/", handle_diaper)

    # Navigate to dashboard
    print("Navigating to dashboard...")
    page.goto("http://localhost:8080/dashboard.html")

    # Wait for widgets to load
    print("Waiting for Test Baby...")
    page.wait_for_selector("text=Test Baby", timeout=10000)
    print("Found Test Baby!")

    # Wait for permissions to load and buttons to appear
    print("Waiting for buttons...")
    try:
        page.wait_for_selector("button[aria-label='ミルクを記録']", timeout=5000)
        print("Found milk button!")
    except:
        print("Timeout waiting for milk button. Dumping available buttons:")
        buttons = page.get_by_role("button").all()
        for i, btn in enumerate(buttons):
            print(f"Button {i}: '{btn.text_content()}' label='{btn.get_attribute('aria-label')}'")
        page.screenshot(path="verification/missing_buttons.png")
        raise

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

    # Verify milk button is disabled
    if not milk_btn.is_disabled():
        print("ERROR: Milk button is NOT disabled!")
    else:
        print("Milk button is disabled (Correct)")

    # Verify breast button is disabled
    if not breast_btn.is_disabled():
        print("ERROR: Breast button is NOT disabled!")
    else:
        print("Breast button is disabled (Correct)")

    # Fulfill the request
    if feeding_route:
        print("Fulfilling feeding request...")
        feeding_route.fulfill(status=200, body='{"id": 1}')
        feeding_route = None
    else:
        print("Warning: feeding_route was not captured!")

    # Wait for loading to finish
    # Need to wait for route fulfillment to process
    page.wait_for_timeout(500)
    expect(milk_btn).to_be_enabled()
    expect(breast_btn).to_be_enabled()
    print("Feeding widget recovered from loading (Correct)")

    # 2. Verify Diaper Widget Loading State
    print("Verifying Diaper Widget...")
    diaper_wet_btn = page.get_by_label("おしっこ")
    diaper_dirty_btn = page.get_by_label("うんち")

    print("Clicking Wet Diaper button...")
    diaper_wet_btn.click()

    page.wait_for_timeout(500)

    print("Taking screenshot of Diaper Widget loading...")
    page.screenshot(path="verification/diaper_loading.png")

    if not diaper_wet_btn.is_disabled():
        print("ERROR: Wet Diaper button is NOT disabled!")
    else:
        print("Wet Diaper button is disabled (Correct)")

    if not diaper_dirty_btn.is_disabled():
        print("ERROR: Dirty Diaper button is NOT disabled!")
    else:
        print("Dirty Diaper button is disabled (Correct)")

    if diaper_route:
        print("Fulfilling diaper request...")
        diaper_route.fulfill(status=200, body='{"id": 2}')
        diaper_route = None
    else:
        print("Warning: diaper_route was not captured!")

    page.wait_for_timeout(500)
    expect(diaper_wet_btn).to_be_enabled()
    print("Diaper widget recovered from loading (Correct)")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
