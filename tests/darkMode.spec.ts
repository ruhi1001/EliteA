import { test, expect, Page } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SettingsPage } from '../pages/SettingsPage';
import { testData } from '../utils/testData';

type ThemeName = 'dark' | 'light' | 'unknown';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

const getPathname = (url: string): string => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

const readTheme = async (page: Page): Promise<ThemeName> => {
  const raw = await page.evaluate(() => {
    const el = document.documentElement;
    const body = document.body;

    return (
      el.getAttribute('data-theme') ||
      body?.getAttribute('data-theme') ||
      (el.classList.contains('dark') ? 'dark' : '') ||
      (el.classList.contains('light') ? 'light' : '') ||
      (body?.classList.contains('dark') ? 'dark' : '') ||
      (body?.classList.contains('light') ? 'light' : '') ||
      ''
    );
  });

  const value = (raw || '').toLowerCase();
  if (value.includes('dark')) return 'dark';
  if (value.includes('light')) return 'light';
  return 'unknown';
};

const ensureSettingsPage = async (page: Page): Promise<SettingsPage> => {
  const settingsPage = new SettingsPage(page);
  const loginPage = new LoginPage(page);

  await settingsPage.goto(testData.urls.settingsPath);
  await page.waitForLoadState('domcontentloaded');

  if (getPathname(page.url()).startsWith(testData.urls.loginPath)) {
    await loginPage.login(testData.users.registered.email, testData.users.registered.password);
    await page.waitForLoadState('domcontentloaded');
    await settingsPage.goto(testData.urls.settingsPath);
  }

  return settingsPage;
};

