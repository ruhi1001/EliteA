import { test, expect, Locator, Page } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage';
import { testData } from '../utils/testData';

const isInvalid = async (locator: Locator): Promise<boolean> => {
  return locator.evaluate((el) => (el as HTMLElement).matches(':invalid'));
};

const waitForSubmitRequestOrNull = async (page: Page, timeoutMs: number) => {
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
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      await expect(contactPage.nameInput).toBeVisible();
      await expect(contactPage.emailInput).toBeVisible();
      await expect(contactPage.messageInput).toBeVisible();
      await expect(contactPage.submitButton).toBeVisible();
    }
  );

  test(
    'TC_REQ002_02: Should not require any mandatory fields beyond Name, Email, and Message',
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      // Heuristic: required fields are typically annotated with required / aria-required.
      const requiredFields = contactPage.form.locator(
        'input[required], textarea[required], select[required], [aria-required="true"]'
      );

      const count = await requiredFields.count();
      expect(count).toBeLessThanOrEqual(3);

      // Guard: ensure the three required inputs exist.
      await expect(contactPage.nameInput).toBeVisible();
      await expect(contactPage.emailInput).toBeVisible();
      await expect(contactPage.messageInput).toBeVisible();
    }
  );

  test(
    'TC_REQ002_03: Should keep exactly Name, Email, and Message fields after reloading Contact page',
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      await expect(contactPage.nameInput).toBeVisible();
      await expect(contactPage.emailInput).toBeVisible();
      await expect(contactPage.messageInput).toBeVisible();

      await page.reload();

      await expect(contactPage.nameInput).toBeVisible();
      await expect(contactPage.emailInput).toBeVisible();
      await expect(contactPage.messageInput).toBeVisible();

      const visibleFields = contactPage.form.locator('input:visible, textarea:visible, select:visible');
      await expect(visibleFields).toHaveCount(3);
    }
  );

  test(
    'TC_REQ003_01: Should accept submission for processing when all required fields are populated',
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      let intercepted = false;
      await page.route(testData.contact.submitApiUrlPattern, async (route, request) => {
        if (['POST', 'PUT'].includes(request.method().toUpperCase())) {
          intercepted = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ok: true })
          });
          return;
        }
        await route.continue();
      });

      await contactPage.fillForm(testData.contact.valid).submit();

      test.skip(
        !intercepted,
        'CONTACT_SUBMIT_API_URL_PATTERN did not match any submit request. Update env var to enable backend stubbing.'
      );

      // If the AUT uses HTML5 validation, the fields must be valid here.
      expect(await isInvalid(contactPage.nameInput)).toBe(false);
      expect(await isInvalid(contactPage.emailInput)).toBe(false);
      expect(await isInvalid(contactPage.messageInput)).toBe(false);
    }
  );

  test(
    'TC_REQ003_02: Should block submission when any required field is empty (Name/Email/Message)',
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      // Attempt 1: empty Name
      await contactPage
        .fillName('')
        .fillEmail(testData.contact.valid.email)
        .fillMessage(testData.contact.valid.message)
        .submit();

      const req1 = await waitForSubmitRequestOrNull(page, 2000);
      expect(req1).toBeNull();
      expect(await isInvalid(contactPage.nameInput)).toBe(true);

      await page.reload();

      // Attempt 2: empty Email
      await contactPage
        .fillName(testData.contact.valid.name)
        .fillEmail('')
        .fillMessage(testData.contact.valid.message)
        .submit();

      const req2 = await waitForSubmitRequestOrNull(page, 2000);
      expect(req2).toBeNull();
      expect(await isInvalid(contactPage.emailInput)).toBe(true);

      await page.reload();

      // Attempt 3: empty Message
      await contactPage
        .fillName(testData.contact.valid.name)
        .fillEmail(testData.contact.valid.email)
        .fillMessage('')
        .submit();

      const req3 = await waitForSubmitRequestOrNull(page, 2000);
      expect(req3).toBeNull();
      expect(await isInvalid(contactPage.messageInput)).toBe(true);
    }
  );

  test(
    'TC_REQ003_03: Should treat whitespace-only values as empty and block submission',
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      // Attempt 1: whitespace Name
      await contactPage
        .fillName(testData.contact.whitespaceOnly)
        .fillEmail(testData.contact.valid.email)
        .fillMessage(testData.contact.valid.message)
        .submit();

      const req1 = await waitForSubmitRequestOrNull(page, 2000);
      expect(req1).toBeNull();

      await page.reload();

      // Attempt 2: whitespace Email
      await contactPage
        .fillName(testData.contact.valid.name)
        .fillEmail(testData.contact.whitespaceOnly)
        .fillMessage(testData.contact.valid.message)
        .submit();

      const req2 = await waitForSubmitRequestOrNull(page, 2000);
      expect(req2).toBeNull();

      await page.reload();

      // Attempt 3: whitespace Message
      await contactPage
        .fillName(testData.contact.valid.name)
        .fillEmail(testData.contact.valid.email)
        .fillMessage(testData.contact.whitespaceOnly)
        .submit();

      const req3 = await waitForSubmitRequestOrNull(page, 2000);
      expect(req3).toBeNull();
    }
  );

  test(
    'TC_REQ004_01: Should display exact success message when Contact form is processed successfully',
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      let intercepted = false;
      await page.route(testData.contact.submitApiUrlPattern, async (route, request) => {
        if (['POST', 'PUT'].includes(request.method().toUpperCase())) {
          intercepted = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ok: true })
          });
          return;
        }
        await route.continue();
      });

      await contactPage.fillForm(testData.contact.valid).submit();

      test.skip(
        !intercepted,
        'CONTACT_SUBMIT_API_URL_PATTERN did not match any submit request. Update env var to enable this test.'
      );

      await expect(page.getByText(testData.messages.contactSuccess, { exact: true })).toBeVisible();
    }
  );

  test(
    'TC_REQ004_02: Should not display success message before successful submission',
    async ({ page }) => {
      await expect(page.getByText(testData.messages.contactSuccess, { exact: true })).toHaveCount(0);
    }
  );

  test(
    'TC_REQ004_03: Should not display success message when Contact form processing fails server-side',
    async ({ page }) => {
      const contactPage = new ContactPage(page);

      let intercepted = false;
      await page.route(testData.contact.submitApiUrlPattern, async (route, request) => {
        if (['POST', 'PUT'].includes(request.method().toUpperCase())) {
          intercepted = true;
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Injected submit failure from Playwright route stub.' })
          });
          return;
        }
        await route.continue();
      });

      await contactPage.fillForm(testData.contact.valid).submit();

      test.skip(
        !intercepted,
        'CONTACT_SUBMIT_API_URL_PATTERN did not match any submit request. Update env var to enable this test.'
      );

      await expect(page.getByText(testData.messages.contactSuccess, { exact: true })).toHaveCount(0);
      await expect(contactPage.errorBanner).toBeVisible();
      await expect(contactPage.errorBanner).toContainText(testData.messages.contactSubmitError);
    }
  );
});