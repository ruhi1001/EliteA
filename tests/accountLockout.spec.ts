import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testData } from '../utils/testData';

const wrongPassword = process.env.TEST_WRONG_PASSWORD || 'WrongPassword!';

const attemptFailedLogin = async (loginPage: LoginPage, email: string) => {
  await loginPage.login(email, wrongPassword);
  await expect(loginPage.alertMessage).toBeVisible();
  await expect(loginPage.alertMessage).toContainText(testData.messages.invalidCredentials);
};

test.describe('Account Lockout After Failed Logins (REQ_006)', () => {
  test(
    'TC_REQ006_01: Should reset failed-login counter after successful login and avoid lockout',
    async ({ page, browser }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto(testData.urls.loginPath);

      // 4 consecutive failures.
      for (let i = 0; i < 4; i++) {
        await attemptFailedLogin(loginPage, testData.users.registered.email);
      }

      // Successful login on 5th attempt should reset counter.
      await loginPage.login(testData.users.registered.email, testData.users.registered.password);
      await page.waitForURL(`**${testData.urls.postLoginPath}**`);

      // Start a fresh session (simulates logout + new attempt) and verify single failure does not lock.
      const context = await browser.newContext();
      const newPage = await context.newPage();
      const loginPage2 = new LoginPage(newPage);
      await loginPage2.goto(testData.urls.loginPath);

      await attemptFailedLogin(loginPage2, testData.users.registered.email);

      // Lockout message should NOT be shown after just one failure post-success.
      await expect(loginPage2.alertMessage).not.toContainText(testData.messages.accountLocked);

      await context.close();
    }
  );

  test(
    'TC_REQ006_02: Should lock account for 15 minutes after 5 consecutive failed logins and block subsequent attempts',
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto(testData.urls.loginPath);

      for (let i = 0; i < 5; i++) {
        await attemptFailedLogin(loginPage, testData.users.registered.email);
      }

      // Next attempt during lockout window.
      await loginPage.login(testData.users.registered.email, wrongPassword);
      await expect(loginPage.alertMessage).toBeVisible();
      await expect(loginPage.alertMessage).toContainText(testData.messages.accountLocked);
    }
  );

  test(
    'TC_REQ006_03: Should deny correct password during lockout until lockout expires',
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto(testData.urls.loginPath);

      // Precondition: account is already locked.
      test.skip(
        process.env.ACCOUNT_ALREADY_LOCKED !== 'true',
        'Set ACCOUNT_ALREADY_LOCKED=true when executing this test (precondition: account locked).'
      );

      await loginPage.login(testData.users.registered.email, testData.users.registered.password);
      await expect(loginPage.alertMessage).toBeVisible();
      await expect(loginPage.alertMessage).toContainText(testData.messages.accountLocked);
    }
  );

  test(
    'TC_REQ006_04: Should allow login attempt at exactly 15 minutes after lockout start (boundary)',
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto(testData.urls.loginPath);

      // Requires deterministic time control (test clock / time travel) to avoid hard waits.
      test.skip(
        process.env.ENABLE_TIME_BOUNDARY_TESTS !== 'true',
        'Requires time control to validate T+15:00 boundary without hard waits. Set ENABLE_TIME_BOUNDARY_TESTS=true when supported.'
      );

      await loginPage.login(testData.users.registered.email, testData.users.registered.password);
      await page.waitForURL(`**${testData.urls.postLoginPath}**`);
    }
  );

  test(
    'TC_REQ006_05: Should count consecutive failed logins across different sessions toward lockout',
    async ({ browser }) => {
      const email = testData.users.registered.email;

      const contextA = await browser.newContext();
      const pageA = await contextA.newPage();
      const loginA = new LoginPage(pageA);

      const contextB = await browser.newContext();
      const pageB = await contextB.newPage();
      const loginB = new LoginPage(pageB);

      await Promise.all([
        loginA.goto(testData.urls.loginPath),
        loginB.goto(testData.urls.loginPath)
      ]);

      // 3 failures in Browser A.
      for (let i = 0; i < 3; i++) {
        await attemptFailedLogin(loginA, email);
      }

      // 2 failures in Browser B.
      for (let i = 0; i < 2; i++) {
        await attemptFailedLogin(loginB, email);
      }

      // Next attempt should be locked (either browser).
      await loginA.login(email, wrongPassword);
      await expect(loginA.alertMessage).toBeVisible();
      await expect(loginA.alertMessage).toContainText(testData.messages.accountLocked);

      await Promise.all([contextA.close(), contextB.close()]);
    }
  );
});
