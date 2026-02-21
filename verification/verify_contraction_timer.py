from playwright.sync_api import Page, expect, sync_playwright
import time

def test_contraction_timer_ux(page: Page):
    # Capture console logs
    page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

    # Inject script to delay fetch response for contractions POST
    # This ensures the browser waits, allowing us to check the loading state
    # without blocking the Python script execution
    page.add_init_script("""
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [resource, config] = args;
            // Check if it's the POST request to contractions
            if (resource.toString().includes('/api/contractions') && config && config.method === 'POST') {
                console.log('Delaying fetch for POST /api/contractions');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            return originalFetch(...args);
        };
    """)

    # Mock /api/auth/me to simulate logged-in user
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"id": 1, "username": "testuser", "display_name": "Test User", "role": "admin"}'
    ))

    # Mock family members for permissions
    page.route("**/api/family/members", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"user_id": 1, "username": "testuser", "display_name": "Test User", "role": "admin"}]'
    ))

    # Mock API responses
    page.route("**/api/babies/", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id": 1, "name": "Baby One", "role": "admin", "birthday": "2024-01-01"}]'
    ))

    # Consolidated handler without sleep
    def handle_contractions(route):
        if route.request.method == "POST":
            # Immediate response from server side, but browser will delay processing due to init script
            route.fulfill(status=200, content_type="application/json", body='{"id": 100}')
        elif "baby_id=1" in route.request.url:
            route.fulfill(status=200, content_type="application/json", body='[]')
        else:
            route.continue_()

    page.route("**/api/contractions**", handle_contractions)

    # Navigate to the contraction page
    page.goto("http://localhost:3000/contraction")

    # Wait for the start button to appear
    start_button = page.get_by_role("button", name="陣痛がきた！")
    expect(start_button).to_be_visible(timeout=60000)

    # 1. Start timing
    start_button.click()

    # Wait for the stop button to appear
    stop_button = page.get_by_role("button", name="陣痛が終わった")
    expect(stop_button).to_be_visible()

    # 2. Stop timing
    stop_button.click()
    print("Clicked stop button")

    # Check for loading state
    # Note: When stop is clicked, the status changes to 'idle' immediately,
    # so the button text reverts to "🤰 陣痛がきた！" even while loading.
    # We should check the start button for disabled state.

    # Re-query the start button
    loading_button = page.get_by_role("button", name="陣痛がきた！")

    # Check for loading spinner
    expect(page.locator("svg.animate-spin")).to_be_visible()
    print("Verified loading spinner")

    expect(loading_button).to_be_disabled()
    print("Verified loading state (disabled)")

    # Take screenshot of loading state
    page.screenshot(path="verification/contraction_loading.png")
    print("Screenshot taken: loading state")

    # Wait for success toast
    # Since we delayed 3 seconds, we need to wait at least that long
    toast = page.get_by_text("記録しました")
    expect(toast).to_be_visible(timeout=10000)

    # Take screenshot of success state
    page.screenshot(path="verification/contraction_success.png")
    print("Screenshot taken: success state")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_contraction_timer_ux(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
