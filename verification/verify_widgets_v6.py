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

    # Wait for buttons to appear
    print("Waiting for buttons...")
    page.wait_for_selector("button[aria-label='ミルクを記録']", timeout=5000)
    print("Found buttons!")

    # 1. Verify Feeding Widget Loading State
    print("Verifying Feeding Widget...")
    # Find the widget card that contains the title "授乳"
    # Using data-slot="card" which is specific to WidgetCard (via Card component)
    feeding_card = page.locator('div[data-slot="card"]').filter(has_text="授乳").first

    milk_btn = feeding_card.get_by_label("ミルクを記録")
    breast_btn = feeding_card.get_by_label("母乳を記録")

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
    page.wait_for_timeout(500)
    expect(milk_btn).to_be_enabled()
    print("Feeding widget recovered (Correct)")

    # 2. Verify Diaper Widget Loading State
    print("Verifying Diaper Widget...")
    diaper_card = page.locator('div[data-slot="card"]').filter(has_text="おむつ").first

    diaper_wet_btn = diaper_card.get_by_label("おしっこ")
    diaper_dirty_btn = diaper_card.get_by_label("うんち")

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
    print("Diaper widget recovered (Correct)")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
