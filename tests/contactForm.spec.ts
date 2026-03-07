import { test, expect, Locator } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage';
import { testData } from '../utils/testData';

const isInvalid = async (locator: Locator): Promise<boolean> => {
  return locator.evaluate((el) => (el as HTMLElement).matches(':invalid'));
};

const waitForSubmitRequestOrNull = async (
  page: Parameters<Parameters<typeof test>[0]>[0]['page'],
  timeoutMs: number
) => {
  return page
    .waitForRequest(
      (req) =>
        req.url().includes('contact') && ['POST', 'PUT'].includes(req.method().toUpperCase()),
      { timeout: timeoutMs }
    )
    .catch(() => null);
};

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto(testData.contact.contactPath);
  });

  test(
    'TC_REQ001_01: Should display Contact Us form when user navigates to Contact page',
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      await expect(contactPage.heading).toBeVisible();
      await expect(contactPage.form).toBeVisible();
    }
  );

  test(
    'TC_REQ001_02: Should not show Contact Us form when user is on a non-contact route',
    async ({ page }) => {
      await page.goto(testData.contact.homePath);

      // Use an explicit heading check to avoid false positives if other pages contain forms.
      await expect(page.getByRole('heading', { name: /contact us/i })).toHaveCount(0);
      await expect(page.getByLabel(/message/i)).toHaveCount(0);
    }
  );

  test(
    'TC_REQ001_03: Should show user-visible error state when Contact form load fails server-side',
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      let intercepted = false;
      await page.route(testData.contact.loadApiUrlPattern, async (route, request) => {
        if (request.method().toUpperCase() === 'GET') {
          intercepted = true;
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Injected load failure from Playwright route stub.' })
          });
          return;
        }
        await route.continue();
      });

      await contactPage.goto(testData.contact.contactPath);

      // Some AUTs render the form fully client-side with no load call; skip if we cannot intercept.
      test.skip(
        !intercepted,
        'CONTACT_LOAD_API_URL_PATTERN did not match any GET request. Update env var to enable this test.'
      );

      await expect(contactPage.errorBanner).toBeVisible();
      await expect(contactPage.errorBanner).toContainText(testData.messages.contactLoadError);

      await expect(contactPage.nameInput).not.toBeVisible();
      await expect(contactPage.emailInput).not.toBeVisible();
      await expect(contactPage.messageInput).not.toBeVisible();
    }
  );

  test(
    'TC_REQ002_01: Should render Name, Email, and Message inputs when Contact form is displayed',