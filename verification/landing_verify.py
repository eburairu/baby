from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(service_workers="block")
        page = context.new_page()

        def handle_auth(route):
            route.fulfill(status=401, body='{"detail":"Unauthorized"}')

        # Mock auth endpoints to force logged-out state
        context.route("**/api/auth/me", handle_auth)
        context.route("**/auth/me", handle_auth)

        try:
            page.goto("http://localhost:3000")

            # Wait for content
            try:
                cta = page.get_by_role("button", name="無料でアカウント作成")
                cta.wait_for(timeout=10000)
                print("CTA found")
            except Exception as e:
                print(f"CTA wait failed: {e}")
                page.screenshot(path="verification/landing_failed.png", full_page=True)
                raise e

            # Verify H1
            h1 = page.get_by_role("heading", name="いつミルクあげた")
            if h1.count() > 0:
                 print(f"H1 verified: {h1.text_content()}")
            else:
                 print("ERROR: H1 not found")

            # Take success screenshot
            page.screenshot(path="verification/landing.png", full_page=True)
            print("Screenshot saved to verification/landing.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
