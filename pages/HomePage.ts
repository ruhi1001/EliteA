import { Page, Locator } from '@playwright/test';
import { NewsletterSignupForm } from './NewsletterSignupForm';

/**
 * Homepage page object.
 *
 * Hosts the Newsletter signup form component.
 */
export class HomePage {
  readonly page: Page;

  // Locators
  readonly mainRegion: Locator;
  readonly contactLink: Locator;

  // Components
  readonly newsletterSignupForm: NewsletterSignupForm;

  constructor(page: Page) {
    this.page = page;

    this.mainRegion = page.getByRole('main').or(page.locator('main'));
    this.contactLink = page.getByRole('link', { name: /contact/i });

    this.newsletterSignupForm = new NewsletterSignupForm(page);
  }

  /**
   * Navigates to the homepage.
   * @param path - Home path relative to baseURL.
   * @returns The current HomePage instance.
   * Maps to: REQ_001, TC_REQ001_01
   */
  async goto(path: string = '/'): Promise<this> {
    await this.page.goto(path);
    return this;
  }

  /**
   * Navigates away from the homepage to a different route.
   *
   * Tries to click the "Contact" header/footer link if present (real UI navigation),
   * otherwise falls back to direct navigation.
   * @param path - Target path relative to baseURL.
   * @returns The current HomePage instance.
   * Maps to: REQ_001, TC_REQ001_03
   */
  async navigateAway(path: string): Promise<this> {
    try {
      await this.contactLink.first().click({ timeout: 2_000 });
      await this.page.waitForURL('**/*');
    } catch {
      await this.page.goto(path);
    }
    return this;
  }
}