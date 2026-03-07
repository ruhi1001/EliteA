import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ReAuthDialog } from '../pages/ReAuthDialog';
import { testData } from '../utils/testData';

test.describe('User Profile Update', () => {
  test(
    'TC_REQ001_02: Should deny access to profile page when user is unauthenticated',
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      const profilePage = new ProfilePage(page);

      await profilePage.goto(testData.urls.profilePath);

      await page.waitForURL(new RegExp(testData.urls.loginPath.replace('/', '\\/'), 'i'));
      await expect(loginPage.emailInput).toBeVisible();
    }
  );

  test.describe('Authenticated user', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      const profilePage = new ProfilePage(page);

      await loginPage.goto(testData.urls.loginPath);
      await loginPage.login(testData.users.registered.email, testData.users.registered.password);

      // Navigate explicitly to profile to keep the suite resilient to post-login landing pages.
      await profilePage.goto(testData.urls.profilePath);
      await expect(profilePage.heading).toBeVisible();
    });

    test(
      'TC_REQ001_01: Should persist valid profile changes when saved and after refresh',
      async ({ page }) => {
        const profilePage = new ProfilePage(page);

        const original = await profilePage.readValues();

        await profilePage
          .fillFullName(testData.profile.valid.fullName)
          .fillAddress(testData.profile.valid.address)
          .clickSave();

        // Wait for either a success status or an error alert.
        await expect(profilePage.successBanner.or(profilePage.errorBanner)).toBeVisible();
        await expect(profilePage.errorBanner).toBeHidden();

        await page.reload();
        await expect(profilePage.heading).toBeVisible();

        const afterReload = await profilePage.readValues();
        expect(afterReload.fullName).toBe(testData.profile.valid.fullName);
        expect(afterReload.address).toBe(testData.profile.valid.address);

        // Guard: ensure we actually changed something (helps detect AUT pre-seeded same data).
        if (original.fullName === afterReload.fullName && original.address === afterReload.address) {
          test.info().annotations.push({
            type: 'note',
            description:
              'Profile values after save match the original values; verify environment has editable profile data.'
          });
        }
      }
    );

    test(
      'TC_REQ001_03: Should show error and not persist changes when profile update fails server-side',
      async ({ page }) => {
        const profilePage = new ProfilePage(page);

        const original = await profilePage.readValues();

        await page.route(testData.profile.updateApiUrlPattern, async (route, request) => {
          const method = request.method().toUpperCase();
          if (['POST', 'PUT', 'PATCH'].includes(method)) {
            await route.fulfill({
              status: 500,
              contentType: 'application/json',
              body: JSON.stringify({ message: 'Injected failure from Playwright route stub.' })
            });
            return;
          }
          await route.continue();
        });

        await profilePage
          .fillFullName(testData.profile.valid.fullName)
          .fillAddress(testData.profile.valid.address)
          .clickSave();

        await expect(profilePage.errorBanner).toBeVisible();

        // Restore network behavior and verify no partial persistence.
        await page.unroute(testData.profile.updateApiUrlPattern);

        await page.reload();
        await expect(profilePage.heading).toBeVisible();

        const afterReload = await profilePage.readValues();
        expect(afterReload.fullName).toBe(original.fullName);
        expect(afterReload.address).toBe(original.address);
      }
    );

    test(
      'TC_REQ002_01: Should require re-authentication when changing email and save on success',
      async ({ page }) => {
        const profilePage = new ProfilePage(page);
        const reAuthDialog = new ReAuthDialog(page);

        await profilePage.fillEmail(testData.profile.emails.newEmail1).clickSave();

        await expect(reAuthDialog.dialog).toBeVisible();
        await reAuthDialog.complete(testData.users.registered.password);

        await expect(reAuthDialog.dialog).toBeHidden();

        await page.reload();
        await expect(profilePage.heading).toBeVisible();

        const afterReload = await profilePage.readValues();
        expect(afterReload.email).toBe(testData.profile.emails.newEmail1);
      }
    );

    test(
      'TC_REQ002_02: Should not save email change when re-authentication is canceled',
      async ({ page }) => {
        const profilePage = new ProfilePage(page);
        const reAuthDialog = new ReAuthDialog(page);

        const original = await profilePage.readValues();

        await profilePage.fillEmail(testData.profile.emails.newEmail2).clickSave();

        await expect(reAuthDialog.dialog).toBeVisible();
        await reAuthDialog.cancel();

        await expect(reAuthDialog.dialog).toBeHidden();

        await page.reload();
        await expect(profilePage.heading).toBeVisible();

        const afterReload = await profilePage.readValues();
        expect(afterReload.email).toBe(original.email);
      }
    );

    test(
      'TC_REQ002_03: Should persist email and other fields atomically only after successful re-authentication',
      async ({ page }) => {
        const profilePage = new ProfilePage(page);
        const reAuthDialog = new ReAuthDialog(page);

        await profilePage
          .fillEmail(testData.profile.emails.newEmail1)
          .fillAddress(testData.profile.valid.address)
          .clickSave();

        await expect(reAuthDialog.dialog).toBeVisible();
        await reAuthDialog.complete(testData.users.registered.password);

        await expect(reAuthDialog.dialog).toBeHidden();

        await page.reload();
        await expect(profilePage.heading).toBeVisible();

        const afterReload = await profilePage.readValues();
        expect(afterReload.email).toBe(testData.profile.emails.newEmail1);
        expect(afterReload.address).toBe(testData.profile.valid.address);
      }
    );
  });
});
