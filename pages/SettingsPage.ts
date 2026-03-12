import { Page, Locator } from '@playwright/test';

/**
 * Settings page object.
 * Hosts user preferences such as Dark Mode.
 */
export class SettingsPage {
  readonly page: Page;

  // Locators
  readonly heading: Locator;
  readonly darkModeToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /settings/i });

    // Prefer accessible controls; fall back to common checkbox/switch patterns.
    this.darkModeToggle = page
      .getByRole('switch', { name: /dark mode/i })
      .or(page.getByLabel(/dark mode/i))
      .or(page.getByRole('checkbox', { name: /dark mode/i }))
      .or(page.getByTestId('dark-mode-toggle'))
      .or(page.locator('#dark-mode, input[name="darkMode"], input[name="dark_mode"]'));
  }

  /**
   * Navigates to the Settings page.
   * @param path - Settings path relative to baseURL.
   * @returns The current SettingsPage instance.
   * Maps to: REQ_001, TC_REQ001_01
   */
  async goto(path: string = '/settings'): Promise<this> {
    await this.page.goto(path);
    return this;
  }

  /**
   * Reads the current toggle state.
   * Supports role=switch via aria-checked and checkbox input via isChecked().
   * @returns True if Dark Mode is enabled; otherwise false.
   * Maps to: REQ_001, TC_REQ001_03
   */
  async isDarkModeEnabled(): Promise<boolean> {
    const ariaChecked = await this.darkModeToggle.getAttribute('aria-checked');
    if (ariaChecked === 'true') return true;
    if (ariaChecked === 'false') return false;

    try {
      return await this.darkModeToggle.isChecked();
    } catch {
      // Last resort: infer from common "checked" attribute.
      const checked = await this.darkModeToggle.getAttribute('checked');
      return checked !== null;
    }
  }

  /**
   * Enables or disables Dark Mode via the Settings toggle.
   * @param enabled - Desired Dark Mode state.
   * @returns The current SettingsPage instance.
   * Maps to: REQ_001, REQ_002, TC_REQ001_03
   */
  async setDarkModeEnabled(enabled: boolean): Promise<this> {
    const current = await this.isDarkModeEnabled();
    if (current !== enabled) {
      await this.darkModeToggle.click();
    }
    return this;
  }

  /**
   * Toggles Dark Mode by clicking the control.
   * @returns The current SettingsPage instance.
   * Maps to: REQ_001, TC_REQ001_03
   */
  async toggleDarkMode(): Promise<this> {
    await this.darkModeToggle.click();
    return this;
  }
}