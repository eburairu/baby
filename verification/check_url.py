from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        print(f"Current URL: {page.url}")
        page.screenshot(path="verification/initial_access.png")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()
