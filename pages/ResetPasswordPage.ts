import { Page, Locator } from '@playwright/test';

/**
 * Password reset page rendered from a reset token link.
 */
export class ResetPasswordPage {
  readonly page: Page;

  // Locators
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly formHeading: Locator;
  readonly validationMessage: Locator;
  readonly alertMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.formHeading = page.getByRole('heading', { name: /reset password/i });
    this.newPasswordInput = page.getByLabel(/new password/i);
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.submitButton = page.getByRole('button', { name: /reset password|submit|save/i });

    // Generic message containers; exact text asserted in specs.
    this.validationMessage = page.getByRole('status');
    this.successMessage = page.getByRole('status');
    this.alertMessage = page.getByRole('alert');
  }

  /**
   * Navigates to the reset password page using a reset link.
   * @param resetLink - Absolute URL or path containing reset token.
   * @returns The current ResetPasswordPage instance.
   * Maps to: REQ_002, TC_REQ002_01
   */
  async goto(resetLink: string): Promise<this> {
    await this.page.goto(resetLink);
    return this;
  }

  /**
   * Fills in the new password and confirmation fields.
   * @param newPassword - The new password.
   * @param confirmPassword - Confirmation password.
   * @returns The current ResetPasswordPage instance.
   * Maps to: REQ_004, TC_REQ004_01
   */
  async fillPasswords(newPassword: string, confirmPassword: string): Promise<this> {
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword);
    return this;
  }

  /**
   * Submits the password reset form.
   * @returns The current ResetPasswordPage instance.
   * Maps to: REQ_003, TC_REQ003_01
   */
  async submit(): Promise<this> {
    await this.submitButton.click();
    return this;
  }
}
