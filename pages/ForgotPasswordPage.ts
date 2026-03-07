import { Page, Locator } from '@playwright/test';

/**
 * "Forgot Password" (password reset request) page object.
 */
export class ForgotPasswordPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly confirmationMessage: Locator;
  readonly alertMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.getByLabel(/email/i);
    this.submitButton = page.getByRole('button', { name: /send|submit|reset|email/i });

    // Prefer role=status for non-blocking confirmation; fall back to text-based in tests if needed.
    this.confirmationMessage = page.getByRole('status');
    this.alertMessage = page.getByRole('alert');
  }

  /**
   * Navigates to the Forgot Password page.
   * @param path - Forgot password path relative to baseURL.
   * @returns The current ForgotPasswordPage instance.
   * Maps to: REQ_001, TC_REQ001_02
   */
  async goto(path: string = '/forgot-password'): Promise<this> {
    await this.page.goto(path);
    return this;
  }

  /**
   * Submits a password reset request for a given email.
   * @param email - Email to request password reset for.
   * @returns The current ForgotPasswordPage instance.
   * Maps to: REQ_001, TC_REQ001_01
   */
  async requestPasswordReset(email: string): Promise<this> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
    return this;
  }
}
