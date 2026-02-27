import { chromium, Page } from 'playwright';
import path from 'path';

async function verifyRequiredFields() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Load the application (assuming it's running on localhost:3000 or the exported static files)
  // For static export, we might need a file server. Since `next dev` is not running,
  // and `next build` created an `out` directory, we should serve `out`.
  // However, for this verification, I'll assume we can serve the `out` directory or mock the environment.
  // Given the constraints and tools, I'll try to run `npx serve out` in the background.

  try {
    // Navigate to a page with the form. Dashboard usually has the forms.
    // We might need to mock authentication or local storage if the app requires it.

    // Set up local storage for baby selection (based on memory)
    await page.addInitScript(() => {
        localStorage.setItem('baby-store', JSON.stringify({"state":{"selectedBabyId":"1"},"version":0}));
    });

    console.log("Navigating to dashboard...");
    await page.goto('http://localhost:3000/dashboard');
    // Wait for the page to load
    await page.waitForTimeout(2000);

    // 1. Verify Note Form Required Fields
    console.log("Checking Note Form...");
    // Open Note Dialog or find the Note section if it's on the dashboard
    // The QuickActionBar has a note button.
    const noteButton = page.locator('button[aria-label="メモを追加"]');
    if (await noteButton.isVisible()) {
        await noteButton.click();
        await page.waitForTimeout(1000);

        // Check for "日時" label and asterisk
        const dateLabel = page.locator('label:has-text("日時")');
        const dateAsterisk = dateLabel.locator('.text-destructive:has-text("*")');
        if (await dateAsterisk.isVisible()) {
            console.log("✅ Note Form: Date field has required asterisk.");
        } else {
            console.error("❌ Note Form: Date field missing required asterisk.");
        }

        // Check for "内容" label and asterisk
        const contentLabel = page.locator('label:has-text("内容")');
        const contentAsterisk = contentLabel.locator('.text-destructive:has-text("*")');
        if (await contentAsterisk.isVisible()) {
            console.log("✅ Note Form: Content field has required asterisk.");
        } else {
            console.error("❌ Note Form: Content field missing required asterisk.");
        }

        // Take screenshot of Note Form
        await page.screenshot({ path: 'frontend/verification/note_form_verification.png' });

        // Close dialog
        await page.keyboard.press('Escape');
    } else {
        console.log("Note button not found on dashboard, checking if NoteForm is directly visible or in another way.");
    }

    // 2. Verify Feeding Form Required Fields
    console.log("Checking Feeding Form...");
    // Feeding form might be accessed via "ミルク" or "母乳" button in QuickActionBar
    const milkButton = page.locator('button[aria-label="ミルクを記録"]');
    // Note: The QuickActionBar buttons trigger an immediate API call in the current implementation of QuickActionBar.tsx!
    // Wait, let's check QuickActionBar.tsx again.
    // QuickActionBar.tsx: onClick={() => handleQuickRecord("feeding_bottle")} -> executeRecord -> api.post
    // It doesn't open a form dialog for Quick Record.
    // We need to find where FeedingForm is used.
    // It is likely used in `/feeding` page or `FeedingEditDialog`.

    console.log("Navigating to /feeding...");
    await page.goto('http://localhost:3000/feeding');
    await page.waitForTimeout(2000);

    // On /feeding page, there should be a FeedingForm.
    // Check for "日時" label and asterisk
    const feedingDateLabel = page.locator('label:has-text("日時")').first();
    const feedingDateAsterisk = feedingDateLabel.locator('.text-destructive:has-text("*")');

    if (await feedingDateAsterisk.isVisible()) {
        console.log("✅ Feeding Form: Date field has required asterisk.");
    } else {
        console.error("❌ Feeding Form: Date field missing required asterisk.");
    }

    await page.screenshot({ path: 'frontend/verification/feeding_form_verification.png' });

  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await browser.close();
  }
}

verifyRequiredFields();
