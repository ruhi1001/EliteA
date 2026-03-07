import { test, expect } from '@playwright/test';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { testData } from '../utils/testData';

const getLinkOrSkip = (testId: string): string => {
  const link = testData.getResetLinkForTest(testId);
  test.skip(!link, `Missing env var RESET_LINK_${testId} to execute this test.`);
  return link;
};

test.describe('Password Reset Form (REQ_003 / REQ_004 / REQ_005)', () => {
  test(
    'TC_REQ003_01: Should invalidate token after successful reset and reject reopening same link',
    async ({ page }) => {
      const resetLink = getLinkOrSkip('TC_REQ003_01');

      const resetPasswordPage = new ResetPasswordPage(page);
      await resetPasswordPage.goto(resetLink);
      await expect(resetPasswordPage.formHeading).toBeVisible();

      const newPassword =
        testData.passwordHistory.newNotInHistory || testData.passwords.validComplex;

      if (!testData.passwordHistory.newNotInHistory) {
        test.info().annotations.push({
          type: 'todo',
          description:
            'Provide TEST_PASSWORD_NEW_NOT_IN_HISTORY to ensure the token invalidation test does not conflict with password history constraints (REQ_005).'
        });
      }

      await resetPasswordPage.fillPasswords(newPassword, newPassword);
      await resetPasswordPage.submit();

      const message = resetPasswordPage.alertMessage.or(resetPasswordPage.successMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(testData.messages.passwordResetSuccess);

      // Re-open the same link after successful reset.
      await resetPasswordPage.goto(resetLink);

      await expect(resetPasswordPage.formHeading).not.toBeVisible();
      await expect(resetPasswordPage.alertMessage).toBeVisible();
      await expect(resetPasswordPage.alertMessage).toContainText(
        testData.messages.resetTokenInvalid
      );
    }
  );

  test(
    'TC_REQ003_02: Should reject already-used token and not allow another reset submission',
    async ({ page }) => {
      const usedLink = getLinkOrSkip('TC_REQ003_02');

      const resetPasswordPage = new ResetPasswordPage(page);
      await resetPasswordPage.goto(usedLink);

      await expect(resetPasswordPage.formHeading).not.toBeVisible();
      await expect(resetPasswordPage.alertMessage).toBeVisible();
      await expect(resetPasswordPage.alertMessage).toContainText(
        testData.messages.resetTokenInvalid
      );

      // If the AUT still renders inputs, ensure submission doesn't succeed.
      if (await resetPasswordPage.newPasswordInput.isVisible()) {
        await resetPasswordPage.fillPasswords(
          testData.passwords.validComplex,
          testData.passwords.validComplex
        );
        await resetPasswordPage.submit();

        await expect(resetPasswordPage.alertMessage).toBeVisible();
        await expect(resetPasswordPage.alertMessage).toContainText(
          testData.messages.resetTokenInvalid
        );
      }
    }
  );

  test(
    'TC_REQ003_03: Should allow only the first of two nearly-simultaneous reset attempts with the same token',
    async ({ browser }) => {
      const link = getLinkOrSkip('TC_REQ003_03');

      const contextA = await browser.newContext();
      const pageA = await contextA.newPage();
      const resetA = new ResetPasswordPage(pageA);

      const contextB = await browser.newContext();
      const pageB = await contextB.newPage();
      const resetB = new ResetPasswordPage(pageB);

      await Promise.all([resetA.goto(link), resetB.goto(link)]);
      await Promise.all([
        expect(resetA.formHeading).toBeVisible(),
        expect(resetB.formHeading).toBeVisible()
      ]);

      // Two different compliant passwords.
      const pwdA = process.env.TC_REQ003_03_PASSWORD_A || 'Abcdef1G';
      const pwdB = process.env.TC_REQ003_03_PASSWORD_B || 'Xyzabc2H';

      await Promise.all([
        resetA.fillPasswords(pwdA, pwdA),
        resetB.fillPasswords(pwdB, pwdB)
      ]);

      await Promise.all([resetA.submit(), resetB.submit()]);

      const msgA = resetA.alertMessage.or(resetA.successMessage);
      const msgB = resetB.alertMessage.or(resetB.successMessage);

      await Promise.all([expect(msgA).toBeVisible(), expect(msgB).toBeVisible()]);

      const textA = (await msgA.textContent()) || '';
      const textB = (await msgB.textContent()) || '';

      const aSucceeded = textA.includes(testData.messages.passwordResetSuccess);
      const bSucceeded = textB.includes(testData.messages.passwordResetSuccess);

      // Only one should succeed.
      expect(aSucceeded || bSucceeded).toBeTruthy();
      expect(aSucceeded && bSucceeded).toBeFalsy();

      // The other should be rejected as already used/invalid.
      if (!aSucceeded) {
        expect(textA).toContain(testData.messages.resetTokenInvalid);
      }
      if (!bSucceeded) {
        expect(textB).toContain(testData.messages.resetTokenInvalid);
      }

      await Promise.all([contextA.close(), contextB.close()]);
    }
  );

  test(
    'TC_REQ004_01: Should accept password meeting complexity requirements (8 chars, uppercase, digit)',
    async ({ page }) => {
      const link = getLinkOrSkip('TC_REQ004_01');
      const resetPasswordPage = new ResetPasswordPage(page);

      await resetPasswordPage.goto(link);
      await expect(resetPasswordPage.formHeading).toBeVisible();

      await resetPasswordPage.fillPasswords(
        testData.passwords.validComplex,
        testData.passwords.validComplex
      );
      await resetPasswordPage.submit();

      const message = resetPasswordPage.alertMessage.or(resetPasswordPage.successMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(testData.messages.passwordResetSuccess);
    }
  );

  test(
    'TC_REQ004_02: Should reject password shorter than 8 characters with validation error',
    async ({ page }) => {
      const link = getLinkOrSkip('TC_REQ004_02');
      const resetPasswordPage = new ResetPasswordPage(page);

      await resetPasswordPage.goto(link);
      await expect(resetPasswordPage.formHeading).toBeVisible();

      await resetPasswordPage.fillPasswords(testData.passwords.tooShort, testData.passwords.tooShort);
      await resetPasswordPage.submit();

      const message = resetPasswordPage.alertMessage.or(resetPasswordPage.validationMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(testData.messages.passwordMinLength);
    }
  );

  test(
    'TC_REQ004_03: Should reject password missing uppercase letter with validation error',
    async ({ page }) => {
      const link = getLinkOrSkip('TC_REQ004_03');
      const resetPasswordPage = new ResetPasswordPage(page);

      await resetPasswordPage.goto(link);
      await expect(resetPasswordPage.formHeading).toBeVisible();

      await resetPasswordPage.fillPasswords(
        testData.passwords.noUppercase,
        testData.passwords.noUppercase
      );
      await resetPasswordPage.submit();

      const message = resetPasswordPage.alertMessage.or(resetPasswordPage.validationMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(testData.messages.passwordMissingUppercase);
    }
  );

  test(
    'TC_REQ004_04: Should reject password missing numeric digit with validation error',
    async ({ page }) => {
      const link = getLinkOrSkip('TC_REQ004_04');
      const resetPasswordPage = new ResetPasswordPage(page);

      await resetPasswordPage.goto(link);
      await expect(resetPasswordPage.formHeading).toBeVisible();

      await resetPasswordPage.fillPasswords(testData.passwords.noDigit, testData.passwords.noDigit);
      await resetPasswordPage.submit();

      const message = resetPasswordPage.alertMessage.or(resetPasswordPage.validationMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(testData.messages.passwordMissingDigit);
    }
  );

  test(
    'TC_REQ005_01: Should accept new password not matching any of last 3 passwords',
    async ({ page }) => {
      test.skip(
        !testData.capabilities.hasPasswordHistoryFixtures,
        'Missing TEST_PASSWORD_NEW_NOT_IN_HISTORY to validate REQ_005 password-history acceptance.'
      );

      const link = getLinkOrSkip('TC_REQ005_01');
      const resetPasswordPage = new ResetPasswordPage(page);

      await resetPasswordPage.goto(link);
      await expect(resetPasswordPage.formHeading).toBeVisible();

      const pwd = testData.passwordHistory.newNotInHistory;
      await resetPasswordPage.fillPasswords(pwd, pwd);
      await resetPasswordPage.submit();

      const message = resetPasswordPage.alertMessage.or(resetPasswordPage.successMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(testData.messages.passwordResetSuccess);
    }
  );

  test(
    'TC_REQ005_02: Should reject password matching one of last 3 passwords with clear validation error',
    async ({ page }) => {
      test.skip(
        !testData.passwordHistory.last1,
        'Missing TEST_PASSWORD_HISTORY_1 to validate password reuse rejection.'
      );

      const link = getLinkOrSkip('TC_REQ005_02');
      const resetPasswordPage = new ResetPasswordPage(page);

      await resetPasswordPage.goto(link);
      await expect(resetPasswordPage.formHeading).toBeVisible();

      const pwd = testData.passwordHistory.last1;
      await resetPasswordPage.fillPasswords(pwd, pwd);
      await resetPasswordPage.submit();

      const message = resetPasswordPage.alertMessage.or(resetPasswordPage.validationMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(testData.messages.passwordReuseNotAllowed);
    }
  );

  test(
    'TC_REQ005_03: Should reject reuse when fewer than 3 prior passwords exist (history check applies up to 3)',
    async ({ page }) => {
      test.skip(
        !testData.passwordHistory.last1,
        'Missing TEST_PASSWORD_HISTORY_1 to validate password reuse rejection for users with <3 history.'
      );

      const link = getLinkOrSkip('TC_REQ005_03');
      const resetPasswordPage = new ResetPasswordPage(page);

      await resetPasswordPage.goto(link);
      await expect(resetPasswordPage.formHeading).toBeVisible();

      const pwd = testData.passwordHistory.last1;
      await resetPasswordPage.fillPasswords(pwd, pwd);
      await resetPasswordPage.submit();

      const message = resetPasswordPage.alertMessage.or(resetPasswordPage.validationMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(testData.messages.passwordReuseNotAllowed);
    }
  );

  test(
    'TC_REQ005_04: Should reject attempt to set password equal to most recent password (current) during reset',
    async ({ page }) => {
      test.skip(
        !testData.passwordHistory.last1,
        'Missing TEST_PASSWORD_HISTORY_1 (most recent password) to validate password reuse rejection.'
      );

      const link = getLinkOrSkip('TC_REQ005_04');
      const resetPasswordPage = new ResetPasswordPage(page);

      await resetPasswordPage.goto(link);
      await expect(resetPasswordPage.formHeading).toBeVisible();

      const pwd = testData.passwordHistory.last1;
      await resetPasswordPage.fillPasswords(pwd, pwd);
      await resetPasswordPage.submit();

      const message = resetPasswordPage.alertMessage.or(resetPasswordPage.validationMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(testData.messages.passwordReuseNotAllowed);
    }
  );
});
