from playwright.sync_api import sync_playwright

def verify_required_fields():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Set up local storage for baby selection (based on memory)
            page.add_init_script("""
                localStorage.setItem('baby-store', JSON.stringify({"state":{"selectedBabyId":"1"},"version":0}));
            """)

            print("Navigating to dashboard...")
            # Assuming 'serve' runs on port 3000 by default.
            # If serve picks another port, this might fail, but let's try 3000.
            page.goto('http://localhost:3000/dashboard')

            # Wait for the page to load
            page.wait_for_timeout(2000)

            # 1. Verify Note Form Required Fields
            print("Checking Note Form...")
            # Open Note Dialog or find the Note section if it's on the dashboard
            # The QuickActionBar has a note button.
            note_button = page.locator('button[aria-label="メモを追加"]')
            if note_button.is_visible():
                note_button.click()
                page.wait_for_timeout(1000)

                # Check for "日時" label and asterisk
                date_label = page.locator('label:has-text("日時")')
                date_asterisk = date_label.locator('.text-destructive:has-text("*")')
                if date_asterisk.is_visible():
                    print("✅ Note Form: Date field has required asterisk.")
                else:
                    print("❌ Note Form: Date field missing required asterisk.")

                # Check for "内容" label and asterisk
                content_label = page.locator('label:has-text("内容")')
                content_asterisk = content_label.locator('.text-destructive:has-text("*")')
                if content_asterisk.is_visible():
                    print("✅ Note Form: Content field has required asterisk.")
                else:
                    print("❌ Note Form: Content field missing required asterisk.")

                # Take screenshot of Note Form
                page.screenshot(path='frontend/verification/note_form_verification.png')

                # Close dialog
                page.keyboard.press('Escape')
            else:
                print("Note button not found on dashboard.")

            # 2. Verify Feeding Form Required Fields
            print("Checking Feeding Form...")
            # Feeding form might be accessed via "ミルク" or "母乳" button in QuickActionBar
            # However, in QuickActionBar they are immediate actions.
            # So we navigate to /feeding page where the form should be present.

            print("Navigating to /feeding...")
            page.goto('http://localhost:3000/feeding')
            page.wait_for_timeout(2000)

            # On /feeding page, there should be a FeedingForm.
            # Check for "日時" label and asterisk
            feeding_date_label = page.locator('label:has-text("日時")').first
            feeding_date_asterisk = feeding_date_label.locator('.text-destructive:has-text("*")')

            if feeding_date_asterisk.is_visible():
                print("✅ Feeding Form: Date field has required asterisk.")
            else:
                print("❌ Feeding Form: Date field missing required asterisk.")

            page.screenshot(path='frontend/verification/feeding_form_verification.png')

        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_required_fields()