test.describe('Dark Mode', () => {
  test(
    'TC_REQ001_01: Should display Dark Mode toggle on Settings page after load',
    async ({ page }) => {
      const settingsPage = await ensureSettingsPage(page);

      await expect(settingsPage.heading).toBeVisible();
      await expect(settingsPage.darkModeToggle).toBeVisible();
    }
  );

  test(
    'TC_REQ001_02: Should not force redirect/prompt to Settings to choose theme when browsing other pages',
    async ({ page }) => {
      const homePage = new HomePage(page);
      const contactPage = new ContactPage(page);
      const loginPage = new LoginPage(page);

      await homePage.goto(testData.newsletter.homePath);
      expect(getPathname(page.url())).not.toContain(testData.urls.settingsPath);

      // Navigate across 3 screens/sections.
      await contactPage.goto(testData.contact.contactPath);
      expect(getPathname(page.url())).not.toContain(testData.urls.settingsPath);

      await loginPage.goto(testData.urls.loginPath);
      expect(getPathname(page.url())).not.toContain(testData.urls.settingsPath);

      // Non-blocking guard: no theme-selection modal should be shown.
      await expect(page.getByRole('dialog', { name: /theme|dark mode/i })).toHaveCount(0);
    }
  );

  test(
    'TC_REQ001_03: Should keep Dark Mode toggle present and functional after leaving and returning to Settings (same session)',
    async ({ page }) => {
      const homePage = new HomePage(page);
      const settingsPage = await ensureSettingsPage(page);

      await expect(settingsPage.darkModeToggle).toBeVisible();

      await homePage.goto(testData.newsletter.homePath);
      await settingsPage.goto(testData.urls.settingsPath);
      await expect(settingsPage.darkModeToggle).toBeVisible();

      const themeBefore = await readTheme(page);
      await settingsPage.toggleDarkMode();

      await expect.poll(() => readTheme(page)).not.toBe(themeBefore);

      const themeAfterFirstToggle = await readTheme(page);
      await settingsPage.toggleDarkMode();

      await expect.poll(() => readTheme(page)).toBe(themeBefore);
      expect(themeAfterFirstToggle).not.toBe('unknown');
    }
  );

  test(
    'TC_REQ001_04: Should handle invalid/tampered stored theme value without breaking Settings toggle rendering',
    async ({ page }) => {
      const dialogs: string[] = [];
      page.on('dialog', (d) => {
        dialogs.push(d.message());
        d.dismiss().catch(() => undefined);
      });

      await page.addInitScript(
        ({ key, value }) => {
          try {
            window.localStorage.setItem(key, value);
          } catch {
            // ignore
          }
        },
        { key: testData.darkMode.themeStorageKey, value: testData.darkMode.invalidStoredValue }
      );

      const settingsPage = await ensureSettingsPage(page);
      await expect(settingsPage.darkModeToggle).toBeVisible();

      // Toggle must remain usable even with corrupted stored value.
      await settingsPage.toggleDarkMode();
      await expect(settingsPage.darkModeToggle).toBeVisible();

      expect(dialogs).toHaveLength(0);
    }
  );

  test(
    'TC_REQ002_01: Should update current screen and global UI instantly when enabling Dark Mode (no restart)',
    async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto(testData.newsletter.homePath);

      const themeBefore = await readTheme(page);
      const settingsPage = await ensureSettingsPage(page);

      await settingsPage.setDarkModeEnabled(true);

      await page.goBack();
      await expect(homePage.mainRegion).toBeVisible();

      await expect.poll(() => readTheme(page)).toBe('dark');
      expect(themeBefore).not.toBe('dark');
    }
  );

  test(
    'TC_REQ002_02: Should not require full reload/restart when switching theme and should preserve transient UI state',
    async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto(testData.newsletter.homePath);
      await expect(homePage.newsletterSignupForm.root).toBeVisible();

      // Mark the SPA window; if a full reload occurs, this marker will be lost.
      await page.evaluate(() => {
        (window as any).__convoqaThemeMarker = 'marker-present';
      });

      await homePage.newsletterSignupForm.fillEmail(testData.newsletter.validEmail);
      await expect(homePage.newsletterSignupForm.emailInput).toHaveValue(testData.newsletter.validEmail);

      const settingsPage = await ensureSettingsPage(page);
      await settingsPage.toggleDarkMode();

      await page.goBack();
      await expect(homePage.mainRegion).toBeVisible();

      const marker = await page.evaluate(() => (window as any).__convoqaThemeMarker);
      expect(marker).toBe('marker-present');

      // Transient state (partially filled input) should remain.
      await expect(homePage.newsletterSignupForm.emailInput).toHaveValue(testData.newsletter.validEmail);
    }
  );

  test(
    'TC_REQ002_03: Should render subsequent screens in dark theme after enabling Dark Mode',
    async ({ page }) => {
      const settingsPage = await ensureSettingsPage(page);
      await settingsPage.setDarkModeEnabled(true);

      await expect.poll(() => readTheme(page)).toBe('dark');

      const homePage = new HomePage(page);
      const contactPage = new ContactPage(page);
      const loginPage = new LoginPage(page);

      await homePage.goto(testData.newsletter.homePath);
      expect(await readTheme(page)).toBe('dark');

      await contactPage.goto(testData.contact.contactPath);
      expect(await readTheme(page)).toBe('dark');

      await loginPage.goto(testData.urls.loginPath);
      expect(await readTheme(page)).toBe('dark');
    }
  );

  test(
    'TC_REQ002_04: Should keep last applied theme and avoid unreadable partial styling when dark theme assets fail to load',
    async ({ page }) => {
      test.skip(
        !testData.darkMode.assetBlockUrlPattern,
        'Missing env var DARK_MODE_ASSET_BLOCK_URL_PATTERN to simulate asset failure for this test.'
      );

      let intercepted = false;
      await page.route(testData.darkMode.assetBlockUrlPattern, async (route) => {
        intercepted = true;
        await route.fulfill({
          status: 404,
          contentType: 'text/plain',
          body: 'Blocked by Playwright to simulate dark theme asset failure.'
        });
      });

      const settingsPage = await ensureSettingsPage(page);
      await expect(settingsPage.darkModeToggle).toBeVisible();

      const themeBefore = await readTheme(page);
      await settingsPage.setDarkModeEnabled(true);

      test.skip(
        !intercepted,
        'DARK_MODE_ASSET_BLOCK_URL_PATTERN did not match any request. Update env var to enable this test.'
      );

      // Expect the application to keep the last successfully applied theme.
      const themeAfter = await readTheme(page);
      expect(themeAfter).toBe(themeBefore);

      // Basic stability/readability guard.
      await expect(page.getByRole('main').or(page.locator('main'))).toBeVisible();
    }
  );

  test(
    'TC_REQ003_01: Should persist Dark Mode preference after closing and reopening the application',
    async ({ page, browser }) => {
      const settingsPage = await ensureSettingsPage(page);
      await settingsPage.setDarkModeEnabled(true);
      await expect.poll(() => readTheme(page)).toBe('dark');

      const storageState = await page.context().storageState();

      const context2 = await browser.newContext({ baseURL, storageState });
      const page2 = await context2.newPage();

      const homePage2 = new HomePage(page2);
      await homePage2.goto(testData.newsletter.homePath);

      await expect.poll(() => readTheme(page2)).toBe('dark');

      await context2.close();
    }
  );

  test(
    'TC_REQ003_02: Should persist Light Mode after disabling Dark Mode and reopening the application',
    async ({ page, browser }) => {
      const settingsPage = await ensureSettingsPage(page);
      await settingsPage.setDarkModeEnabled(false);
      await expect.poll(() => readTheme(page)).not.toBe('dark');

      const storageState = await page.context().storageState();

      const context2 = await browser.newContext({ baseURL, storageState });
      const page2 = await context2.newPage();

      const homePage2 = new HomePage(page2);
      await homePage2.goto(testData.newsletter.homePath);

      expect(await readTheme(page2)).not.toBe('dark');

      await context2.close();
    }
  );

  test(
    'TC_REQ003_03: Should apply default theme after clearing storage/new profile until user sets preference again',
    async ({ browser }) => {
      // Note: Default theme is an open question (OQ_001). We assert "not dark" by default.
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();
      const homePage = new HomePage(page);

      await homePage.goto(testData.newsletter.homePath);

      expect(await readTheme(page)).not.toBe('dark');
      await expect(homePage.mainRegion).toBeVisible();

      await context.close();
    }
  );

  test(
    'TC_REQ003_04: Should safely handle corrupted/invalid stored preference on next launch',
    async ({ browser }) => {
      const context = await browser.newContext({ baseURL });

      await context.addInitScript(
        ({ key, value }) => {
          try {
            window.localStorage.setItem(key, value);
          } catch {
            // ignore
          }
        },
        { key: testData.darkMode.themeStorageKey, value: testData.darkMode.invalidStoredValue }
      );

      const page = await context.newPage();
      const homePage = new HomePage(page);

      const dialogs: string[] = [];
      page.on('dialog', (d) => {
        dialogs.push(d.message());
        d.dismiss().catch(() => undefined);
      });

      await homePage.goto(testData.newsletter.homePath);

      // Stability guard: app should render and not crash.
      await expect(homePage.mainRegion).toBeVisible();

      const theme = await readTheme(page);
      expect(theme).not.toBe('unknown');
      expect(dialogs).toHaveLength(0);

      await context.close();
    }
  );
});