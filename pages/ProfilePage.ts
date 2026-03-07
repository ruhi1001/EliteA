import { Page, Locator } from '@playwright/test';

/**
 * Profile page object.
 * Covers reading and editing authenticated user's profile data.
 */
export class ProfilePage {
  readonly page: Page;

  // Locators
  readonly heading: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly successBanner: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: /profile/i });

    // Prefer accessible labels; CSS fallback supports common ids from legacy UI.
    this.fullNameInput = page
      .getByLabel(/full name|name/i)
      .or(page.locator('#full_name, input[name="full_name"], input[name="fullName"]'));

    this.emailInput = page
      .getByLabel(/email/i)
      .or(page.locator('#email, input[name="email"]'));

    this.phoneInput = page
      .getByLabel(/phone|mobile/i)
      .or(page.locator('#phone, #phone_number, input[name="phone"], input[name="phoneNumber"]'));

    this.addressInput = page
      .getByLabel(/address/i)
      .or(page.locator('#address, input[name="address"]'));

    this.saveButton = page.getByRole('button', { name: /save/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });

    this.successBanner = page.getByRole('status');
    this.errorBanner = page.getByRole('alert');
  }

  // Methods are added incrementally.
}
