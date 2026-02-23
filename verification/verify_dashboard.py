import os
import json
import time
from playwright.sync_api import sync_playwright

def test_dashboard(page):
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PageError: {err}"))

    print("Setting up mocks via init script...")

    # Mock API responses by overriding window.fetch
    page.add_init_script("""
        const originalFetch = window.fetch;
        window.fetch = async (input, init) => {
            let url = input;
            if (typeof input === 'object' && input.url) {
                url = input.url;
            }

            // Normalize URL to handle relative paths
            if (url.startsWith('/')) {
                url = window.location.origin + url;
            }

            console.log('Fetch intercepted:', url);

            const mockResponse = (body) => {
                return new Response(JSON.stringify(body), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            };

            if (url.includes('/api/auth/me')) {
                return mockResponse({
                    id: 1,
                    username: "testuser",
                    display_name: "Test User",
                    is_superadmin: false,
                    email: "test@example.com"
                });
            }

            // Match /api/babies but not sub-resources like /records
            if (url.includes('/api/babies') && !url.includes('/records') && !url.includes('/daily-summary')) {
                return mockResponse([{
                    id: 1,
                    name: "Test Baby",
                    birth_date: "2024-01-01",
                    gender: "MALE",
                    family_id: 1
                }]);
            }

            if (url.includes('/records')) {
                 return mockResponse([
                    {
                        id: 1,
                        type: "feeding",
                        timestamp: new Date().toISOString(), // Use current time
                        details: {
                            feeding_type: "BOTTLE",
                            amount_ml: 120,
                            notes: "Good feeding from Test User"
                        },
                        comment_count: 0,
                        recorded_by_display_name: "Test User"
                    },
                    {
                        id: 2,
                        type: "sleep",
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        details: {
                            end_time: new Date().toISOString(),
                            notes: "Nap"
                        },
                        comment_count: 0,
                        recorded_by_display_name: "Test User"
                    }
                 ]);
            }

            if (url.includes('/daily-summary')) {
                 return mockResponse({content: "Daily summary placeholder"});
            }

            if (url.includes('/api/family/members')) {
                 return mockResponse([{
                    user_id: 1,
                    role: "admin",
                    user: {username: "testuser", display_name: "Test User"}
                 }]);
            }

            if (url.includes('/api/notifications')) {
                return mockResponse([]);
            }

            return originalFetch(input, init);
        };
    """)

    try:
        print("Navigating to dashboard...")
        page.goto("http://localhost:3000/dashboard", timeout=60000)

        print(f"Current URL: {page.url}")

        # Wait for content
        print("Waiting for content...")
        # Check for specific text that should appear
        page.wait_for_selector("text=Test Baby", timeout=10000)
        page.wait_for_selector("text=最近の記録", timeout=10000)

        print("Taking screenshot...")
        page.screenshot(path="verification/dashboard.png", full_page=True)

    except Exception as e:
        print(f"Error during test: {e}")
        print("Taking error screenshot...")
        page.screenshot(path="verification/dashboard_error.png", full_page=True)
        raise e

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Use a persistent context or ensure SW are blocked
        context = browser.new_context(service_workers="block")
        page = context.new_page()
        try:
            test_dashboard(page)
            print("Verification screenshot captured.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
