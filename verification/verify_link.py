import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

    # 1. Register (Create Family)
    timestamp = int(time.time())
    username = f"user_{timestamp}"
    family_name = f"Family_{timestamp}"
    password = "password123"

    print(f"Registering as {username} (Family: {family_name})...")
    page.goto("http://localhost:3000/register")

    # Wait for the form to be visible
    page.wait_for_selector('input[name="name"]')

    # Fill Create Family form
    page.fill('input[name="name"]', family_name)       # Family Name
    page.fill('input[name="username"]', username)      # Your Name
    page.fill('input[name="password"]', password)      # Password

    # Click the correct submit button
    page.click('button:has-text("Create Family")')

    # Wait for navigation or error
    try:
        page.wait_for_url("**/", timeout=5000) # Expect redirect to home (dashboard)
    except:
        print("Redirect timed out. Checking for errors...")

        # Check for error messages
        error_locator = page.locator('.text-red-500')
        if error_locator.count() > 0:
            print(f"Error on page: {error_locator.inner_text()}")

    print(f"Current URL: {page.url}")

    # If redirected to login (unlikely based on code, but possible)
    if "/login" in page.url:
        print("Logging in...")
        # ... (login logic)

    # 2. Add Baby if needed (Onboarding)
    # Check if we are on the onboarding screen
    # The onboarding screen has "ようこそ！"
    if "ようこそ！" in page.content() or "赤ちゃんの名前" in page.content():
        print("Onboarding detected. Adding a baby...")
        baby_name = "Test Baby"

        page.fill('#babyName', baby_name)
        page.click('button:has-text("登録する")') # "登録する" button

        # Wait for dashboard reload
        page.wait_for_timeout(3000)
        print("Baby added.")

    # 3. Check Dashboard
    print(f"Final URL: {page.url}")

    # 陣痛タイマーのリンクを探す
    contraction_link = page.locator('a[href="/contraction"]')

    # リンクが存在するか確認
    if contraction_link.count() > 0:
        print("Contraction link found!")
        class_attr = contraction_link.get_attribute("class")
        print(f"Link class: {class_attr}")

        inner_html = contraction_link.inner_html()
        if "<button" in inner_html:
             print("ERROR: <button> tag still found inside the link!")
        else:
             print("SUCCESS: <button> tag is gone!")

        contraction_link.scroll_into_view_if_needed()
        page.screenshot(path="verification/dashboard_link.png")
        print("Screenshot saved.")
    else:
        print("Contraction link NOT found!")
        # Dump content to see what's wrong
        # print(page.content())
        page.screenshot(path="verification/dashboard_error.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
