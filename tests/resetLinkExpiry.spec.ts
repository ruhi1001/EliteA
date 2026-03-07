import { test, expect, Page } from '@playwright/test';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { testData } from '../utils/testData';

const getLinkOrSkip = (testId: string): string => {
  const link = testData.getResetLinkForTest(testId);
  test.skip(!link, `Missing env var RESET_LINK_${testId} to execute this test.`);
  return link;
};

const createPageWithClientTimeOffsetMs = async (
  browser: any,
  offsetMs: number
): Promise<Page> => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Simulate client clock drift (server-side should still enforce expiry).
  await page.addInitScript((ms: number) => {
    const OriginalDate = Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Date = class extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(OriginalDate.now() + ms);
        } else {
          // @ts-ignore
          super(...args);
        }
      }

      static now() {
        return OriginalDate.now() + ms;
      }
    };
  }, offsetMs);

  return page;
};

test.describe('Password Reset Link Expiry (REQ_002)', () => {
  test(
    'TC_REQ002_01: Should display reset form when reset link is opened within 15 minutes',
    async ({ page }) => {
      const resetLink = getLinkOrSkip('TC_REQ002_01');

      const resetPasswordPage = new ResetPasswordPage(page);
      await resetPasswordPage.goto(resetLink);

      await expect(resetPasswordPage.formHeading).toBeVisible();
      await expect(resetPasswordPage.submitButton).toBeVisible();
    }
  );

  test(
    'TC_REQ002_02: Should reject reset link opened at exactly T+15:00 as expired (boundary)',
    async ({ page }) => {
      const resetLink = getLinkOrSkip('TC_REQ002_02');

      const resetPasswordPage = new ResetPasswordPage(page);
      await resetPasswordPage.goto(resetLink);

      await expect(resetPasswordPage.formHeading).not.toBeVisible();
      await expect(resetPasswordPage.alertMessage).toBeVisible();
      await expect(resetPasswordPage.alertMessage).toContainText(
        testData.messages.resetLinkExpired
      );
    }
  );

  test(
    'TC_REQ002_03: Should reject reset link opened after 15 minutes and block reset submission',
    async ({ page }) => {
      const resetLink = getLinkOrSkip('TC_REQ002_03');

      const resetPasswordPage = new ResetPasswordPage(page);
      await resetPasswordPage.goto(resetLink);

      await expect(resetPasswordPage.formHeading).not.toBeVisible();
      await expect(resetPasswordPage.alertMessage).toBeVisible();

      // Exact copy is pending PO confirmation (OQ_005). Default expectation is env-overridable.
      await expect(resetPasswordPage.alertMessage).toContainText(
        testData.messages.resetLinkExpired
      );

      await expect(resetPasswordPage.submitButton).not.toBeVisible();
    }
  );

  test(
    'TC_REQ002_04: Should enforce link expiry using server-side issuance time (not client device clock)',
    async ({ browser }) => {
      const freshLink = getLinkOrSkip('TC_REQ002_01');
      const expiredLink = getLinkOrSkip('TC_REQ002_03');

      // Client clock moved forward; link should still be accepted within server-side window.
      const pageForward = await createPageWithClientTimeOffsetMs(browser, 10 * 60 * 1000);
      const resetForward = new ResetPasswordPage(pageForward);
      await resetForward.goto(freshLink);
      await expect(resetForward.formHeading).toBeVisible();
      await pageForward.context().close();

      // Client clock moved backward; expired link should still be rejected by server.
      const pageBackward = await createPageWithClientTimeOffsetMs(browser, -10 * 60 * 1000);
      const resetBackward = new ResetPasswordPage(pageBackward);
      await resetBackward.goto(expiredLink);
      await expect(resetBackward.formHeading).not.toBeVisible();
      await expect(resetBackward.alertMessage).toBeVisible();
      await expect(resetBackward.alertMessage).toContainText(
        testData.messages.resetLinkExpired
      );
      await pageBackward.context().close();
    }
  );
});
