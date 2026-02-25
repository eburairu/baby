import os
import re
import time
import subprocess
import signal
import sys
from playwright.sync_api import sync_playwright

def run_verification():
    # Start Next.js server
    print("Starting Next.js server...")
    server_process = subprocess.Popen(
        ["pnpm", "dev"],
        cwd="frontend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid  # Create a new process group
    )

    # Wait for server to be ready
    print("Waiting for server to be ready...")
    time.sleep(10)  # Simple wait, could be improved by polling localhost:3000

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # --- Desktop Verification ---
            print("Verifying Desktop View...")
            context_desktop = browser.new_context(
                viewport={"width": 1280, "height": 800},
                service_workers="block"
            )
            page_desktop = context_desktop.new_page()

            # Mock auth to return 401 (not logged in)
            page_desktop.route(re.compile(r".*/api/auth/me"), lambda route: route.fulfill(
                status=401,
                content_type="application/json",
                body='{"detail": "Not authenticated"}'
            ))

            page_desktop.goto("http://localhost:3000/")
            page_desktop.wait_for_load_state("networkidle")

            # Verify content
            headline = page_desktop.locator("h1").filter(has_text="あれ、さっきいつあげた？")
            print(f"Desktop Headline: {headline.text_content()}")
            assert "あれ、さっきいつあげた？" in headline.text_content()

            cta_button = page_desktop.get_by_role("button", name="無料で育児記録を始める")
            assert cta_button.is_visible()
            print("Desktop CTA button is visible.")

            microcopy = page_desktop.get_by_text("夫婦で共有OK")
            assert microcopy.is_visible()
            print("Desktop Microcopy is visible.")

            os.makedirs("verification_results", exist_ok=True)
            page_desktop.screenshot(path="verification_results/landing_desktop.png")
            print("Saved desktop screenshot.")

            # --- Mobile Verification ---
            print("Verifying Mobile View...")
            context_mobile = browser.new_context(
                viewport={"width": 375, "height": 667},
                service_workers="block"
            )
            page_mobile = context_mobile.new_page()

            # Mock auth
            page_mobile.route(re.compile(r".*/api/auth/me"), lambda route: route.fulfill(
                status=401,
                content_type="application/json",
                body='{"detail": "Not authenticated"}'
            ))

            page_mobile.goto("http://localhost:3000/")
            page_mobile.wait_for_load_state("networkidle")

            # Verify content
            cta_button_mobile = page_mobile.get_by_role("button", name="無料で育児記録を始める")
            assert cta_button_mobile.is_visible()
            print("Mobile CTA button is visible.")

            # Verify microcopy stacking/visibility
            microcopy_mobile = page_mobile.get_by_text("夫婦で共有OK")
            assert microcopy_mobile.is_visible()

            page_mobile.screenshot(path="verification_results/landing_mobile.png")
            print("Saved mobile screenshot.")

            browser.close()
            print("Verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        # Print server output for debugging
        if server_process.poll() is not None:
            stdout, stderr = server_process.communicate()
            print(f"Server STDOUT: {stdout.decode()}")
            print(f"Server STDERR: {stderr.decode()}")
        sys.exit(1)
    finally:
        # Kill the server
        print("Stopping Next.js server...")
        os.killpg(os.getpgid(server_process.pid), signal.SIGTERM)

if __name__ == "__main__":
    run_verification()
