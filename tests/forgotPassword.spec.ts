import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { testData } from '../utils/testData';

test.describe('Password Reset Request (Forgot Password)', () => {
  test.beforeEach(async ({ page }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto(testData.urls.forgotPasswordPath);
  });

  test(
    'TC_REQ001_01: Should show confirmation when registered email is submitted and reset link is issued',
    async ({ page }) => {
      const forgotPasswordPage = new ForgotPasswordPage(page);

      await forgotPasswordPage.requestPasswordReset(testData.users.registered.email);

      await expect(forgotPasswordPage.confirmationMessage).toBeVisible();
      await expect(forgotPasswordPage.confirmationMessage).toContainText(
        testData.messages.forgotPasswordConfirmation
      );

      // Optional: validate reset link (depends on mailbox integration / env-provided link)
      const resetLink =
        testData.getResetLinkForTest('TC_REQ001_01') || testData.resetLinks.fresh;

      if (resetLink) {
        const resetPasswordPage = new ResetPasswordPage(page);
        await resetPasswordPage.goto(resetLink);
        await expect(resetPasswordPage.formHeading).toBeVisible();
      } else {
        test.info().annotations.push({
          type: 'todo',
          description:
            'Provide RESET_LINK_TC_REQ001_01 (or RESET_LINK_FRESH) to fully validate email-delivered reset link.'
        });
      }
    }
  );

  test(
    'TC_REQ001_02: Should show generic confirmation when unregistered email is submitted (no account enumeration)',
    async ({ page }) => {
      const forgotPasswordPage = new ForgotPasswordPage(page);

      await forgotPasswordPage.requestPasswordReset(testData.users.unregistered.email);

      await expect(forgotPasswordPage.confirmationMessage).toBeVisible();
      await expect(forgotPasswordPage.confirmationMessage).toContainText(
        testData.messages.forgotPasswordConfirmation
      );
    }
  );

  test(
    'TC_REQ001_04: Should trim leading/trailing spaces in email input and still show confirmation',
    async ({ page }) => {
      const forgotPasswordPage = new ForgotPasswordPage(page);
      const emailWithSpaces = `  ${testData.users.registered.email}  `;

      await forgotPasswordPage.requestPasswordReset(emailWithSpaces);

      await expect(forgotPasswordPage.confirmationMessage).toBeVisible();
      await expect(forgotPasswordPage.confirmationMessage).toContainText(
        testData.messages.forgotPasswordConfirmation
      );

      // Optional: validate reset link (depends on mailbox integration / env-provided link)
      const resetLink =
        testData.getResetLinkForTest('TC_REQ001_04') || testData.resetLinks.fresh;

      if (resetLink) {
        const resetPasswordPage = new ResetPasswordPage(page);
        await resetPasswordPage.goto(resetLink);
        await expect(resetPasswordPage.formHeading).toBeVisible();
      } else {
        test.info().annotations.push({
          type: 'todo',
          description:
            'Provide RESET_LINK_TC_REQ001_04 (or RESET_LINK_FRESH) to validate the link issued by the trimmed-email request.'
        });
      }
    }
  );
});
