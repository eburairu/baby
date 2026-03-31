from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Mock the backend responses
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        json={"id": 1, "email": "test@example.com", "display_name": "Test User"}
    ))

    page.route("**/api/babies", lambda route: route.fulfill(
        status=200,
        json=[{
            "id": 1,
            "name": "Test Baby",
            "birthday": "2023-01-01",
            "due_date": None,
            "gender": "unknown",
            "characteristics": "Testing",
            "color": "blue",
            "invite_code": "TESTCODE"
        }]
    ))

    page.route("**/api/babies/1/records**", lambda route: route.fulfill(
        status=200,
        json={
            "records": [
                {
                    "id": 100,
                    "baby_id": 1,
                    "type": "note",
                    "timestamp": "2024-03-31T20:00:00Z",
                    "recorded_by": 1,
                    "details": {"notes": "テストメモです"},
                    "comment_count": 0,
                    "created_at": "2024-03-31T20:00:00Z",
                    "updated_at": "2024-03-31T20:00:00Z"
                }
            ],
            "has_next": False,
            "total_count": 1
        }
    ))

    # Go to the local dashboard
    page.goto("http://localhost:3000/dashboard")

    # Wait for the network to be idle
    page.wait_for_load_state("networkidle")

    # Take a screenshot
    page.screenshot(path="notewidget.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
