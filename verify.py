from playwright.sync_api import sync_playwright

def verify_faq():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/#faq")
        page.wait_for_selector("#faq")

        # TAB key to focus the first FAQ button
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")

        # we can just use page.locator to force focus
        button = page.locator("text=利用料金はかかりますか？").first
        button.focus()

        # Capture screenshot
        page.screenshot(path="verification_faq_focus.png")

        browser.close()

if __name__ == "__main__":
    verify_faq()
