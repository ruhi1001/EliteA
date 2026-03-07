import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { testData } from '../utils/testData';

test.describe('Newsletter Signup (Homepage)', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto(testData.newsletter.homePath);
  });

  test('TC_REQ001_01: Should display newsletter signup form when user visits homepage', async ({ page }) => {
    const homePage = new HomePage(page);

    await expect(homePage.newsletterSignupForm.root).toBeVisible();
  });

  test('TC_REQ001_02: Should keep newsletter signup form visible when page is refreshed', async ({ page }) => {
    const homePage = new HomePage(page);

    await page.reload();

    await expect(homePage.newsletterSignupForm.root).toBeVisible();
  });

  test('TC_REQ001_03: Should show newsletter signup form after navigating away and back to homepage', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigateAway(testData.newsletter.navigationAwayPath);
    await page.goBack();

    await expect(homePage.newsletterSignupForm.root).toBeVisible();
  });

  test('TC_REQ002_01: Should have exactly one email input and one submit button when form is displayed', async ({ page }) => {
    const homePage = new HomePage(page);
    const form = homePage.newsletterSignupForm;

    await expect(form.root).toBeVisible();

    await expect(form.emailInput).toBeVisible();
    await expect(form.submitButton).toBeVisible();

    await expect(await form.getEmailInputCount()).toBe(1);
    await expect(await form.getSubmitControlCount()).toBe(1);
  });

  test('TC_REQ002_02: Should not require additional fields beyond email when submitting the form', async ({ page }) => {
    const homePage = new HomePage(page);
    const form = homePage.newsletterSignupForm;

    await expect(form.root).toBeVisible();

    // Basic structural checks for "email-only" form.
    // Exclude hidden inputs and submit/button controls.
    const unexpectedInputs = form.root.locator(
      'input:not([type="hidden"]):not([type="email"]):not([type="submit"]):not([type="button"]), textarea, select'
    );

    await expect(unexpectedInputs).toHaveCount(0);
  });

  test('TC_REQ002_03: Should keep exactly one email input and one submit after multiple reloads', async ({ page }) => {
    const homePage = new HomePage(page);
    const form = homePage.newsletterSignupForm;

    for (let i = 0; i < 5; i += 1) {
      await page.reload();
    }

    await expect(form.root).toBeVisible();
    await expect(await form.getEmailInputCount()).toBe(1);
    await expect(await form.getSubmitControlCount()).toBe(1);
  });
});